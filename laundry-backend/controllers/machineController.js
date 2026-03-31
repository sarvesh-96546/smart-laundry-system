const db = require('../config/db');

const getMachinery = async (req, res) => {
    try {
        const [machines] = await db.execute(`
            SELECT m.*, o.customer_name as assigned_customer
            FROM machinery m
            LEFT JOIN orders o ON m.assigned_order_id = o.id
            ORDER BY m.type, m.name
        `);
        res.json(machines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const startMachine = async (req, res) => {
    const { machine_id } = req.params;
    const { order_id, duration } = req.body;
    
    const startTime = new Date().toISOString();
    const durationMs = (duration || 30) * 60000;
    const endTime = new Date(Date.now() + durationMs).toISOString();

    try {
        await db.execute(`
            UPDATE machinery 
            SET assigned_order_id = ?, 
                cycle_start_time = ?, 
                expected_end_time = ?,
                status = 'Running',
                usage_count = usage_count + 1
            WHERE id = ?
        `, [order_id, startTime, endTime, machine_id]);

        const io = req.app.get('io');
        io.emit('machine_update', { machine_id, status: 'Running' });

        // Auto-update order status
        const [machines] = await db.execute('SELECT type FROM machinery WHERE id = ?', [machine_id]);
        if (machines.length > 0) {
            const newStatus = machines[0].type.includes('Washing') ? 'Washing' : 'Drying';
            await db.execute('UPDATE orders SET status = ? WHERE id = ?', [newStatus, order_id]);
            await db.execute('INSERT INTO order_updates (order_id, status) VALUES (?, ?)', [order_id, newStatus]);
            io.emit('status_update', { order_id, new_status: newStatus });
        }

        res.json({ success: true, end_time: endTime });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const stopMachine = async (req, res) => {
    const { machine_id } = req.params;
    try {
        const [machines] = await db.execute('SELECT assigned_order_id, type FROM machinery WHERE id = ?', [machine_id]);
        const order_id = machines.length > 0 ? machines[0].assigned_order_id : null;

        await db.execute(`
            UPDATE machinery 
            SET assigned_order_id = NULL, 
                cycle_start_time = NULL, 
                expected_end_time = NULL,
                status = 'Operational'
            WHERE id = ?
        `, [machine_id]);

        const io = req.app.get('io');
        io.emit('machine_update', { machine_id, status: 'Operational' });

        if (order_id) {
            const nextStatus = machines[0].type.includes('Washing') ? 'Drying' : 'Ironing';
            await db.execute('UPDATE orders SET status = ? WHERE id = ?', [nextStatus, order_id]);
            await db.execute('INSERT INTO order_updates (order_id, status) VALUES (?, ?)', [order_id, nextStatus]);
            io.emit('status_update', { order_id, new_status: nextStatus });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMachinery, startMachine, stopMachine };
