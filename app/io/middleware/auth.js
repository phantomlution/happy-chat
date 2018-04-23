// {app_root}/app/io/middleware/connection.js
module.exports = app => {
  return async (ctx, next) => {
    const socketId = ctx.socket.id;
    console.log(`connected:${socketId}`);
    await next();
    console.log('disconnection!' + socketId);
    ctx.service.chatService.dispatch({
      action: 'disconnect',
      socketId: socketId
    });
  };
};

