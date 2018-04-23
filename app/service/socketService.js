const Service = require('egg').Service;


const socketPool = new Map();//缓存socket<sessionId, socket>
const socketMap = new Map();//缓存部分socket信息<socketId, sessionId>

class SocketService extends Service{

  async addSocket(sessionId, socket){//缓存用户的socket
    socketPool.set(sessionId, socket);
    socketMap.set(socket.id, sessionId);
  }

  async removeSocket(sessionId){//移除用户
    socketMap.delete(sessionId);
    socketPool.delete(sessionId);
  }
  async getSocketByUserId(sessionId){
    return socketPool.get(sessionId);
  }

  async getUserIdBySocketId(socketId){
    return socketMap.get(socketId);
  }



}

module.exports = SocketService;