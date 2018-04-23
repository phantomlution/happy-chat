const Service = require('egg').Service;

class ChatService extends Service {
  async dispatch(request){
    const action = request.action;
    const currentSessionId = request.sessionId + "";
    const currentRoomId = request.roomId;
    console.log('request')
    console.log(request);

    if(action == 'login'){
      if(!await this.ctx.service.validateService.isRiddleSolved(request.answer)){
        return {
          code: 400,
          msg: '回答错误'
        }
      }
      var sessionId = await this.ctx.service.userService.getNewUser();
      sessionId += "";
      await this.ctx.service.socketService.addSocket(sessionId, request.socket);
      const user = await this.ctx.service.userService.login(sessionId);
      // const token = await this.ctx.service.validateService.getToken(request.socket.id);
      return {
        code: 200,
        data: user
      }
    }else if(action == 'enterRoom'){
      const response =  await this.enterRoom(currentSessionId, currentRoomId);
      this.ctx.service.roomService.sendRoomUpdateInfo(currentSessionId, currentRoomId, true);
      return response;
    }else if(action == 'disconnect'){
      console.log('disconnect')
      console.log(request);
      const disconnectSessionId = await this.ctx.service.socketService.getUserIdBySocketId(request.socketId);
      console.log(disconnectSessionId);
      const userRoomList = await this.ctx.service.roomService.getCurrentUserRoomList(disconnectSessionId);
      console.log(userRoomList)
      for(let i=0; i< userRoomList.length; i++){
        let disconnectRoomId = userRoomList[i];
        //删除当前房间的用户信息
        await this.ctx.service.roomService.removeUserByRoomId(disconnectSessionId, disconnectRoomId);
        //向房间发送通知
        await this.ctx.service.roomService.sendRoomUpdateInfo(disconnectSessionId, disconnectRoomId, false);
      }
      //移除用户socket
      await this.ctx.service.socketService.removeSocket(disconnectSessionId);
    }else if(action == 'getRoomList'){
      const roomList = await this.ctx.service.roomService.getRoomList();
      return {
        code: 200,
        data: roomList
      }
    }else if(action == 'message'){
      //缓存消息数据
      if(currentRoomId){
        delete request.requestId;
        delete request.sessionId;
        await this.ctx.service.roomService.saveRoomMessage(currentRoomId, request);
      }
      this.ctx.service.roomService.roomBroadcast(currentSessionId, currentRoomId, request);
      return {
        code: 200,
        data: request
      }
    }
  }
  async enterRoom(sessionId, roomId){
    if(!this.ctx.service.roomService.getRoomById(roomId)){
      return {
        code: 400,
        msg: '房间不存在'
      }
    }else{
      await this.ctx.service.roomService.enterRoom(sessionId, roomId);
      const sessionIdList = await this.ctx.service.roomService.getAllUserListByRoomId(roomId);

      const roomUserList = [];
      for(let i=0; i< sessionIdList.length; i++){
        const userSessionId = sessionIdList[i];
        roomUserList.push(await this.ctx.service.userService.getUserById(userSessionId))
      }
      const roomInfo = await this.ctx.service.roomService.getRoomById(roomId);

      const response = {
        userList: roomUserList,
        messageList: await this.ctx.service.roomService.getRoomHistoryMessage(roomId),
        meta: roomInfo
      }
      return {
        code: 200,
        data: response
      }
    }
  }

}

module.exports = ChatService;
