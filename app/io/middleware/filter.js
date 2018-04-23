// {app_root}/app/io/middleware/packet.js
module.exports = app => {
  return async (ctx, next) => {
    // ctx.socket.emit('res', 'packet received!');
    // console.log('packet:', this.packet);
    await next();
  };
};
