const express = require('express');
const app = express();
const connectDB = require('./db');
require('dotenv').config();

// Connect Database
connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ page: 'retros-api' });
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/retros', require('./routes/retros'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
