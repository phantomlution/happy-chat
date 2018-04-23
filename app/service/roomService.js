const Service = require('egg').Service;

/**
 * ！！！ Service 不是单例
 */

const roomMap = new Map();
const userChannelMap = new Map();//用户所在的房间信息 <sessionId, List<roomId>>
roomMap.set('67373', {//房间号
  groupIcon: 'http://imeihao-h5.oss-cn-beijing.aliyuncs.com/chenyifaer/fafa_67373.jpg',
  groupName: '陈一发儿的聊天室',
  lastMessage: '还没有消息哦',
  lastReceiveTime: 0,
  newMessageCount: 0,
  roomId: "67373",
});

roomMap.set('10086', {
  groupIcon: 'https://pic4.zhimg.com/da8e974dc_im.jpg',
  groupName: '刘看山的聊天室',
  lastMessage: '还没有消息哦',
  lastReceiveTime: 0,
  newMessageCount: 0,
  roomId: "10086",
})

const roomUserMap = new Map();//当前房间的用户列表
const roomMessageMap = new Map();//当前房间的消息缓存
const maxRoomMessageCount = 50;//每个房间最多保留的历史消息数量

class RoomService extends Service {

  async getRoomUserList(roomId){
    roomId += "";
    if(!roomUserMap.has(roomId)){
      roomUserMap.set(roomId, []);
    }
    return roomUserMap.get(roomId);
  }

  async getRoomById(roomId){//获取房间的基本信息
    const userIdList = await this.getRoomUserList(roomId);
    const result = [];
    for(let i=0; i< userIdList.length; i++){
      result.push(await this.ctx.service.userService.getUserById(userIdList[i]))
    }
    return {
      meta: roomMap.get(roomId),
      userList: result
    }
  }


  async getRoomList(){
    const roomList = [];
    for(let room of roomMap.values()){
      roomList.push(room);
    }
    return roomList;
  }

  async saveUserChannel(sessionId, roomId){//用户进入房间后保存用户信息
    if(!userChannelMap.has(sessionId)){
      userChannelMap.set(sessionId, [roomId + ''])
    }else{
      const userRoomItem = userChannelMap.get(sessionId);
      userRoomItem.push(roomId + '');
    }

  }

  async enterRoom(sessionId, roomId){//用户当前在线的房间
    await this.saveUserChannel(sessionId, roomId);
    const roomUserList = await this.getRoomUserList(roomId);
    if(roomUserList.indexOf(sessionId) == -1){
      roomUserList.push(sessionId);
    }
  }

  async getCurrentUserRoomList(sessionId){//获取用户所有的房间
    sessionId += "";
    if(userChannelMap.has(sessionId)){
      return userChannelMap.get(sessionId);
    }else{
      return [];
    }
  }

  async getAllUserListByRoomId(roomId){//获取某个房间内所有的用户
    roomId += "";
    return await this.getRoomUserList(roomId)
  }

  async sendRoomUpdateInfo(sessionId, roomId, enter){//用户 进入／离开 房间
    const user = await this.ctx.service.userService.getUserById(sessionId);
    console.log(user)
    console.log('当前id')
    console.log(sessionId);
    if(user){//用户 加入/离开 房间广播
      const notice = {
        action: 'message',
        type: 'notification',
        roomId: roomId,
        msg: user.name + (enter ? '加入了房间' : '离开了房间')
      }
      this.roomBroadcast(sessionId, roomId, notice);
    }

    const roomNotice = {
      action: 'roomInfoChanged',
      room: await this.getRoomById(roomId)
    }
    console.log(roomNotice);
    this.roomBroadcast(sessionId, roomId, roomNotice);
  }

  async roomBroadcast(sessionId, roomId, data){
    console.log(`room broadcast ${roomId}`)
    if(roomId){
      delete data.requestId;
      delete data.sessionId;
      const currentMemberList = await this.getAllUserListByRoomId(roomId);
      for(var i=0; i<currentMemberList.length; i++){
        let userSessionId = currentMemberList[i];
        if(sessionId != userSessionId){
          const targetSocket = await this.ctx.service.socketService.getSocketByUserId(userSessionId);
          if(targetSocket != undefined){
            targetSocket.emit('res', data)
          }
        }
      }
    }
  }

  async removeUserByRoomId(sessionId, roomId){//删除指定房间的用户信息
    sessionId += "";
    const currentRoomUserList = await this.getAllUserListByRoomId(roomId);
    console.log(currentRoomUserList)
    const userIndex = currentRoomUserList.indexOf(sessionId)
    if(userIndex != -1){
      currentRoomUserList.splice(userIndex, 1);
      console.log(currentRoomUserList)
    }
  }

  async saveRoomMessage(roomId, message){
    if(!roomMessageMap.has(roomId)){
      roomMessageMap.set(roomId, [ message ]);
    }else{
      const messageList = roomMessageMap.get(roomId);
      messageList.push(message);
      if(messageList.length > maxRoomMessageCount){
        messageList.shift();
      }
    }
  }

  async getRoomHistoryMessage(roomId){//获取房间的历史消息
    if(!roomMessageMap.has(roomId)){
      return [];
    }else{
      return roomMessageMap.get(roomId);
    }

  }

}

module.exports = RoomService;