const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt');
const User = require('../models/User');

async function register({ email, password, firstName, lastName, role = 'student' }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('Email already used');
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, firstName, lastName, role });
  return user;
}

async function authenticate({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');
  const token = jwt.sign({
    id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName
  }, secret, { expiresIn });
  return { user, token };
}

module.exports = { register, authenticate };