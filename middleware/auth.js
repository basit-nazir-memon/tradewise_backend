const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    let token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ msg: 'Authorization denied. Token not found.' });
    }

    token = token.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.user;

        console.log(req.user);
        
        next();
    } catch (err) {
        console.log("Error: ", err);
        res.status(401).json({ msg: 'Token is not valid.' });
    }
}

module.exports = auth;
