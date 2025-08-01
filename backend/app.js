// app.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('No URL');

  try {
    const response = await fetch(imageUrl);
    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();

    res.set('Content-Type', contentType || 'image/png');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching image');
  }
});

// Routes
const testRoutes = require('./routes/test.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const uploadRoutes = require('./routes/upload.routes');
const unitRoutes = require('./routes/unit.routes');
const registrationRoutes = require('./routes/registration.routes');
const adminUnitRoutes = require('.//routes/adminUnit/admin.unit.routes');
const graduationRoutes = require('.//routes/adminUnit/graduation');
const pptUnitRoutes = require('.//routes/adminUnit/ppt.unit.routes');
const locationRoutes = require('./routes/location.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/admin', adminRoutes);
app.use('/locations', locationRoutes);
app.use('/ppt', pptUnitRoutes);
app.use('/graduation', graduationRoutes);
app.use('/admin/units', adminUnitRoutes)
app.use('/registrations', registrationRoutes);
app.use('/units', unitRoutes);
app.use('/auth', authRoutes);
app.use('/api', testRoutes);
app.use('/user', userRoutes);
app.use('/upload', uploadRoutes);
app.use('/events', eventRoutes);
module.exports = app;