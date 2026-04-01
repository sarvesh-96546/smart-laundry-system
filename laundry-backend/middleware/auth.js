const supabase = require('../config/supabase');
const { auth } = require('../auth');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (session) {
            req.userId = session.user.id;
            req.userName = session.user.name;
            
            const { data: userData } = await supabase
                .from('user')
                .select('role')
                .eq('id', session.user.id)
                .single();
            
            req.userRole = userData?.role || session.user.role || 'customer';
            return next();
        }

        if (!authHeader) return res.status(401).json({ message: 'Unauthorized: Missing Authorization Header' });
        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized: Invalid Token Format' });

        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ message: 'Unauthorized: Invalid Session or Token' });
        }

        req.userId = user.id;
        
        let { data: userData, error: fetchError } = await supabase
            .from('user')
            .select('role, name')
            .eq('id', user.id)
            .single();

        if (fetchError || !userData) {
            const newUserData = {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
                role: 'customer',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const { data: createdUser, error: insertError } = await supabase
                .from('user')
                .insert(newUserData)
                .select('role, name')
                .single();
            
            if (insertError) {
                console.error('[AUTH_SYNC_ERROR] Failed to create public.user record:', insertError);
            }
            userData = createdUser || newUserData;
        }

        req.userRole = userData?.role || 'customer';
        req.userName = userData?.name || user.email?.split('@')[0] || 'Unknown User';
        
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
