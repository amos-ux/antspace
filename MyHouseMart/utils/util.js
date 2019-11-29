//生产
let urlPrefix = "https://api.antspace.com/myhome/cloud/v1";
let webSocketPrefix = "wss://api.antspace.com/myhome/cloud/v1/service-member";
let webUrl = 'https://api.antspace.com/myhome/cloud/v1';
let wxUrl = "https://api.antspace.com/myhome/cloud/v1/service-item"

//dev2  开发环境
// let urlPrefix = "http://10.0.0.12:8989/myhome/cloud/v1"
// let webSocketPrefix = "ws://10.0.0.12:8989/myhome/cloud/v1/service-member"
// let webUrl = "http://10.0.0.12:8989/myhome/cloud/v1"
// let wxUrl ="http://10.0.0.12:8989/myhome/cloud/v1/service-item/"

// pp环境  
// let urlPrefix = "https://wongkimshing.iask.in/myhome/cloud/v1";
// let webUrl = "https://wongkimshing.iask.in/myhome/cloud/v1";
// let webSocketPrefix = "wss://wongkimshing.iask.in/myhome/cloud/v1/service-member";
// let wxUrl = "https://wongkimshing.iask.in/myhome/cloud/v1/service-item";

//test环境
// let urlPrefix = "https://antspace-dev.oicp.vip/myhome/cloud/v1"
// let webSocketPrefix = "wss://antspace-dev.oicp.vip/myhome/cloud/v1/service-member"
// let webUrl = "https://antspace-dev.oicp.vip/myhome/cloud/v1"
// let wxUrl = "https://antspace-dev.oicp.vip/myhome/cloud/v1/service-item"

//测试环境
// let urlPrefix = "https://antspace-dev.oicp.vip/myhome/cloud/v1"
// let webSocketPrefix = "wss://antspace-dev.oicp.vip/myhome/cloud/v1/service-member"
// let webUrl = "http://10.0.0.31:31899/myhome/cloud/v1"
// let wxUrl = "http://10.0.0.31:31899/myhome/cloud/v1/service-item/"


let cache = require("./cache.js");

let rulFix = ''

function webSocket(uri, successCall) {
  let sessionId = cache.get('sessionId', 'null');
  let webSocketUrl = webSocketPrefix + uri + sessionId;
  return wx.connectSocket({
    url: webSocketUrl,
    success: function (res) {
      successCall(res);
    }
  })
}

function wxGetseting(judge) {
  wx.getSetting({
    success(res) {
      if (res.authSetting["scope.userInfo"]) {
        judge = true
      } else {
        judge = false
      }
    }
  })
}

function uploadFile(uri, filePath, name, method, successFun) {
  let sessionId = cache.get('sessionId', 'null');
  wx.uploadFile({
    url: urlPrefix + uri,
    filePath: filePath,
    name: name,
    method: method,
    header: {
      "Content-Type": "multipart/form-data",
      'accept': 'application/json',
      'Cookie': "JSESSIONID=" + sessionId
    },
    success: function (res) {
      let status = res.statusCode;
      if (status == 413) {
        wx.hideLoading();
        wx.showModal({
          title: '上传失败',
          content: '图片大小超出限制',
        })
        return;
      }
      let rest = JSON.parse(res.data);
      let returnCode = rest.returnCode;
      let resultCode = rest.resultCode;
      if (returnCode == "success" && resultCode == "ok") {
        successFun(rest);
      } else {
        wx.hideLoading();
        wx.showModal({
          title: '上传失败',
          content: rest.message,
        })
      }
    },
    fail: function (res) {
      wx.hideLoading();
      wx.showModal({
        title: '上传失败，请重试',
        content: '',
      })
    }
  })
}

function httpClient(uri, method, data, success, failure) {
  let sessionId = cache.get('sessionId', 'null');
  console.log('sessionId: ' + sessionId)
  wx.request({
    url: webUrl + uri,
    method: method,
    header: {
      'Content-Type': 'application/json',
      'Cookie': "JSESSIONID=" + sessionId
    },
    data: data,
    success: function (res) {
      let statusCode = res.statusCode;
      if (statusCode == '200') {
        let sessionId = res.data.sessionID;
        if (sessionId) {
          console.log('插入了sessionId');
          console.log(sessionId);
          cache.put('sessionId', sessionId);
        }
        let returnCode = res.data.returnCode;
        let resultCode = res.data.resultCode;
        if (returnCode == "success" && resultCode == "ok") {
          success(res.data);
        } else if (resultCode == "systemError") {
          wx.hideLoading();
          showToast("系统错误", this, 1e3);
        } else if (resultCode == "notLogin") {
          wx.hideLoading();
          wx.redirectTo({
            url: '../login/login',
          })
        } else {
          wx.hideLoading();
          failure(res.data);
        }
      }
    },
    fail: function (e) {
      wx.hideLoading();
      wx.showModal({
        title: '我家智能精选便利店',
        content: '无网络连接',
        confirmText: '再试一次',
        cancelText: '算了吧',
        success: function (res) {

        },
        fail: function (res) {
          wx: wx.navigateBack({
            delta: 8,
          })
        }

      })
    }
  })
}

function wxLogin(fun) {
  wx.login({
    success: function (res) {
      let loginCode = res.code;

      if (loginCode) {
        fun(loginCode);
      } else {
        showToast("登录失败", this, 1e3);
      }
    }
  })
}

//时间倒计时封装
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function sendMessage() {
  let mCmd = {
    "cmd": "connect.getWlList",
    "data": {
      "mdd": "370600"
    }
  }
  wx.sendSocketMessage({
    data: JSON.stringify(mCmd),
    success: function (res) { }
  })
}

function resiverMessage(context) {
  wx.onSocketMessage(function (data) {
    context.onMessage(JSON.parse(data.data))
  })
}

function showToast(e, t, a) {
  let o = t;
  a = parseInt(a) ? parseInt(a) : 3e3, o.setData({
    toastText: e,
    isShowToast: !0
  }), setTimeout(function () {
    o.setData({
      isShowToast: !1
    });
  }, a);
}

/**
 * 等级会员名称
 * NON_MEMBERS: 非会员，仅仅只是注册了账号，尚未购买过会员卡且未领取体验卡
 * MEMBERS: 会员，表示开通了会员且此时此刻会员正处于有效期内
 * EXPIRED_MEMBERS: 过期会员，表示曾今开通了会员，可是现在会员已经过期了
 * EXPERIENCE: 体验卡会员
 * ENTERPRISE：我家企业会员
 */
function chmemberName(memberStatus,expiredDate) {
  let memberName = '', memberImg = ''
  // 根据等级名称区分
  if (memberStatus == 'NON_MEMBERS') { //非会员 过期会员
    memberName = '普通用户';
    memberImg = '../../images/user_my.svg'
  } else if (memberStatus == 'MEMBERS') {//我家会员
    memberName = '我家会员';
    memberImg = '../../images/vip_my.svg'
  } else if (memberStatus == 'EXPERIENCE') {//体验会员
    memberName = '体验会员';
    memberImg = '../../images/vip-exper.svg'
  } else if (memberStatus == 'ENTERPRISE') {//我家企业会员
    memberName = '我家企业会员';
    memberImg = '../../images/my-homevip.svg'
  } else if(memberStatus == 'EXPIRED_MEMBERS'){//过期会员
    memberName = `会员过期${Math.abs(expiredDate)}天`;
    memberImg = '../../images/vip_myend.svg'
  }else {
    memberName = '普通用户';
    memberImg = '../../images/user_my.svg'
  }
  return { memberName, memberImg };
}

/**
 * 比较是否在时间段内
 * time_range = function (beginTime, endTime, nowTime) (开始时间,结束时间,现在时间)
 * 在时间段内 true 不在时间段内 false
 */
function timeRange(beginTime, endTime, nowTime) {
  let strb = beginTime.split(":");
  if (strb.length != 2) {
    return false;
  }
  let stre = endTime.split(":");
  if (stre.length != 2) {
    return false;
  }
  let strn = nowTime.split(":");
  if (stre.length != 2) {
    return false;
  }
  let b = new Date();
  let e = new Date();
  let n = new Date();
  b.setHours(strb[0]);
  b.setMinutes(strb[1]);
  e.setHours(stre[0]);
  e.setMinutes(stre[1]);
  n.setHours(strn[0]);
  n.setMinutes(strn[1]);
  if (n.getTime() - b.getTime() > 0 && n.getTime() - e.getTime() < 0) {
    return true;
  } else {
    return false;
  }
}

/**
 * 比较两个时间相差
 * s1 当前时间
 * s2 结束时间
 * result 相差的时间数
 */
function getHour(s1, s2) {
  let reDate = /\d{4}-\d{1,2}-\d{1,2} /;
  s1 = new Date((reDate.test(s1) ? s1 : '2017-1-1 ' + s1).replace(/-/g, '/'));
  s2 = new Date((reDate.test(s2) ? s2 : '2017-1-1 ' + s2).replace(/-/g, '/'));
  let ms = s2.getTime() - s1.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / 1000 / 60 / 60);
}

/**
 * 当前时间 格式：11:00:09
 */
function getNowTime(date) {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [hour, minute, second].map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

// 比较两个日期先后 true 已过期 false 未过期
function compareDate(d1, d2) {
  return ((new Date(d1.replace(/-/g, "\/"))) > (new Date(d2.replace(/-/g, "\/"))));
}

/**
 * 获取当前日期
 * 格式 2018-09-22
 */
function getNowDate(date) {
  return [date.getFullYear(), (date.getMonth() + 1), date.getDate()].map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join('-')
}

module.exports = {
  webUrl: webUrl,
  wxUrl: wxUrl,
  uploadFile: uploadFile,
  webSocket: webSocket,
  sendMessage: sendMessage,
  resiverMessage: resiverMessage,
  httpClient: httpClient,
  wxLogin: wxLogin,
  formatTime: formatTime,
  wxGetseting: wxGetseting,
  chmemberName:chmemberName,
  timeRange:timeRange,
  getHour:getHour,
  getNowTime:getNowTime,
  compareDate:compareDate,
  getNowDate:getNowDate,
  checkEmpty: function (e) {
    return null == e || 0 == e.length || "null" == e.length;
  },
  showLoading: function () {
    wx.showLoading ? wx.showLoading({
      title: "加载中..."
    }) : wx.showModal({
      title: "提示",
      content: "当前微信版本过低，请升级到最新微信版本后重试。"
    });
  },
  hideLoading: function () {
    wx.hideLoading ? wx.hideLoading() : wx.showModal({
      title: "提示",
      content: "当前微信版本过低，请升级到最新微信版本后重试。"
    });
  },
  checkWeChatVersion: function () {
    wx.hideLoading && wx.showLoading && wx.navigateToMiniProgram && wx.openCard || wx.showModal({
      title: "提示",
      content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。"
    });
  },
  createImageFromCanvas: function (e, t) {
    wx.canvasToTempFilePath({
      canvasId: e,
      success: function (e) {
        t.setData({
          qrcodeImg: e.tempFilePath
        });
      },
      fail: function (e) {
        console.log(JSON.stringify(e));
      }
    });
  }
};

function showLoading(message) {
  if (wx.showLoading) { // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.showLoading({
      title: message,
      mask: true
    });
  } else { // 低版本采用Toast兼容处理并将时间设为20秒以免自动消失
    wx.showToast({
      title: message,
      icon: 'loading',
      mask: true,
      duration: 20000
    });
  }
}

function hideLoading() {
  if (wx.hideLoading) { // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.hideLoading();
  } else {
    wx.hideToast();
  }
}