const { Server } = require('socket.io');
const { Client } = require('pg');

let ioInstance = null;
let pgListener = null;

function initSockets(httpServer, opts = {}) {
  if (ioInstance) return ioInstance;
  const io = new Server(httpServer, opts);

  // Simple auth middleware: expects token in query or auth header (you should replace with real JWT validation)
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    // For demo allow any token; map token -> userId if needed
    socket.userId = token || null;
    return next();
  });

  io.on('connection', (socket) => {
    // Join user room if authenticated
    if (socket.userId) socket.join(`user:${socket.userId}`);
    socket.on('join', (room) => {
      socket.join(room);
    });
    socket.on('leave', (room) => {
      socket.leave(room);
    });
  });

  // Listen to Postgres NOTIFY channel 'changes_channel'
  if (process.env.DATABASE_URL) {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    client.connect().then(() => {
      client.query('LISTEN changes_channel');
      client.on('notification', async (msg) => {
        try {
          const payload = JSON.parse(msg.payload);
          // emit to a generic channel and a room for object
          io.emit('change', payload);
          if (payload.object_id) io.to(`object:${payload.object_id}`).emit('object_change', payload);
        } catch (e) {
          console.warn('Failed to parse notify payload', e);
        }
      });
    }).catch((e) => console.warn('PG listener error', e));
    pgListener = client;
  }

  ioInstance = io;
  return io;
}

function getIo() {
  return ioInstance;
}

async function closeSockets() {
  try {
    if (pgListener) await pgListener.end();
  } catch (e) {}
  try {
    if (ioInstance) await ioInstance.close();
  } catch (e) {}
}

module.exports = { initSockets, getIo, closeSockets };
