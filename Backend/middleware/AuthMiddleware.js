import jwt from "jsonwebtoken";

const AuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("🔹 Auth Middleware: Header received:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Auth Middleware: Missing or malformed header");
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Auth Middleware: Token Valid. User ID:", decoded.id);

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("❌ JWT ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default AuthMiddleware;
