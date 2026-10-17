const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const app = require('./app');
const logger = require('./config/logger');
const { connectDB, disconnectDB, isConnected } = require('./config/db');
const Chat = require('./models/Chat');
dotenv.config();
const server = http.createServer(app);
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_URL].filter(Boolean);
const io = new Server(server, { cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true } });
io.on('connection', socket => {
  socket.on('joinRoom', room => { if (typeof room === 'string' && room.trim()) socket.join(room); });
  socket.on('chatMessage', async data => { try { if (!data?.room || !data?.sender) throw new Error('Invalid message data'); const message = await Chat.create({ room: data.room, sender: data.sender, message: data.message }); io.to(data.room).emit('chatMessage', message); } catch { socket.emit('error', { message: 'Failed to send message' }); } });
  socket.on('fileMessage', async data => { try { if (!data?.room || !data?.sender) throw new Error('Invalid file message data'); const message = await Chat.create({ room: data.room, sender: data.sender, fileUrl: data.fileUrl, fileName: data.fileName }); io.to(data.room).emit('fileMessage', message); } catch { socket.emit('error', { message: 'Failed to send file message' }); } });
});
const PORT = process.env.PORT || 5000;
connectDB().then(() => server.listen(PORT, () => logger.info(`Smart Health Record MySQL API listening on ${PORT}`))).catch(error => { logger.error('MySQL startup failed', { error: error.message }); process.exitCode = 1; });
async function shutdown(signal) { logger.info(`${signal} received; shutting down`); server.close(async () => { await disconnectDB(); process.exit(0); }); }
process.on('SIGTERM', () => shutdown('SIGTERM')); process.on('SIGINT', () => shutdown('SIGINT'));
module.exports = { app, server, isConnected };
