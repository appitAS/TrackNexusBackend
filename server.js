const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const socket = require('./socket');
const http = require('http');
const morgan = require('morgan');

dotenv.config();
connectDB();


const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://tracknexus.workisy.in',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(morgan('dev'));

app.use('/api/users', userRoutes);
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/break', require('./routes/breakRoutes'));
app.use('/api/screenshots', require('./routes/screenshotRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/uploads', express.static('uploads'));
app.use('/idle', require('./routes/idleTimeoutRoutes'));

const server = http.createServer(app); // 👈 Create HTTP server for Socket.IO

// Socket.IO handler
socket.init(server);
// ✅ Use server.listen instead of app.listen
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
