const User = require('../models/User');

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

module.exports = { me };