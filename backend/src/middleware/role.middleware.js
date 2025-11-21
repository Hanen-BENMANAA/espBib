// Usage: authorize('admin') or authorize(['teacher','admin'])
module.exports = function authorize(required) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const roles = Array.isArray(required) ? required : [required];
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
};