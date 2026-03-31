const db = require('../config/db');

const statusSequence = ['Pending', 'Washing', 'Drying', 'Ironing', 'Completed', 'Delivered'];

const createOrder = async (req, res) => {
    const { customer_name, phone, address, notes, items_count, amount, priority_level, service_type } = req.body;
    const orderId = `LD-${Math.floor(10000 + Math.random() * 90000)}`;
    const customer_id = req.userId || req.body.customer_id; // Priority to token ID

    console.log(`[ORDER_REQUEST] Creating order ${orderId} for Customer ID: ${customer_id}`);

    try {
        // Validation
        if (!service_type) {
            return res.status(400).json({ success: false, error: 'Missing required field: service_type' });
        }
        if (!customer_id && !customer_name) {
            return res.status(400).json({ success: false, error: 'Missing required field: customer_id or customer_name' });
        }

        await db.execute(
            'INSERT INTO orders (id, customer_id, customer_name, phone, address, notes, items_count, amount, priority_level, service_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [orderId, customer_id, customer_name || 'Walk-in', phone || '0000000000', address, notes, items_count || 1, amount || 0, priority_level || 'Standard', service_type, 'Pending']
        );

        await db.execute('INSERT INTO order_updates (order_id, status) VALUES (?, ?)', [orderId, 'Pending']);

        // Fetch the created order to return it
        const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        const newOrder = rows[0];

        // Emit Socket Event
        const io = req.app.get('io');
        io.emit('new_order', { 
            order_id: orderId, 
            customer_name: newOrder.customer_name, 
            priority: newOrder.priority_level 
        });

        console.log(`[ORDER_SUCCESS] Order ${orderId} created successfully.`);
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error(`[ORDER_ERROR] Failed to create order ${orderId}:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        console.log(`[GET_ORDERS] Role: ${req.userRole}, UserID: ${req.userId}`);
    let query = 'SELECT * FROM orders';
        let params = [];

        if (req.userRole === 'staff') {
            query += ' WHERE assigned_staff_id = ?';
            params.push(req.userId);
        } else if (req.userRole === 'customer') {
            query += ' WHERE customer_id = ?';
            params.push(req.userId);
        }
        // Admin sees all, so no WHERE clause needed

        query += ' ORDER BY created_at DESC';
        const [orders] = await db.execute(query, params);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrderById = async (req, res) => {
    const id = req.params.id;
    console.log(`[GET_ORDER_BY_ID] Params ID: ${id}, Role: ${req.userRole}, UserID: ${req.userId}`);
    try {
        const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);
        const [updates] = await db.execute('SELECT * FROM order_updates WHERE order_id = ? ORDER BY timestamp DESC', [id]);
        
        if (orders.length === 0) {
            console.warn(`[GET_ORDER_BY_ID] Order ${id} not found.`);
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = orders[0];
        // Security: Customers can only see their own orders
        if (req.userRole === 'customer' && order.customer_id !== req.userId) {
            console.warn(`[GET_ORDER_BY_ID] Unauthorized access attempt for order ${id} by User ${req.userId}`);
            return res.status(403).json({ error: 'Unauthorized to view this order' });
        }

        res.json({ order, updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    try {
        // 1. Fetch current order
        const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });
        
        const currentOrder = orders[0];
        const currentStatus = currentOrder.status;

        // 2. Validate role
        if (req.userRole !== 'staff' && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized: Only Staff or Admin can update status' });
        }

        // 3. Validate transition
        const currentIndex = statusSequence.indexOf(currentStatus);
        const nextIndex = statusSequence.indexOf(status);

        if (nextIndex === -1) {
            return res.status(400).json({ error: `Invalid status: ${status}. Must be one of ${statusSequence.join(', ')}` });
        }

        if (nextIndex !== currentIndex + 1 && req.userRole !== 'admin') {
            return res.status(400).json({ 
                error: `Invalid transition from ${currentStatus} to ${status}. Expected ${statusSequence[currentIndex + 1]}` 
            });
        }

        // 4. Update order
        await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        
        // 5. Log update
        await db.execute('INSERT INTO order_updates (order_id, status) VALUES (?, ?)', [orderId, status]);
        
        // 6. Emit Socket Event
        const io = req.app.get('io');
        io.emit('status_update', { order_id: orderId, new_status: status });

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
