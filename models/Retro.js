const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RetroSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  awesomes: {
    type: [String],
    required: true
  },
  deltas: {
    type: [String],
    required: true
  },
  todos: [
    {
      name: {
        type: String,
        required: true
      },
      isDone: {
        type: Boolean,
        default: false
      }
    }
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  mob: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Retro = mongoose.model('retro', RetroSchema);
