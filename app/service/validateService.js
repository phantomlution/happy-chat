const Service = require('egg').Service

const token = 'd39e86cef8af084c7b8e138a9acc8393';

class ValidateService extends Service {
  async isRiddleSolved(answer){//用户是否答对了蜜语
    if(answer != '陈一发儿'){
      return false;
    }
    return true;
  }

  async getToken(socketId){//获取当前 socket 的 token
    //TODO 使用真实的token
    return token
  }

  async isTokenValid(socketId, token){
    return token == await this.getToken(socketId);
  }

}

module.exports = ValidateService;