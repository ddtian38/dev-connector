const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next){
        //Get token from header
        const token = req.header("x-auth-token");

        //Check if not token --> to protect access for particular routes
        if(!token){
            return res.status(401).json({ msg: "no token, authorization denied"})
        }

        //verify token
        try{
            const decoded = jwt.verify(token, config.get("jwtSecret"));

            req.user = decoded.user;
            next();

        } 
        //if token is not verified
        catch(err){
            res.status(401).json({msg: "token is not valid"})

        }
}