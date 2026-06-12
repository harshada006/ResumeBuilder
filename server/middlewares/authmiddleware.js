import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ || process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }

        catch (error) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

    // Further token validation logic would go here
    
}

export default protect;