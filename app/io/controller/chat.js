'use strict';

const Controller = require('egg').Controller;
module.exports = app => {
  class ChatController extends Controller {
    async index() {
      const request = this.ctx.args[0];
      const requestId = request.requestId;
      delete request.requestId;
      if(request.action == 'login'){
        request.socket = this.ctx.socket;
      }
      request.time = new Date().getTime();
      var response = await this.ctx.service.chatService.dispatch(request);
      response = response || {};
      response.requestId = requestId;
      this.ctx.socket.emit('res', response);
    }
  }
  return ChatController;
};