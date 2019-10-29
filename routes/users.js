require('dotenv').config();
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const User = require('../models/User');

const auth = require('../middleware/auth');

/**
 * @route   GET /users
 * @desc    Get all users
 */
router.get('/', auth, (req, res) => {
  res.send('Users route');
});

/**
 * @route   POST /users
 * @desc    Register a user
 */
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('mob', 'Mob is required')
      .not()
      .isEmpty(),
    check('password', 'Password is required (min 6)').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mob, password } = req.body;

    try {
      let user = await User.findOne({ email });
      // See if user exists

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Create user
      user = new User({
        name,
        email,
        password,
        mob
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
