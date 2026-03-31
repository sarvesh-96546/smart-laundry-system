const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password, role, phone_number } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // SQLite: insert returns an array with an object containing insertId
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, role, phone_number) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'customer', phone_number]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, role: user.role, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, phone_number, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, phone_number, created_at FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { name, email, role, phone_number } = req.body;
    try {
        await db.execute(
            'UPDATE users SET name = ?, email = ?, role = ?, phone_number = ? WHERE id = ?',
            [name, email, role, phone_number, req.params.id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const getCustomers = async (req, res) => {
    try {
        const [customers] = await db.execute('SELECT id, name, email, phone_number FROM users WHERE role = "customer"');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

module.exports = { register, login, getUsers, getUserById, updateUser, deleteUser, getCustomers };
