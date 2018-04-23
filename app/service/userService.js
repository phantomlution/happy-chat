const Service = require('egg').Service

const userList = require('../../assets/user.json');//加载所有的用户数据 3000个
const userMap = new Map();
for(let i=0; i<userList.length; i++){
  let user = userList[i];
  user._id = user.id;
  user.avatar = user.avatar.replace('{size}', 'l');//更新一下知乎用户的头像
  user.id = i;
  userMap.set(i + "", user);
}

const usedId = [];
const totalUserCount = userList.length;

class UserService extends Service{

  async getUserById(sessionId){
    sessionId += "";
    if(userMap.has(sessionId)){
      return userMap.get(sessionId);
    }else{
      return undefined;
    }

  }

  async getNewUser(){//获取一个用户
    let userIndex = parseInt(Math.random() * totalUserCount);
    while(usedId.indexOf(userIndex) != -1){
      userIndex = parseInt(Math.random() * totalUserCount);
    }
    usedId.push(userIndex);
    return userIndex
  }

  async login(sessionId){//注册用户
    return await this.getUserById(sessionId)
  }


}

module.exports = UserService;