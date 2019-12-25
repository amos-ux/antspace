import QRCode from '../../utils/qrcode.js';
import _http from '../../utils/request.js';
import { base64src } from '../../utils/base64src.js'
const cache = require("../../utils/cache.js");
const call = require("../../utils/call.js");
const app = getApp();
const urlMember = app.baseUrl + "service-member/";
Page({
  data: {
    showCanvas: true,
    chargeRefund: 0,
    newMemberRefund: 0,
    showImage: "",
    imageCode: '',
    userInfo: {
      referenceCode: 'ASD213'
    },
    gradeInfo: {
      onTheWaySize: 0,
      successSize: 0
    },
    showRedContent: "A",
    formId: null,
    screenWidth: 0,
    screenHeight: 0,
    model: null,
    money: "9.8",
    isHome: false,
    siteLevelValue: ""
  },
  skipBile() {
    if (cache.get("item", "null") != "null") {
      let item = cache.get("item", "null")
      wx.navigateTo({
        url: '/soul_cards/cardFood/cardFood?item=' + JSON.stringify(item),
      })
    } else {
        wx.switchTab({
          url: '/pages/index/index',
        })
    }

  },

  preventTouchMove: function () { },
  joinPreference() {
    wx.navigateTo({
      url: '/my_member/orderDetails/orderDetails?status=sendMember',
    })
  },
  joinVip() {
    wx.navigateTo({
      url: '/my_member/JoinMember/JoinMember',
    })
  },
  bindsubmit(e) {
    this.setData({
      formId: e.detail.formId
    })
  },
  vtRenew() {
    wx.navigateTo({
      url: '/my_member/JoinMember/JoinMember',
    })
  },
  //控制提示 
  control() {
    _http.get({
      url: `${app.baseUrl}service-user/public/get/auto/close/po/INVITA_BETA_TIPS`
    }).then(res => {
      this.setData({
        siteLevelValue: res.data[0].siteLevelValue
      })
      console.log(this.data.siteLevelValue)
    })
  },
  code() {
    let data = {
      "scene": "referenceCode-" + this.data.userInfo.uniqueCode,
      "page": null,
      "width": 200
    }
    wx.request({
      url: `${app.baseUrl}service-member/public/wx/code`,
      data: data,
      method: 'POST',
      responseType: 'arraybuffer',
      success: res => {
        let base64 = wx.arrayBufferToBase64(res.data);
        base64 = 'data:image/jpeg;base64,' + base64;
        this.setData({
          imageCode: base64
        });
        //这个就是src   imageCode
        const that = this
        wx.getSystemInfo({
          success: function (res) {
            that.setData({
              model: res.model,
              screenWidth: res.windowWidth / 375,
              screenHeight: res.windowHeight
            })
          },
        })
        base64src(that.data.imageCode, res => {
          that.canvas(res)
        });
      }
    })
  },
  click: function () {
    wx.navigateTo({
      url: '/my_member/militaryExploits/militaryExploits',
    })
  },
  money() {
    _http.get({
      url: `${app.baseUrl}service-user/public/member/doors`
    }).then(res => {
      this.setData({
        money: res.data
      })
      console.log(res)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.isHome) {
      this.setData({
        isHome: true
      })
    }
    // this.getChargeRefund();
    this.money()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getUserInfo();
    this.control()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let that = this
    var shareObj = {
      title: "在吗？这里有一个赚(hao)返(yang)现(mao)的机会!",
      path: '/pages/connectWifi/connectWifi?referenceCode=' + that.data.userInfo.uniqueCode + "&formId=" + this.data.formId,
      imageUrl: 'https://antspace-dev-img-1.oss-cn-shenzhen.aliyuncs.com/f2476719829745d182da52f791823ab1.jpg',
      success: function (res) { },
    };
    if (options.from == 'button') {
      shareObj = {
        title: "在吗？这里有一个赚(hao)返(yang)现(mao)的机会！",
        path: '/pages/connectWifi/connectWifi?referenceCode=' + that.data.userInfo.uniqueCode + "&formId=" + this.data.formId,
        imageUrl: 'https://antspace-dev-img-1.oss-cn-shenzhen.aliyuncs.com/f2476719829745d182da52f791823ab1.jpg',
        success(res) {

        },
      }
    }
    return shareObj;
  },

  /**
   * 面对面邀请
   */
  onFaceInvitation: function () {
    this.setData({
      showCanvas: false
    })
  },

  qrCode(data) {
    new QRCode('myQrcode', {
      text: data,
      width: 150,
      height: 150,
    })
  },
  /**
   * 一键复制事件
   */
  copyBtn: function (e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.userInfo.uniqueCode,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },

  /**
   * 获取返现金额
   */
  getChargeRefund() {
    _http.get({
      url: `${urlMember}public/get/member/refund`
    }).then((res) => {
      if (res) {
        this.setData({
          chargeRefund: res.data.chargeRefund,
          newMemberRefund: res.data.newMemberRefund
        })
      }
    })
  },

  /**
   * 获取用户基本数据
   */
  getUserInfo() {
    wx.getStorageInfoSync('userInfo')
    // wx.showLoading({
    //   title: '加载中',
    // })
    const userInfo = _http.get({
      url: `${urlMember}new/query/usrInfo`,
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      }
    }).then((res) => {
      if (res) {
        console.log(res)
        this.setData({
          userInfo: res.data
        });
        this.code();
        this.getGrade();
      }
      // wx.hideLoading()
    })
  },
  //获取邀请战绩
  getGrade() {
    _http.get({
      url: `${urlMember}public/get/my/home/invite/grade?userId=${cache.get("userId", "null")}&sort=DESC`
    }).then((res) => {
      if (res) {
        this.setData({
          gradeInfo: res.data
        })
      }
    })
  },
  close() {
    this.setData({
      showCanvas: true
    })
  },

  /**
   * 点击保存分享码
   */
  clickShare: function () {
    wx.showLoading({
      title: '正在保存',
    })
    let that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 594 * that.data.screenWidth,
      height: 716 * that.data.screenHeight,
      destWidth: that.screenWidth,
      destHeight: that.screenHeight,
      canvasId: 'shareImg',
      success: function (res) {
        that.saveImageToPhoto(res.tempFilePath);
      }
    })
  },

  //画出需要保存的图片
  canvas(e) {
    let that = this;
    let rpx = that.data.screenWidth;
    const ctx = wx.createCanvasContext('shareImg');
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    that.roundRectColor(ctx, 0, 0, 297 * rpx, 358 * rpx, 40, '#EB4444');
    that.roundRectColor(ctx, 34 * rpx, 34 * rpx, 229 * rpx, 270 * rpx, 20, '#fff');
    ctx.fillStyle = "#2B2D33";
    ctx.setFontSize(20 * rpx)
    ctx.font = 'normal 500  Source Han Sans CN';
    ctx.fillText('邀好友 扫码领会员', 66 * rpx, 80 * rpx);
    ctx.drawImage(e, 73 * rpx, 96 * rpx, 152, 144);
    ctx.font = 'normal 400  Source Han Sans CN';
    ctx.setFontSize(14 * rpx)
    ctx.fillText('微信扫一扫', 114 * rpx, 268 * rpx);
    that.roundRectColor(ctx, 85 * rpx, 313 * rpx, 132 * rpx, 24 * rpx, 20, 'rgba(0,0,0,.11)');
    ctx.fillStyle = "#fff";
    ctx.setFontSize(12 * rpx);
    ctx.fillText('可将二维码发朋友圈', 95 * rpx, 330 * rpx);
    ctx.restore();
    ctx.save();
    ctx.draw();
  },

  saveImageToPhoto: function (e) {
    let that = this
    if (e) {
      wx.saveImageToPhotosAlbum({
        filePath: e,
        success: function () {
          wx.hideLoading();
          wx.showModal({
            title: '保存图片成功',
            content: '图片已经保存到相册！',
            showCancel: false
          });
          that.setData({
            showCanvas: true
          })
        },
        fail: function (res) {
          that.setData({
            showCanvas: true
          })
          if (res.errMsg == "saveImageToPhotosAlbum:fail cancel") {
            wx.showModal({
              title: '保存图片失败',
              content: '您已取消保存图片到相册！',
              showCancel: false
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '保存图片失败，您可以点击确定设置获取相册权限后再尝试保存！',
              complete: function (res) {
                if (res.confirm) {
                  wx.openSetting({}) //打开小程序设置页面，可以设置权限
                } else {
                  wx.showModal({
                    title: '保存图片失败',
                    content: '您已取消保存图片到相册！',
                    showCancel: false
                  });
                }
              }
            });
          }
        }
      })
    }
  },
  //绘制圆角矩形（纯色填充）
  roundRectColor: function (context, x, y, w, h, r, color) {
    context.save();
    context.setFillStyle(color);
    context.setStrokeStyle(color)
    context.setLineJoin('round'); //交点设置成圆角
    context.setLineWidth(r);
    context.strokeRect(x + r / 2, y + r / 2, w - r, h - r);
    context.fillRect(x + r, y + r, w - r * 2, h - r * 2);
    context.stroke();
    context.closePath();
  },
  tohome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
})