const { auth } = require('../auth');

const verifyToken = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return res.status(401).json({ message: 'Unauthorized: Missing or Invalid Session' });
        }

        req.userId = session.user.id;
        req.userName = session.user.name;
        req.userRole = session.user.role || 'customer';
        
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
