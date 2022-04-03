const jwt = require('jsonwebtoken');
const config = require('config');

async function auth(req, resp, next) {

    let token = req.header('x-auth-token');
    if (!token) return resp.status(401).send("Access denied,no token provided");

    try {
        req.user = await jwt.verify(token, config.get('auth.jwtTokenizer'));
        next();
    } catch (e) {

        resp.status(401).send("invalid token");
    }

}

module.exports = auth;