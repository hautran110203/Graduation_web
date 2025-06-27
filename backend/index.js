const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Route
const testRoutes = require('./routes/test.routes');
app.use('/api', testRoutes);

const userRoutes = require('./routes/user.routes');;
app.use('/user', userRoutes);

// 🚀 QUAN TRỌNG: chạy server!
app.listen(PORT, () => {
  console.log(`✅ Backend is running at http://localhost:${PORT}`);
});
