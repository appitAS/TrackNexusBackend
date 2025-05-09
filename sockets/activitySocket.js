const connectedUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // On login or activity start
    socket.on('user:online', ({ userId }) => {
      connectedUsers.set(userId, socket.id);
      console.log('user:online');
      io.emit('status:update', { userId, status: 'online', timestamp: new Date(Date.now() + 5.5 * 60 * 60 * 1000) });
    });

    // On user going idle
    socket.on('user:idle', ({ userId }) => {
      console.log("idle");
      io.emit('status:update', { userId, status: 'idle', timestamp: new Date(Date.now() + 5.5 * 60 * 60 * 1000) });
    });

    // On user going on break
    socket.on('user:break', ({ userId, reason }) => {
      io.emit('status:update', { userId, status: `on break - ${reason}`, timestamp: new Date(Date.now() + 5.5 * 60 * 60 * 1000) });
    });

    // On activity (to reset idle timer)
    socket.on('user:active', ({ userId }) => {
      io.emit('status:update', { userId, status: 'active', timestamp: new Date(Date.now() + 5.5 * 60 * 60 * 1000) });
    });

    // On disconnect
    socket.on('disconnect', () => {
      for (let [userId, sid] of connectedUsers.entries()) {
        if (sid === socket.id) {
          connectedUsers.delete(userId);
          io.emit('status:update', { userId, status: 'offline', timestamp: new Date(Date.now() + 5.5 * 60 * 60 * 1000) });
          break;
        }
      }
      console.log('Client disconnected:', socket.id);
    });
  });
};
