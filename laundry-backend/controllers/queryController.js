const { pool } = require('../auth');

const createQuery = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Protocol Deficit: All inquiry fields are required.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO queries (name, email, subject, message, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [name, email, subject, message, 'Pending']
        );

        res.status(201).json({ 
            success: true, 
            message: 'Inquiry Transmission Logged.', 
            query_id: result.rows[0].id 
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Core Sync Failure: Could not log inquiry.' });
    }
};

module.exports = { createQuery };
