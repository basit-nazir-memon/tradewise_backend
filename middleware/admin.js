const admin = (req, res, next) => {
    console.log(req.user.role);
    console.log(req.user.fullName);
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
}

module.exports = admin;


