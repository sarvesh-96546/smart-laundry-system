import sqlite3
import os

DB_PATH = 'cleancare.db'

# ₹49 per laundry item
PRICE_PER_ITEM_INR = 49

def init_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE orders (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            items_count INTEGER NOT NULL,
            status TEXT NOT NULL,
            amount REAL NOT NULL DEFAULT 0.0,
            payment_status TEXT NOT NULL DEFAULT 'Unpaid',
            priority_level TEXT NOT NULL DEFAULT 'Standard',
            service_type TEXT NOT NULL DEFAULT 'General',
            address TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE order_updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            status TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            staff_id INTEGER,
            FOREIGN KEY(order_id) REFERENCES orders(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE staff_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            staff_id INTEGER NOT NULL,
            tasks_completed INTEGER DEFAULT 0,
            avg_time_seconds REAL DEFAULT 0.0,
            efficiency_score REAL DEFAULT 0.0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(staff_id) REFERENCES users(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE machinery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Operational',
            assigned_order_id TEXT,
            cycle_start_time DATETIME,
            expected_end_time DATETIME,
            usage_count INTEGER DEFAULT 0,
            last_service DATE,
            notes TEXT,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(assigned_order_id) REFERENCES orders(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            details TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            stripe_session_id TEXT,
            amount REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(order_id) REFERENCES orders(id)
        )
    ''')

    # Seed users
    cursor.execute("INSERT INTO users (username, password, role) VALUES ('admin@gmail.com', 'admin123', 'admin')")
    cursor.execute("INSERT INTO users (username, password, role) VALUES ('staff', 'staff123', 'staff')")

    # Seed orders with Priority Levels
    orders = [
        ('LD-00001', 'Priya Sharma',   '9876543210', 5,  'Received',          245.0, 'Unpaid', 'Standard', 'Wash & Fold'),
        ('LD-00002', 'Rahul Gupta',    '9123456780', 12, 'Washing',           588.0, 'Paid',   'Express',  'Wash & Fold'),
        ('LD-00003', 'Anita Desai',    '9988776655', 3,  'Ready for Pickup',  147.0, 'Unpaid', 'VIP',      'Dry Clean'),
        ('LD-00004', 'Suresh Kumar',   '9871234560', 8,  'Drying',            392.0, 'Unpaid', 'Standard', 'Wash & Fold'),
        ('LD-00005', 'Meena Joshi',    '9012345678', 6,  'Ironing',           294.0, 'Paid',   'Standard', 'Ironing'),
    ]
    cursor.executemany(
        "INSERT INTO orders (id, customer_name, phone, items_count, status, amount, payment_status, priority_level, service_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        orders
    )

    updates = [
        ('LD-00001', 'Received'),
        ('LD-00002', 'Received'), ('LD-00002', 'Washing'),
        ('LD-00003', 'Received'), ('LD-00003', 'Washing'), ('LD-00003', 'Drying'), ('LD-00003', 'Ready for Pickup'),
        ('LD-00004', 'Received'), ('LD-00004', 'Washing'), ('LD-00004', 'Drying'),
        ('LD-00005', 'Received'), ('LD-00005', 'Washing'), ('LD-00005', 'Drying'), ('LD-00005', 'Ironing'),
    ]
    cursor.executemany("INSERT INTO order_updates (order_id, status) VALUES (?, ?)", updates)

    # Sample payment record
    cursor.execute(
        "INSERT INTO payments (order_id, stripe_session_id, amount, status) VALUES (?, ?, ?, ?)",
        ('LD-00002', 'cs_test_demo', 588.0, 'paid')
    )
    cursor.execute(
        "INSERT INTO payments (order_id, stripe_session_id, amount, status) VALUES (?, ?, ?, ?)",
        ('LD-00005', 'cs_test_demo2', 294.0, 'paid')
    )

    # Seed machinery
    machines = [
        ('Washer 1',      'Washing Machine',  'Operational',       '2026-02-15', 'Front-load, 10kg capacity'),
        ('Washer 2',      'Washing Machine',  'Under Maintenance',  '2026-01-10', 'Belt replacement in progress'),
        ('Dryer 1',       'Dryer',            'Operational',       '2026-03-01', 'Gas dryer, 8kg capacity'),
        ('Dryer 2',       'Dryer',            'Operational',       '2026-02-20', 'Electric dryer, 6kg capacity'),
        ('Iron Press 1',  'Steam Iron Press', 'Operational',       '2026-03-10', 'Heavy-duty steam press'),
        ('Iron Press 2',  'Steam Iron Press', 'Offline',           '2025-12-05', 'Awaiting spare parts'),
        ('Dry Cleaner 1', 'Dry Cleaning',     'Operational',       '2026-03-05', 'PERC-free solvent machine'),
        ('Folding Table', 'Folding Station',  'Operational',       '2026-02-28', 'Automated folding unit'),
    ]
    cursor.executemany(
        "INSERT INTO machinery (name, type, status, last_service, notes) VALUES (?, ?, ?, ?, ?)",
        machines
    )

    conn.commit()
    conn.close()
    print("Database initialized with INR pricing, machinery, and sample data.")

if __name__ == '__main__':
    init_db()
