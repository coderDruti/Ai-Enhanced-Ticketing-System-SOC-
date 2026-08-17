const jwt = require('jsonwebtoken');

const verifyToken = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader||!authHeader.startsWith('Bearer ')){
        return res.status(401).json({error:"Access denied. No token provided"});    
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError"){
            return res.status(401).json({error:"Token is Expired"});
        }
        else{
        return res.status(401).json({error:"Invalid token"});
        }
    }
}

const requireRole = (...allowedRoles)=>{
    return (req,res,next)=>{
        if (!req.user) {
            console.error("CRITICAL: requireRole called without verifyToken in the route chain!");
            return res.status(500).json({ error: "Internal Server Error: Broken authentication pipeline." });
        }
        if (!allowedRoles.includes(req.user.role)){
            return res.status(403).json({error:"Access denied. Insufficient permissions"});
        }
        next();
    }    
}


module.exports = {
    verifyToken,
    requireRole
}