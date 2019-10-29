const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const Retro = require('../models/Retro');
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * @route   GET /retros
 * @desc    Get all mob retros
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const retros = await Retro.find().where({ mob: user.mob });

    return res.json(retros);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * @route   GET /retros/latest
 * @desc    Get latest retro for mob
 */
router.get('/latest', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const retro = await Retro.where({ mob: user.mob })
      .sort({ date: -1 })
      .findOne();

    if (!retro) {
      return res.status(400).json({ error: 'No retro available' });
    }

    return res.json(retro);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * @route   GET /retros/:id
 * @desc    Get single retro by ID
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const retro = await Retro.findById(req.params.id);

    if (!retro) {
      return res.status(404).json({ error: 'Retro not found' });
    }

    return res.json(retro);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Retro not found' });
    }

    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * @route   POST /retros
 * @desc    Create a retro
 */
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required')
        .not()
        .isEmpty(),
      check('type', 'Type is required')
        .not()
        .isEmpty(),
      check('awesomes.*', 'Awesomes are required')
        .not()
        .isEmpty(),
      check('deltas.*', 'Deltas are required')
        .not()
        .isEmpty(),
      check('todos.*', 'Todos are required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { name, type, awesomes, deltas, todos } = req.body;

    const user = await User.findById(req.user.id);

    todos = todos.map(todo => ({ name: todo }));

    try {
      const retro = new Retro({
        name,
        type,
        awesomes,
        deltas,
        todos,
        mob: user.mob,
        user: req.user.id
      });
      // console.log(retro);
      await retro.save();

      return res.json(retro);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);

/**
 * @route     DELETE   /:id
 * @desc      Delete a retro
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    const id = req.params.id;

    const retro = await Retro.findById(id);
    // console.log(retro);
    if (!retro) {
      return res.status(404).json({ error: 'Retro not found' });
    }

    if (user.mob !== retro.mob) {
      return res.status(401).json({ error: 'Not allowed' });
    }

    await Retro.findByIdAndDelete(id);

    return res.json({ msg: 'Retro deleted' });
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Retro not found' });
    }

    res.status(500).send('Server Error');
  }
});

/**
 * @route     PATCH /retros/:retroID/todo/:todoID
 * @desc      Change status of todo in a retro
 */
router.patch('/:retroID/todo/:todoID', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    const retro = await Retro.findById(req.params.retroID);

    if (!retro) {
      return res.status(404).json({ error: 'Retro not found' });
    }

    if (user.mob !== retro.mob) {
      return res.status(401).json({ error: 'Not allowed' });
    }

    const todo = retro.todos.find(todo => todo.id === req.params.todoID);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todo.isDone = !todo.isDone;

    await retro.save();

    res.json(retro);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Retro not found' });
    }

    res.status(500).send('Server Error');
  }
});

// Other cases
router.use((req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

module.exports = router;
