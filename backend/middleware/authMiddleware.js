const jwt = require("jsonwebtoken");

module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // id and role
      console.log(" Authenticated User:", decoded);

      // 🔹 Role-based access check
      if (
        allowedRoles.length &&
        !allowedRoles
          .map((r) => r.toLowerCase())
          .includes(req.user.role.toLowerCase().trim())
      ) {
        return res.status(403).json({ error: "Access denied" });
        
      }

      next();
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
};
