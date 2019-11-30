const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticated !!');
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.split(' ')[1];//req.get('Authorization').split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'mysupersecret')//Same secret used in the auth controller when creating the token
    } catch(err) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        const error = new Error('Not authenticated !');
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId; //email and userId we used as a embeded value while creating the token so after decoding we can again reterieve them
    next();
};