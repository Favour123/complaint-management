const jwt = require("jsonwebtoken");

function bearerToken(req) {
  const h = req.headers.authorization || "";
  const [type, token] = h.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token.trim();
}

function requireUser(req, res, next) {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "user") {
      return res.status(403).json({ status: "error", message: "Invalid token" });
    }
    req.user = { id: payload.sub, uuid: payload.uuid };
    next();
  } catch {
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin") {
      return res.status(403).json({ status: "error", message: "Admin access required" });
    }
    req.admin = { id: payload.sub, uuid: payload.uuid };
    next();
  } catch {
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
}

/** Allow either a logged-in student (own rows) or an admin (any row). */
function requireUserOrAdminComplaint(req, res, next) {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role === "user") {
      req.user = { id: payload.sub, uuid: payload.uuid };
      req.authRole = "user";
    } else if (payload.role === "admin") {
      req.admin = { id: payload.sub, uuid: payload.uuid };
      req.authRole = "admin";
    } else {
      return res.status(403).json({ status: "error", message: "Invalid token" });
    }
    next();
  } catch {
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
}

module.exports = {
  bearerToken,
  requireUser,
  requireAdmin,
  requireUserOrAdminComplaint,
};
