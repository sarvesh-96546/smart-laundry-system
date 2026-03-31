const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../laundry.db');

const initDB = async () => {
    const db = new sqlite3.Database(dbPath);
    console.log('Connected to SQLite Database.');

    const runQuery = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    };

    const getQuery = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    try {
        // 1. Users Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT CHECK(role IN ('admin', 'staff', 'customer')) DEFAULT 'customer',
                phone_number TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table ensured.');

        // 2. Orders Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                customer_id INTEGER,
                customer_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT,
                notes TEXT,
                items_count INTEGER DEFAULT 1,
                status TEXT DEFAULT 'Pending',
                amount REAL DEFAULT 0.0,
                payment_status TEXT DEFAULT 'Unpaid',
                priority_level TEXT DEFAULT 'Standard',
                service_type TEXT DEFAULT 'General',
                assigned_staff_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(customer_id) REFERENCES users(id),
                FOREIGN KEY(assigned_staff_id) REFERENCES users(id)
            )
        `);
        console.log('Orders table ensured.');

        // 3. Order Updates Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS order_updates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                status TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(order_id) REFERENCES orders(id)
            )
        `);
        console.log('Order Updates table ensured.');

        // 4. Machinery Table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS machinery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT DEFAULT 'Operational',
                assigned_order_id TEXT,
                cycle_start_time DATETIME,
                expected_end_time DATETIME,
                usage_count INTEGER DEFAULT 0,
                last_service DATETIME,
                notes TEXT,
                FOREIGN KEY(assigned_order_id) REFERENCES orders(id)
            )
        `);
        console.log('Machinery table ensured.');

        // 5. Seed Initial Admin User
        const adminRows = await getQuery('SELECT * FROM users WHERE role = "admin" LIMIT 1');
        if (adminRows.length === 0) {
            const adminPassword = 'adminpassword'; 
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await runQuery(
                'INSERT INTO users (name, email, password, role, phone_number) VALUES (?, ?, ?, ?, ?)',
                ['System Admin', 'admin@lms.com', hashedPassword, 'admin', '0000000000']
            );
            console.log('Admin user seeded.');
        }

        // 6. Seed Initial Machinery
        const machineRows = await getQuery('SELECT * FROM machinery LIMIT 1');
        if (machineRows.length === 0) {
            const initialMachines = [
                ['Unit Alpha', 'Washing Machine'],
                ['Unit Beta', 'Washing Machine'],
                ['Dryer X1', 'Dryer'],
                ['Pulse Iron', 'Steam Iron Press']
            ];
            for (const [name, type] of initialMachines) {
                await runQuery('INSERT INTO machinery (name, type) VALUES (?, ?)', [name, type]);
            }
            console.log('Initial machinery seeded.');
        }

        console.log('Database initialization complete.');
    } catch (error) {
        console.error('Initialization failed:', error);
    } finally {
        db.close();
    }
};

initDB();
