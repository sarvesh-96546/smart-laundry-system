const supabase = require('../config/supabase');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Invalid token format' });
    }

    try {
        // Since the frontend logs in via Supabase, it provides a Supabase access_token.
        // We verify it with the Supabase Auth API
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.warn(`[AUTH_FAILURE] Token verification failed: ${error?.message || 'User not found'}`);
            return res.status(401).json({ message: 'Unauthorized: Invalid Supabase Token', error: error?.message });
        }

        req.userId = user.id;
        // In Supabase, custom roles can be stored in user_metadata or app_metadata
        // Alternatively, since we created a separate public.users table, we should fetch the role from there.
        
        const { data: userData } = await supabase
            .from('users')
            .select('role, name')
            .eq('email', user.email)
            .single();

        req.userRole = userData?.role || 'customer';
        req.userName = userData?.name || user.email.split('@')[0];
        
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Error verifying token', error: err.message });
    }
};

const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Require Admin Role' });
    }
    next();
};

const isStaff = (req, res, next) => {
    if (req.userRole !== 'staff' && req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Require Staff or Admin Role' });
    }
    next();
};

module.exports = { verifyToken, isAdmin, isStaff };
