const cors = require('cors');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const connectDB = require('./db');
require('dotenv').config();

// Connect Database
connectDB();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ page: 'retros-api' });
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/retros', require('./routes/retros'));

// Sockets
io.on('connection', socket => {
  console.log('User connected');

  socket.on('msg', msg => {
    socket.broadcast.emit(msg.mob, msg);
  });
});

// 404
app.use((_, res) => res.status(404).json({ error: '404 | Page not found' }));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
