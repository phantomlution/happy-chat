'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  // router.get('/', controller.home.index);

  // socket.io
  io.route('chat', io.controller.chat.index);
  // io.route('disconnect', io.controller.chat.disconnect);
  // io.route('connect', io.controller.chat.connect);
};
