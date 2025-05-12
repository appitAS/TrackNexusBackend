// socket.js
let io;

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: 'https://tracknexus.workisy.in',
        methods: ['GET', 'POST'],
      },
    });

    // Attach handlers
    require('./sockets/activitySocket')(io);

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};
