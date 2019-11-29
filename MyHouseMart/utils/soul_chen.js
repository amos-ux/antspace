//生产
var webUrl = 'https://api.antspace.com/myhome/cloud/v1';

//dev2 开发环境
// let webUrl = "http://10.0.0.12:8989/myhome/cloud/v1";

//pp环境  
// var webUrl = "https://wongkimshing.iask.in/myhome/cloud/v1";

//test环境
// let webUrl = "https://antspace-dev.oicp.vip/myhome/cloud/v1";

//测试环境
// let webUrl = "http://10.0.0.31:31899/myhome/cloud/v1";
let we = require("./util.js")
let request = function (url, parms, methods = 'POST', loading = true, isShowLoading = true) {
  if (isShowLoading) {
    wx.showLoading({
      title: '页面加载中...',
    })
  }
  wx.showNavigationBarLoading()
  return new Promise((resolve, reject) => {
    wx.request({
      url: webUrl + url,
      data: parms,
      method: methods,
      header: {
        "content-type": "application/json;"
      },
      success(res) {
        if (res.data.respCode == '0000') {
          if (loading == true) {
            wx.hideLoading()
          }
          wx.hideNavigationBarLoading()
          return resolve(res.data)
        } else {
          wx.hideLoading()
          wx.showModal({
            title: '网络繁忙',
            content: '服务器遇到问题了，工程师正在全力抢救中',
            showCancel: false, //是否显示取消按钮
            confirmText: "确定", //默认是“取消”
            success: function (res) {
              if (!res.cancel) {
                if (getCurrentPages().length != 1) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            }
          })
          return reject(res)
        }
      },
      fail() {
        wx.hideLoading()
        wx.showModal({
          title: '网络错误',
          content: '请注意是否网络通畅!',
          showCancel: false, //是否显示取消按钮
          confirmText: "确定", //默认是“取消”
          confirmColor: 'red', //取消文字的颜色
          success: function (res) {
            if (!res.cancel) {
              if (getCurrentPages().length != 1) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          }
        })
      }
    })
  })
}
module.exports = {
  request
}
