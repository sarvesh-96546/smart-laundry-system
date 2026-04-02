const { pool } = require('../auth');

const statusSequence = ['Pending', 'Washing', 'Drying', 'Ironing', 'Completed', 'Delivered'];

const createOrder = async (req, res) => {
    const { customer_name, phone, address, notes, items_count, amount, priority_level, service_type } = req.body;
    const orderId = `LD-${Math.floor(10000 + Math.random() * 90000)}`;
    const customer_id = req.userId || req.body.customer_id;

    try {
        if (!service_type) return res.status(400).json({ success: false, error: 'Missing service_type' });
        
        await pool.query(
            'INSERT INTO orders (id, customer_id, customer_name, phone, address, notes, items_count, amount, priority_level, service_type, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [orderId, customer_id || null, customer_name || 'Walk-in', phone || '0000000000', address || null, notes || null, items_count || 1, amount || 0, priority_level || 'Standard', service_type, 'Pending']
        );

        await pool.query(
            'INSERT INTO order_updates (order_id, status) VALUES ($1, $2)',
            [orderId, 'Pending']
        );

        const io = req.app.get('io');
        if (io) {
            io.emit('new_order', { 
                order_id: orderId, 
                customer_name: customer_name || 'Walk-in', 
                priority: priority_level || 'Standard'
            });
        }

        res.status(201).json({ success: true, order: { id: orderId, customer_name, status: 'Pending' } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
};

const getOrders = async (req, res) => {
    try {
        let sql = 'SELECT * FROM orders';
        let params = [];

        if (req.userRole === 'staff') {
            sql += ' WHERE assigned_staff_id = $1';
            params.push(req.userId);
        } else if (req.userRole === 'customer') {
            sql += ' WHERE customer_id = $1';
            params.push(req.userId);
        }

        sql += ' ORDER BY created_at DESC';
        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrderById = async (req, res) => {
    const id = req.params.id;
    try {
        const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        const order = orderResult.rows[0];

        const updatesResult = await pool.query('SELECT * FROM order_updates WHERE order_id = $1 ORDER BY timestamp DESC', [id]);
        
        if (req.userRole === 'customer' && order.customer_id && order.customer_id !== req.userId) {
            return res.status(403).json({ error: 'Protocol Violation: Access Restricted to Owner' });
        }

        const isOwner = req.userId && order.customer_id === req.userId;
        const isPrivileged = req.userRole === 'staff' || req.userRole === 'admin';

        if (!isOwner && !isPrivileged) {
            delete order.address;
            delete order.phone;
        }

        res.json({ order, updates: updatesResult.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    try {
        const currentResult = await pool.query('SELECT status, customer_id, customer_name FROM orders WHERE id = $1', [orderId]);
        if (currentResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        const currentOrder = currentResult.rows[0];
        
        const currentStatus = currentOrder.status;

        if (req.userRole !== 'staff' && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized: Only Staff or Admin can update status' });
        }

        const currentIndex = statusSequence.indexOf(currentStatus);
        const nextIndex = statusSequence.indexOf(status);

        if (nextIndex === -1) return res.status(400).json({ error: `Invalid status` });

        if (nextIndex !== currentIndex + 1 && req.userRole !== 'admin') {
            return res.status(400).json({ error: `Invalid transition` });
        }

        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
        await pool.query('INSERT INTO order_updates (order_id, status) VALUES ($1, $2)', [orderId, status]);

        if (status === 'Completed' || status === 'Ready') {
            if (currentOrder.customer_id) {
                const userResult = await pool.query('SELECT email FROM "user" WHERE id = $1', [currentOrder.customer_id]);
                const userData = userResult.rows[0];
                if (userData?.email) {
                    const { sendOrderReadyEmail } = require('../utils/emailService');
                    sendOrderReadyEmail(userData.email, currentOrder.customer_name, orderId);
                }
            }
        }
        
        const io = req.app.get('io');
        if (io) io.emit('status_update', { order_id: orderId, new_status: status });

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
