import sqlite3
import random
import qrcode
import base64
import hmac
import hashlib
import razorpay
from io import BytesIO
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = 'cleancare_super_secret_2024'
CORS(app)  # Enable CORS for React integration
DB_PATH = 'cleancare.db'

# ---------------------------------------------------------------------------
# Razorpay Configuration
# Sign up FREE at https://dashboard.razorpay.com → Settings → API Keys
# Supports UPI, Cards, NetBanking, Wallets — 100% Indian gateway
# ---------------------------------------------------------------------------
RAZORPAY_KEY_ID     = 'rzp_test_YOUR_KEY_ID_HERE'
RAZORPAY_KEY_SECRET = 'YOUR_KEY_SECRET_HERE'

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# ₹49 per item (can be updated by admin via /staff/pricing)
PRICE_PER_ITEM_INR = 49
_runtime_price = {'value': PRICE_PER_ITEM_INR}

# Flask-SocketIO
socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins='*')

STATUS_STEPS = ['Received', 'Washing', 'Drying', 'Ironing', 'Ready', 'Delivered']

MACHINE_STATUSES = ['Operational', 'Under Maintenance', 'Offline']
MACHINE_TYPES    = ['Washing Machine', 'Dryer', 'Steam Iron Press', 'Dry Cleaning', 'Folding Station', 'Other']

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def log_audit(conn, action, details):
    conn.execute('INSERT INTO audit_logs (action, details) VALUES (?, ?)', (action, details))

def staff_required(fn):
    """Decorator: redirect to staff login if not authenticated."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to continue.', 'error')
            return redirect(url_for('staff_login'))
        return fn(*args, **kwargs)
    return wrapper

def admin_required(fn):
    """Decorator: redirect if not admin."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if session.get('role') != 'admin':
            flash('Access denied. Admins only.', 'error')
            return redirect(url_for('staff_dashboard'))
        return fn(*args, **kwargs)
    return wrapper

# ---------------------------------------------------------------------------
# CUSTOMER PORTAL
# ---------------------------------------------------------------------------

@app.route('/', methods=['GET', 'POST'])
def index():
    order, updates, qr_base64 = None, [], None
    order_id = request.form.get('order_id', request.args.get('order_id', '')).strip()
    if order_id:
        conn = get_db()
        row = conn.execute('SELECT * FROM orders WHERE id = ?', (order_id,)).fetchone()
        if row:
            order = dict(row)
            updates = [dict(u) for u in conn.execute(
                'SELECT * FROM order_updates WHERE order_id = ? ORDER BY timestamp DESC', (order_id,)
            ).fetchall()]
            qr_url = url_for('index', _external=True) + f'?order_id={order_id}'
            buf = BytesIO()
            qrcode.make(qr_url).save(buf, format='PNG')
            qr_base64 = base64.b64encode(buf.getvalue()).decode()
        else:
            flash('Order not found. Please check the ID and try again.', 'error')
        conn.close()
    return render_template('index.html', order=order, updates=updates,
                           status_steps=STATUS_STEPS, qr_code=qr_base64)

# ---------------------------------------------------------------------------
# PAYMENT ROUTES — Razorpay (Customer only, 100% India-native)
# ---------------------------------------------------------------------------

@app.route('/pay/<order_id>')
def pay(order_id):
    """Creates a Razorpay order and shows the checkout page."""
    conn = get_db()
    order = conn.execute('SELECT * FROM orders WHERE id = ?', (order_id,)).fetchone()
    conn.close()
    if not order:
        flash('Order not found.', 'error')
        return redirect(url_for('index'))
    if order['payment_status'] == 'Paid':
        flash('This order is already paid.', 'info')
        return redirect(url_for('index') + f'?order_id={order_id}')

    amount_paise = int(order['amount'] * 100)  # Razorpay requires paise (₹1 = 100 paise)

    try:
        rz_order = razorpay_client.order.create({
            'amount':   amount_paise,
            'currency': 'INR',
            'receipt':  order_id,
            'notes':    {
                'order_id':       order_id,
                'customer_name':  order['customer_name'],
            }
        })
        return render_template(
            'payment_checkout.html',
            order=dict(order),
            rz_order_id=rz_order['id'],
            key_id=RAZORPAY_KEY_ID
        )
    except Exception as e:
        # If keys not yet configured, show instructions page
        if 'rzp_test_YOUR_KEY' in RAZORPAY_KEY_ID:
            return render_template('payment_setup.html', order=dict(order))
        flash(f'Payment error: {str(e)}', 'error')
        return redirect(url_for('index') + f'?order_id={order_id}')


@app.route('/payment-verify/<order_id>', methods=['POST'])
def payment_verify(order_id):
    """Verifies Razorpay payment signature (HMAC-SHA256) and marks order paid."""
    try:
        params = {
            'razorpay_order_id':   request.form['razorpay_order_id'],
            'razorpay_payment_id': request.form['razorpay_payment_id'],
            'razorpay_signature':  request.form['razorpay_signature'],
        }
        razorpay_client.utility.verify_payment_signature(params)

        # Signature valid — mark as paid
        conn = get_db()
        order = conn.execute('SELECT * FROM orders WHERE id = ?', (order_id,)).fetchone()
        if order and order['payment_status'] != 'Paid':
            conn.execute('UPDATE orders SET payment_status = ? WHERE id = ?', ('Paid', order_id))
            conn.execute(
                'INSERT INTO payments (order_id, stripe_session_id, amount, status) VALUES (?, ?, ?, ?)',
                (order_id, params['razorpay_payment_id'], order['amount'], 'paid')
            )
            log_audit(conn, 'PAYMENT_RECEIVED',
                      f"₹{order['amount']} via Razorpay ({params['razorpay_payment_id']}) for {order_id}")
            conn.commit()
            socketio.emit('payment_confirmed', {
                'order_id': order_id,
                'amount':   order['amount'],
                'customer': order['customer_name']
            })
        conn.close()
        return redirect(url_for('payment_success', order_id=order_id))

    except razorpay.errors.SignatureVerificationError:
        flash('Payment verification failed. Please contact support.', 'error')
        return redirect(url_for('index') + f'?order_id={order_id}')
    except Exception as e:
        flash(f'Payment error: {str(e)}', 'error')
        return redirect(url_for('index') + f'?order_id={order_id}')


@app.route('/payment-success/<order_id>')
def payment_success(order_id):
    return render_template('payment_success.html', order_id=order_id)


@app.route('/payment-cancel/<order_id>')
def payment_cancel(order_id):
    return render_template('payment_cancel.html', order_id=order_id)

# ---------------------------------------------------------------------------
# JSON API ROUTES (For React SPA)
# ---------------------------------------------------------------------------

@app.route('/api/orders', methods=['GET'])
def api_get_orders():
    """Returns all orders for the admin dashboard."""
    conn = get_db()
    # Sort by VIP > Express > Standard, then by newest
    orders = conn.execute('''
        SELECT * FROM orders 
        ORDER BY CASE priority_level 
            WHEN 'VIP' THEN 1 
            WHEN 'Express' THEN 2 
            ELSE 3 
        END, created_at DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(o) for o in orders])

@app.route('/api/orders', methods=['POST'])
def api_create_order():
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        print(f"DEBUG: Received order data: {data}") # Basic logging
        
        customer_name = data.get('customer_name')
        phone         = data.get('phone')
        address       = data.get('address', '')
        notes         = data.get('notes', '')
        priority      = data.get('priority_level', 'Standard')
        service_type  = data.get('service_type', 'General')
        items_count   = int(data.get('items_count', 1))
        
        # Prefer amount from frontend if provided, otherwise calculate
        amount = data.get('amount')
        if amount is None:
            amount = round(items_count * _runtime_price['value'], 2)
        else:
            amount = float(amount)

        order_id = f'LD-{random.randint(10000, 99999):05d}'
        conn = get_db()
        try:
            conn.execute(
                'INSERT INTO orders (id, customer_name, phone, address, notes, items_count, status, amount, payment_status, priority_level, service_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (order_id, customer_name, phone, address, notes, items_count, 'Received', amount, 'Unpaid', priority, service_type)
            )
            conn.execute('INSERT INTO order_updates (order_id, status) VALUES (?, ?)', (order_id, 'Received'))
            conn.commit()
            print(f"DEBUG: Order {order_id} saved horizontally.")
        except sqlite3.Error as db_err:
            print(f"CRITICAL: DB Error saving order: {db_err}")
            return jsonify({'success': False, 'error': f'Database failure: {str(db_err)}'}), 500
        finally:
            conn.close()

        socketio.emit('new_order', {
            'order_id': order_id, 
            'customer': customer_name, 
            'amount': amount, 
            'priority': priority,
            'service': service_type
        })
        
        return jsonify({'success': True, 'order_id': order_id, 'amount': amount})
        
    except Exception as e:
        print(f"CRITICAL: Unexpected error in api_create_order: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/machinery', methods=['GET'])
def api_get_machinery():
    conn = get_db()
    # Join with orders to get assigned customer info
    machines = conn.execute('''
        SELECT m.*, o.customer_name as assigned_customer
        FROM machinery m
        LEFT JOIN orders o ON m.assigned_order_id = o.id
        ORDER BY m.type, m.name
    ''').fetchall()
    conn.close()
    return jsonify([dict(m) for m in machines])

@app.route('/api/machines/<int:machine_id>/start', methods=['POST'])
def api_start_machine(machine_id):
    data = request.json
    order_id = data.get('order_id')
    duration_mins = int(data.get('duration', 30))
    
    from datetime import datetime, timedelta
    start_time = datetime.now()
    end_time = start_time + timedelta(minutes=duration_mins)

    conn = get_db()
    conn.execute('''
        UPDATE machinery 
        SET assigned_order_id = ?, 
            cycle_start_time = ?, 
            expected_end_time = ?,
            status = 'Running',
            usage_count = usage_count + 1
        WHERE id = ?
    ''', (order_id, start_time, end_time, machine_id))
    
    # Auto-update order status based on machine type
    machine_row = conn.execute('SELECT type FROM machinery WHERE id = ?', (machine_id,)).fetchone()
    new_status = 'Washing' if 'Washing Machine' in machine_row['type'] else 'Drying' # Changed 'Washer' to 'Washing Machine' for consistency
    conn.execute('UPDATE orders SET status = ? WHERE id = ?', (new_status, order_id))
    conn.execute('INSERT INTO order_updates (order_id, status) VALUES (?, ?)', (order_id, new_status))
    
    conn.commit()
    conn.close()

    socketio.emit('machine_update', {'machine_id': machine_id, 'order_id': order_id, 'status': 'Running', 'end_time': end_time.isoformat()})
    socketio.emit('status_update', {'order_id': order_id, 'new_status': new_status})
    return jsonify({'success': True, 'end_time': end_time.isoformat()})

@app.route('/api/machines/<int:machine_id>/stop', methods=['POST'])
def api_stop_machine(machine_id):
    conn = get_db()
    machine_row = conn.execute('SELECT assigned_order_id, type FROM machinery WHERE id = ?', (machine_id,)).fetchone()
    order_id = machine_row['assigned_order_id'] if machine_row else None

    conn.execute('''
        UPDATE machinery 
        SET assigned_order_id = NULL, 
            cycle_start_time = NULL, 
            expected_end_time = NULL,
            status = 'Operational'
        WHERE id = ?
    ''', (machine_id,))
    
    if order_id:
        # Move to next logical stage
        next_status = 'Drying' if 'Washing Machine' in machine_row['type'] else 'Ironing' # Changed 'Washer' to 'Washing Machine' for consistency
        conn.execute('UPDATE orders SET status = ? WHERE id = ?', (next_status, order_id))
        conn.execute('INSERT INTO order_updates (order_id, status) VALUES (?, ?)', (order_id, next_status))
        socketio.emit('status_update', {'order_id': order_id, 'new_status': next_status})

    conn.commit()
    conn.close()

    socketio.emit('machine_update', {'machine_id': machine_id, 'status': 'Operational'})
    socketio.emit('notification', {'title': 'Cycle Complete', 'message': f'Machine {machine_id} has finished its task.'})
    return jsonify({'success': True})

@app.route('/api/customers', methods=['GET'])
def api_get_customers():
    """Returns aggregated customer data from orders table."""
    conn = get_db()
    # Group by phone/name to get unique customers
    rows = conn.execute('''
        SELECT customer_name as name, phone, 
               COUNT(*) as order_count, 
               SUM(amount) as total_spent,
               MAX(created_at) as last_order
        FROM orders 
        GROUP BY phone 
        ORDER BY last_order DESC
    ''').fetchall()
    conn.close()
    
    customers = []
    for i, r in enumerate(rows):
        customers.append({
            'id': i + 1,
            'name': r['name'],
            'phone': r['phone'],
            'orders': r['order_count'],
            'spent': f"₹{r['total_spent']:,}",
            'status': 'Active', # Simplified logic
            'email': f"{r['name'].lower().replace(' ', '.')}@example.com" # Placeholder
        })
    return jsonify(customers)

@app.route('/api/orders/<order_id>/status', methods=['POST'])
def api_update_order_status(order_id):
    """Updates order status and emits change."""
    data = request.json
    new_status = data.get('status')
    if not new_status:
        return jsonify({'error': 'No status provided'}), 400

    conn = get_db()
    
    # Optional payment check
    order = conn.execute('SELECT payment_status FROM orders WHERE id = ?', (order_id,)).fetchone()
    if new_status == 'Ready' and order and order['payment_status'] != 'Paid': # Changed 'Ready' to 'Ready' for consistency
        # Log it but don't necessarily block unless business rule is strict
        # For this requirement, we will allow it but send a warning pulse in UI
        pass

    conn.execute('UPDATE orders SET status = ? WHERE id = ?', (new_status, order_id))
    conn.execute('INSERT INTO order_updates (order_id, status) VALUES (?, ?)', (order_id, new_status))
    conn.commit()
    conn.close()

    socketio.emit('status_update', {'order_id': order_id, 'new_status': new_status})
    return jsonify({'success': True})

@app.route('/api/orders/<order_id>', methods=['GET'])
def api_get_order(order_id):
    conn = get_db()
    order = conn.execute('SELECT * FROM orders WHERE id = ?', (order_id,)).fetchone()
    updates = conn.execute('SELECT * FROM order_updates WHERE order_id = ? ORDER BY timestamp DESC', (order_id,)).fetchall()
    conn.close()

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    return jsonify({
        'order': dict(order),
        'updates': [dict(u) for u in updates]
    })

@app.route('/api/orders/phone/<phone>', methods=['GET'])
def api_get_order_by_phone(phone):
    conn = get_db()
    order = conn.execute('SELECT id FROM orders WHERE phone = ? ORDER BY created_at DESC LIMIT 1', (phone,)).fetchone()
    conn.close()

    if not order:
        return jsonify({'error': 'No orders found for this identifier'}), 404

    return jsonify({'order_id': order['id']})

@app.route('/api/stats', methods=['GET'])
def api_get_stats():
    """Returns summarized data for dashboard analytics."""
    conn = get_db()
    orders = conn.execute('SELECT * FROM orders').fetchall()
    conn.close()
    
    # Basic math in Python for demo; could be SQL
    total_revenue = sum(o['amount'] for o in orders if o['payment_status'] == 'Paid')
    in_progress   = sum(1 for o in orders if o['status'] not in ['Delivered', 'Ready'])
    ready         = sum(1 for o in orders if o['status'] == 'Ready')
    
    # Chart data (dummy grouping by date for now)
    # real implementation would group by date(created_at)
    from collections import Counter
    dates = [o['created_at'].split(' ')[0] for o in orders]
    chart_data = [{'date': d, 'orders': c} for d, c in Counter(dates).items()]

    return jsonify({
        'revenue': total_revenue,
        'in_progress': in_progress,
        'ready': ready,
        'total_orders': len(orders),
        'chart_data': sorted(chart_data, key=lambda x: x['date'])[-7:] # Last 7 days
    })

# ---------------------------------------------------------------------------
# STAFF PORTAL — Auth
# ---------------------------------------------------------------------------

@app.route('/staff/login', methods=['GET', 'POST'])
def staff_login():
    if 'user_id' in session:
        return redirect(url_for('staff_dashboard'))
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = get_db()
        user = conn.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?', (username, password)
        ).fetchone()
        conn.close()
        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            return redirect(url_for('staff_dashboard'))
        flash('Invalid credentials.', 'error')
    return render_template('staff_login.html')

@app.route('/staff/logout')
def staff_logout():
    session.clear()
    return redirect(url_for('staff_login'))

# ---------------------------------------------------------------------------
# STAFF PORTAL — Dashboard
# ---------------------------------------------------------------------------

@app.route('/staff/dashboard')
@staff_required
def staff_dashboard():
    conn = get_db()
    orders = conn.execute('SELECT * FROM orders ORDER BY created_at DESC').fetchall()
    total   = len(orders)
    in_prog = sum(1 for o in orders if o['status'] not in ['Delivered', 'Ready'])
    ready   = sum(1 for o in orders if o['status'] == 'Ready')
    delivered = sum(1 for o in orders if o['status'] == 'Delivered')
    revenue = sum(o['amount'] for o in orders if o['payment_status'] == 'Paid')

    machines = conn.execute('SELECT * FROM machinery ORDER BY name').fetchall()
    mach_ok  = sum(1 for m in machines if m['status'] == 'Operational')
    mach_mnt = sum(1 for m in machines if m['status'] == 'Under Maintenance')
    mach_off = sum(1 for m in machines if m['status'] == 'Offline')

    users = conn.execute('SELECT id, username, role FROM users LIMIT 10').fetchall()
    total_users = conn.execute('SELECT COUNT(*) as c FROM users').fetchone()['c']
    aov = revenue / total if total > 0 else 0

    conn.close()

    return render_template('staff_dashboard.html',
        orders=orders, status_steps=STATUS_STEPS,
        analytics={
            'total': total, 'in_progress': in_prog, 'ready': ready,
            'delivered': delivered, 'revenue': round(revenue, 2),
            'aov': round(aov, 2), 'active_users': total_users
        },
        machines=machines,
        mach_stats={'ok': mach_ok, 'maintenance': mach_mnt, 'offline': mach_off},
        users=users
    )

@app.route('/staff/new-order', methods=['GET', 'POST'])
@staff_required
def staff_new_order():
    if request.method == 'POST':
        customer_name = request.form['customer_name']
        phone         = request.form['phone']
        items_count   = int(request.form['items_count'])
        amount        = round(items_count * PRICE_PER_ITEM_INR, 2)

        random_num = random.randint(10000, 99999)
        order_id   = f'LD-{random_num:05d}'
        conn = get_db()
        while conn.execute('SELECT id FROM orders WHERE id = ?', (order_id,)).fetchone():
            order_id = f'LD-{random.randint(10000,99999):05d}'

        conn.execute(
            'INSERT INTO orders (id, customer_name, phone, items_count, status, amount, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (order_id, customer_name, phone, items_count, 'Received', amount, 'Unpaid')
        )
        conn.execute('INSERT INTO order_updates (order_id, status) VALUES (?, ?)', (order_id, 'Received'))
        conn.commit()
        conn.close()

        qr_url = url_for('index', _external=True) + f'?order_id={order_id}'
        buf = BytesIO()
        qrcode.make(qr_url).save(buf, format='PNG')
        qr_base64 = base64.b64encode(buf.getvalue()).decode()

        socketio.emit('new_order', {'order_id': order_id, 'customer': customer_name, 'amount': amount})
        flash(f'Order {order_id} created! Amount: ₹{amount:.2f}', 'success')
        return render_template('staff_new_order.html', qr_code=qr_base64, order_id=order_id, amount=amount)
    return render_template('staff_new_order.html')

@app.route('/staff/update-order/<order_id>', methods=['POST'])
@staff_required
def staff_update_order(order_id):
    new_status = request.form.get('new_status')
    if not new_status:
        conn = get_db()
        order = conn.execute('SELECT status FROM orders WHERE id = ?', (order_id,)).fetchone()
        if order and order['status'] in STATUS_STEPS:
            idx = STATUS_STEPS.index(order['status'])
            if idx < len(STATUS_STEPS) - 1:
                new_status = STATUS_STEPS[idx + 1]
        conn.close()
    if new_status and new_status in STATUS_STEPS:
        conn = get_db()
        conn.execute('UPDATE orders SET status = ? WHERE id = ?', (new_status, order_id))
        conn.execute('INSERT INTO order_updates (order_id, status) VALUES (?, ?)', (order_id, new_status))
        log_audit(conn, 'UPDATE_STATUS',
                  f"Order {order_id} → {new_status} by {session.get('username')}")
        conn.commit()
        conn.close()
        flash(f'Order {order_id} updated to {new_status}', 'success')
        socketio.emit('status_update', {
            'order_id': order_id, 'new_status': new_status,
            'updated_by': session.get('username', 'Staff')
        })
    return redirect(url_for('staff_dashboard'))

# ---------------------------------------------------------------------------
# STAFF PORTAL — Machinery Management
# ---------------------------------------------------------------------------

@app.route('/staff/machinery')
@staff_required
def staff_machinery():
    conn = get_db()
    machines = conn.execute('SELECT * FROM machinery ORDER BY type, name').fetchall()
    conn.close()
    return render_template('staff_machinery.html',
                           machines=machines,
                           machine_statuses=MACHINE_STATUSES,
                           machine_types=MACHINE_TYPES)

@app.route('/staff/machinery/add', methods=['POST'])
@staff_required
def staff_machinery_add():
    name         = request.form['name'].strip()
    mtype        = request.form['type']
    status       = request.form['status']
    last_service = request.form.get('last_service') or None
    notes        = request.form.get('notes', '').strip()
    conn = get_db()
    conn.execute(
        'INSERT INTO machinery (name, type, status, last_service, notes) VALUES (?, ?, ?, ?, ?)',
        (name, mtype, status, last_service, notes)
    )
    log_audit(conn, 'MACHINE_ADD', f"Added machine: {name} ({mtype})")
    conn.commit()
    conn.close()
    flash(f'Machine "{name}" added successfully.', 'success')
    return redirect(url_for('staff_machinery'))

@app.route('/staff/machinery/update/<int:machine_id>', methods=['POST'])
@staff_required
def staff_machinery_update(machine_id):
    new_status   = request.form['status']
    last_service = request.form.get('last_service') or None
    notes        = request.form.get('notes', '').strip()
    conn = get_db()
    conn.execute(
        'UPDATE machinery SET status = ?, last_service = ?, notes = ? WHERE id = ?',
        (new_status, last_service, notes, machine_id)
    )
    log_audit(conn, 'MACHINE_UPDATE', f"Machine #{machine_id} status → {new_status}")
    conn.commit()
    conn.close()
    flash('Machine updated.', 'success')
    return redirect(url_for('staff_machinery'))

@app.route('/staff/machinery/delete/<int:machine_id>', methods=['POST'])
@staff_required
@admin_required
def staff_machinery_delete(machine_id):
    conn = get_db()
    machine = conn.execute('SELECT name FROM machinery WHERE id = ?', (machine_id,)).fetchone()
    conn.execute('DELETE FROM machinery WHERE id = ?', (machine_id,))
    log_audit(conn, 'MACHINE_DELETE', f"Deleted machine: {machine['name'] if machine else machine_id}")
    conn.commit()
    conn.close()
    flash('Machine deleted.', 'success')
    return redirect(url_for('staff_machinery'))

# ---------------------------------------------------------------------------
# STAFF PORTAL — Admin only (Roles, Audit Logs)
# ---------------------------------------------------------------------------

@app.route('/staff/roles')
@staff_required
@admin_required
def staff_roles():
    conn = get_db()
    users = conn.execute('SELECT id, username, role FROM users').fetchall()
    conn.close()
    return render_template('roles.html', users=users)

@app.route('/staff/audit-logs')
@staff_required
@admin_required
def staff_audit_logs():
    conn = get_db()
    logs = conn.execute('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').fetchall()
    conn.close()
    return render_template('audit.html', logs=logs)

# ---------------------------------------------------------------------------
# STAFF PORTAL — Customers Page
# ---------------------------------------------------------------------------

@app.route('/staff/customers')
@staff_required
def staff_customers():
    conn = get_db()
    users = conn.execute('SELECT id, username, role FROM users').fetchall()
    conn.close()
    return render_template('customers.html', users=users)

# ---------------------------------------------------------------------------
# STAFF PORTAL — Pricing Page
# ---------------------------------------------------------------------------

@app.route('/staff/pricing', methods=['GET', 'POST'])
@staff_required
def staff_pricing():
    global _runtime_price
    if request.method == 'POST' and session.get('role') == 'admin':
        try:
            new_price = int(request.form.get('price', _runtime_price['value']))
            if new_price > 0:
                _runtime_price['value'] = new_price
                log_audit(get_db(), 'PRICE_UPDATE', f"Price updated to ₹{new_price}/item by {session.get('username')}")
                flash(f'Base price updated to ₹{new_price}/item.', 'success')
        except ValueError:
            flash('Invalid price value.', 'error')
    return render_template('pricing.html', price_per_item=_runtime_price['value'])

@app.route('/staff/api/price-update', methods=['POST'])
@staff_required
@admin_required
def admin_update_price():
    global _runtime_price
    try:
        new_price = int(request.form.get('price', _runtime_price['value']))
        if new_price > 0:
            _runtime_price['value'] = new_price
            flash(f'Base price updated to ₹{new_price}/item.', 'success')
    except ValueError:
        flash('Invalid price value.', 'error')
    return redirect(url_for('staff_pricing'))

# ---------------------------------------------------------------------------
# Legacy route redirects (keep old URLs working)
# ---------------------------------------------------------------------------

@app.route('/login')
def login():
    return redirect(url_for('staff_login'))

@app.route('/admin')
@staff_required
@admin_required
def admin():
    conn = get_db()
    orders = conn.execute('SELECT * FROM orders ORDER BY created_at DESC').fetchall()
    revenue = sum(o['amount'] for o in orders if o['payment_status'] == 'Paid')
    
    # Active orders (not delivered)
    active = sum(1 for o in orders if o['status'] != 'Delivered')
    pending_delivery = sum(1 for o in orders if o['status'] == 'Ready')
    
    conn.close()
    
    return render_template('admin.html',
                           orders=orders,
                           status_steps=STATUS_STEPS,
                           analytics={'revenue': revenue, 'total': len(orders), 'active': active, 'pending_delivery': pending_delivery})

# ---------------------------------------------------------------------------
# SocketIO
# ---------------------------------------------------------------------------

@socketio.on('connect')
def handle_connect():
    emit('connected', {'message': 'Real-time active!'})

# ---------------------------------------------------------------------------
# PWA Service Worker
# ---------------------------------------------------------------------------

@app.route('/sw.js')
def sw():
    response = app.send_static_file('sw.js')
    response.headers['Cache-Control'] = 'no-cache'
    return response

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5001, use_reloader=False)
