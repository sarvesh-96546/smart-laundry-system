const { pool } = require('../auth');

const getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role, phone_number, "createdAt" FROM "user"');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role, phone_number, "createdAt" FROM "user" WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { name, email, role, phone_number } = req.body;
    try {
        if (role && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized: Only admins can modify user roles' });
        }

        await pool.query(
            'UPDATE "user" SET name = $1, email = $2, role = COALESCE($3, role), phone_number = $4, "updatedAt" = NOW() WHERE id = $5',
            [name, email, role || null, phone_number, req.params.id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

const deleteUser = async (req, res) => {
    try {
        await pool.query('DELETE FROM "user" WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const getCustomers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, phone_number FROM "user" WHERE role = $1', ['customer']);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, getCustomers, pool };
