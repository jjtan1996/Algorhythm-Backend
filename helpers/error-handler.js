function errorHandler(err, req, res, next) {
    //jwt authentication error
    if (err.name === 'UnauthorizedError'){
        return res.status(401).json({message: "User is not Authorized"})
    }
    //validation error
    if (err.name === 'ValidationError'){
        return res.status(401).json({message: "Validation Error"})
    }
    //other errors will be default
    return res.status(500).json(err);
}

module.exports = errorHandler;