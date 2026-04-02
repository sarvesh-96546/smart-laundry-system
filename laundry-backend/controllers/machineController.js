const { pool } = require('../auth');

const getMachinery = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.*, o.customer_name as assigned_customer
            FROM machinery m
            LEFT JOIN orders o ON m.assigned_order_id = o.id
            ORDER BY m.type ASC, m.name ASC
        `);

        res.json(result.rows);
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
        const machineResult = await pool.query('SELECT usage_count, type FROM machinery WHERE id = $1', [machine_id]);
        const currentMachine = machineResult.rows[0];

        await pool.query(
            'UPDATE machinery SET assigned_order_id = $1, cycle_start_time = $2, expected_end_time = $3, status = $4, usage_count = $5 WHERE id = $6',
            [order_id, startTime, endTime, 'Running', (currentMachine?.usage_count || 0) + 1, machine_id]
        );

        const io = req.app.get('io');
        if (io) io.emit('machine_update', { machine_id, status: 'Running' });

        if (currentMachine) {
            const newStatus = currentMachine.type.includes('Washing') ? 'Washing' : 'Drying';
            
            await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [newStatus, order_id]);
            await pool.query('INSERT INTO order_updates (order_id, status) VALUES ($1, $2)', [order_id, newStatus]);
            
            if (io) io.emit('status_update', { order_id, new_status: newStatus });
        }

        res.json({ success: true, end_time: endTime });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const stopMachine = async (req, res) => {
    const { machine_id } = req.params;
    try {
        const machineResult = await pool.query('SELECT assigned_order_id, type FROM machinery WHERE id = $1', [machine_id]);
        const currentMachine = machineResult.rows[0];

        const order_id = currentMachine?.assigned_order_id;

        await pool.query(
            'UPDATE machinery SET assigned_order_id = NULL, cycle_start_time = NULL, expected_end_time = NULL, status = $1 WHERE id = $2',
            ['Operational', machine_id]
        );

        const io = req.app.get('io');
        if (io) io.emit('machine_update', { machine_id, status: 'Operational' });

        if (order_id) {
            const nextStatus = currentMachine.type.includes('Washing') ? 'Drying' : 'Ironing';
            
            await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [nextStatus, order_id]);
            await pool.query('INSERT INTO order_updates (order_id, status) VALUES ($1, $2)', [order_id, nextStatus]);
            
            if (io) io.emit('status_update', { order_id, new_status: nextStatus });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMachinery, startMachine, stopMachine };
