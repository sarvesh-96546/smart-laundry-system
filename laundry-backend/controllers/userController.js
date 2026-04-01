const supabase = require('../config/supabase');

const register = async (req, res) => {
    res.status(400).json({ message: 'Authentication is now handled by Supabase Auth. Please use the frontend client to register/login.' });
};

const login = async (req, res) => {
    res.status(400).json({ message: 'Authentication is now handled by Supabase Auth. Please use the frontend client to register/login.' });
};

const getUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase.from('users').select('id, name, email, role, phone_number, created_at');
        if (error) throw error;
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, phone_number, created_at')
            .eq('id', req.params.id)
            .single();

        if (error || !user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { name, email, role, phone_number } = req.body;
    try {
        const { error } = await supabase
            .from('users')
            .update({ name, email, role, phone_number })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { error } = await supabase.from('users').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const getCustomers = async (req, res) => {
    try {
        const { data: customers, error } = await supabase
            .from('users')
            .select('id, name, email, phone_number')
            .eq('role', 'customer');

        if (error) throw error;
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

module.exports = { register, login, getUsers, getUserById, updateUser, deleteUser, getCustomers };
