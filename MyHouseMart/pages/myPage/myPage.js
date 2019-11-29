const app = getApp();
const utils = require("../../utils/util.js");
const cache = require("../../utils/cache.js");
import { base64src } from '../../utils/base64src.js'
import axios from '../../utils/axios.js';
let show = true, defaultImg = 'https://antspace-prod-img-1.oss-cn-shenzhen.aliyuncs.com/16b5af2afaa.png'
Page({
  data: {
    showCanvas: true,
    imageCode: '',
    quit: false,
    couponNum: 0, //优惠券个数
    productCouponNum: 0, //商品券个数
    userAuthorization: true,
    isMember: false, //是否已是我家企业会员
    isShowCard: false, //展示我家会员提示
    cardNo: 0,
    effectiveToCard: '', //我家企业会员卡有效期
    slideupAnimation: '',
    slideup: true,//是否收起
    userImg: '',//用户头像
    userName: '',//用户昵称
    userInfo: {},//用户信息
    greatPackage: [],//超值大礼包
    memberPromotions: [],//新会员超值购
    amount: {},
    isLoading: false,
    screenWidth: 0,
    screenHeight: 0,
    model: null,
  },
  //跳转商品详情页
  details(e) {
    let { status, item: details, iscanbuy} = e.currentTarget.dataset
    details.remarksName = details.remarksName.replace("'", "").replace("&", "").replace("=", "");
    details.itemName = details.itemName.replace("'", "").replace("&", "").replace("=", "");
    if(iscanbuy){
      wx.navigateTo({
        url: `/pages/goodsDetails/goodsDetails?details=${JSON.stringify(details)}&type=gift&status=${status}`
      })
    }
  },
  militaryExploits: function () { //跳转邀请战绩
    let that = this
    if (that.data.userAuthorization) {
      wx.navigateTo({
        url: '/my_member/militaryExploits/militaryExploits',
      })
    } else {
      that.toLogin()
    }
  },
  rollSkip: function () {
    if (this.data.userAuthorization) {
      wx.navigateTo({
        url: '/pages/discountCoupon/discountCoupon',
        // url:'/pages/ticketCenter/ticketCenter'
      })
    } else {
      this.toLogin()
    }
  },
  toLogin: function () {
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },
  //获取手机号码
  number: function (e) {
    let that = this
    if (e.detail.iv) {
      utils.wxLogin(res => {
        axios.postData({
          url: `${app.baseUrl}service-member/public/weChat/update/mobil`,
          data: {
            "jsCode": res,
            "encryptedData": e.detail.encryptedData,
            "iv": e.detail.iv
          }
        }).then(res => {
          that.showToast('绑定成功');
          let { userInfo } = that.data
          userInfo = { ...userInfo, mobile: res.data.respDesc, isMobile: false }
          that.setData({ userInfo })
        }, res => {//失败
          that.showToast(res.data.respDesc)
        })
      }, res => {//失败
        that.showToast(res.data.respDesc)
      })
    }
  },
  //跳转二维码
  yardSkip: function () {
    let that = this
    if (that.data.userAuthorization) {
      if (show) {
        show = false
        wx.navigateTo({
          url: `../codePay/codePay?money=${that.data.userInfo.balanceAmount}`
        })
      }
    } else {
      that.toLogin();
    }
  },
  // 跳转会员支付页面
  skipVip: function () {
    let that = this
    if (that.data.userAuthorization) {
      wx.navigateTo({
        url: '/my_member/openVip/openVip?status=openVip',
      })
    } else {
      that.toLogin();
    }
  },
  //跳转优惠券页面
  discount: function () {
    let that = this
    if (that.data.userAuthorization) {
      wx.navigateTo({
        url: `../discountCoupon/discountCoupon`,
      })
    } else {
      that.toLogin();
    }
  },
  onLoad: function (options) { },
  //跳转到购买会员卡页
  skip: app.debounce1(function () {
    let that = this
    if (that.data.userAuthorization) {
      const { isSkip, experienceCardUsed, isExpired } = that.data.userInfo
      if (isSkip) {
        wx.navigateTo({
          url: experienceCardUsed || !isExpired ? '../../my_member/JoinMember/JoinMember' : '../../my_member/giftPacks/giftPacks'
        })
      }
    } else {
      that.toLogin();
    }
  }, 1000),
  // 会员介绍页
  skipToVip: app.debounce1(function () {
    wx.navigateTo({
      url: '/my_member/giftPacks/giftPacks',
    })
  }, 1000),
  //跳转到钱包
  toWallet: function () {
    let that = this
    if (that.data.userAuthorization) {
      wx.navigateTo({
        url: '/my_member/wallet/wallet',
      })
    } else {
      that.toLogin();
    }
  },
  // 加载页面基本数据
  showPageData: function () {
    let that = this, isLoading = true
    that.data.userInfo.isSkip = false//禁止立即续费跳转
    const userInfo = axios.getData({ url: `${app.baseUrl}service-member/new/query/usrInfo`, header: { 'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null') } });//用户基本数据
    const pullNew = axios.getData({ url: `${app.baseUrl}service-member/public/get/my/home/statistics/info?userId=${cache.get("userId", null)}` })// 个人中心会员拉新相关统计数据
    const greatUrl = axios.getData({ url: `${app.baseUrl}service-item/user/include/member/combination/${app.globalData.branch.branchNo}/${cache.get("userId", null)}` })//超值大礼包
    const getOpneId = axios.getData({ url: `${app.baseUrl}service-order-prc/saleOrder/queryopenid?sessionId=${cache.get("sessionId", "null")}` })//获取openId
    const getMember = axios.getData({ url: `${app.baseUrl}service-item/user/new/member/item/${app.globalData.branch.branchNo}/${cache.get("userId", null)}` }) //新会员超值购
    Promise.all([userInfo, pullNew, greatUrl, getOpneId, getMember]).then(res => {
      // console.log(res);
      let userInfo = res[0].data.respData, greatPackage = [], amount = {}, memberPromotions = []
      const { experienceCardUsed, effectiveTo, memberStatus, expiredDate } = userInfo;
      const isChargeTime = res[2].data.respData ? res[2].data.respData.status == 1 ? false : true : true // 超值大礼包
      cache.put("open", res[3].data.respData.openId) //获取openId
      const isfirstPackStatus = res[4].data.respData ? res[4].data.respData.status == 1 ? true : false : false // 新会员超值购 true 可购买 false 不可购买
      const { memberName, memberImg } = utils.chmemberName(memberStatus, expiredDate)
      const now_date = utils.getNowDate(new Date())
      const isExpired = memberStatus != 'NON_MEMBERS' ? utils.compareDate(now_date, effectiveTo) : true
      const userText = memberStatus == 'NON_MEMBERS' ? '未开通会员' : `${effectiveTo} 过期`
      const distanceDays = that.datedifference(now_date, effectiveTo), isMobile = userInfo.mobile ? false : true // isExpired true 已过期  false 未过期
      userInfo = { ...userInfo, effectiveTo, isChargeTime, isExpired, experienceCardUsed, isfirstPackStatus, memberName, memberImg, userText, isSkip: true, hasTerminate: false, distanceDays, isMobile }
      wx.setStorageSync("userInfo", userInfo)
      if (userInfo.uniqueCode) {//获取base64图片数据
        wx.request({
          url: `${app.baseUrl}service-member/public/wx/code`,
          data: {
            "scene": "referenceCode=" + userInfo.uniqueCode,
            "page": null,
            "width": 200
          },
          method: 'POST',
          responseType: 'arraybuffer',
          success: res => {
            const that = this
            let base64 = wx.arrayBufferToBase64(res.data);
            base64 = 'data:image/jpeg;base64,' + base64;
            that.setData({ imageCode: base64 })
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
      }
      if (res[1].data.respData) {// 个人中心会员拉新相关统计数据
        amount = res[1].data.respData
        const cashPayPercent = (amount.cashPayPercent * 100).toFixed, //现金支出比例
          cashPercent = 100 - cashPayPercent, //返现钱包比例
          progress_pay_width = (Number(cashPayPercent) / 100) * 700,//现金支出比例 百分比
          progress_act_width = (Number(cashPercent) / 100) * 700,//返现钱包比例 百分比
          parallelogram = (Number(cashPayPercent) / 100) * 700 - 8;//白条所在位置
        amount = { ...amount, cashPayPercent, cashPercent, progress_pay_width, progress_act_width, parallelogram }
      }
      if (res[2].data.respData) {//超值大礼包
        greatPackage = (res[2].data.respData.itemPromotions)
        greatPackage.map(item => {
          item.picAddr = item.picAddr ? item.picAddr : defaultImg
          item.thumbPic = item.picAddr ? item.picAddr : defaultImg
          item.isCombined = 'Y'//是否套餐
          item.combSubItems[0].blId = item.combSubItems[0].blId ? item.combSubItems[0].blId : 0
          item.comb = false
          let { combSubItems } = item, disPrice = 0
          combSubItems.map(data => {
            data.bizLine = data.bizLine ? data.bizLine : 0
            data.isCombined = 'Y'
            data.returnMoney = true
            disPrice += data.quantity * data.salePrice
          })
          item.disPrice = item.salePrice
          item.salePrice = disPrice
        })
      }
      if (res[4].data.respData) {//新会员超值购
        let { itemPromotions: result } = res[4].data.respData
        result.map(item => {
          item.picAddr = item.picAddr ? item.picAddr : defaultImg
          item.thumbPic = item.picAddr ? item.picAddr : defaultImg
          item.isCombined = 'Y'//是否套餐
          item.combSubItems[0].blId = item.combSubItems[0].blId ? item.combSubItems[0].blId : 0
          item.comb = false
          let { combSubItems } = item, disPrice = 0
          combSubItems.map(data => {
            data.isCombined = 'Y'
            data.returnMoney = true
            disPrice += data.quantity * data.salePrice
          })
          item.disPrice = item.salePrice
          item.salePrice = disPrice
        })
        for (let i = 0; i < result.length; i += 2) {
          memberPromotions.push(result.slice(i, i + 2));
        }
      }
      that.setData({ amount, userInfo, greatPackage, memberPromotions, isLoading })
      if (isExpired) {//已过期 有两个数据 true
        axios.getData({ url: `${app.baseUrl}service-member/public/get/my/home/invalid/member/renew/alert/info?userId=${cache.get("userId", null)}`, isToast: true }).then(res => {
          if (res.data.respData) {
            let { lastTransDate } = res.data.respData
            wx.getSystemInfo({
              success: function (rest) {
                let timestr = rest.platform == "ios" ? lastTransDate.slice(0, 10).replace('/-/g', '/') : lastTransDate.slice(0, 10)
                const hasTerminate = that.datedifference(now_date, timestr) == 0 ? true : false // 是否是当天 非当天消失
                userInfo = { ...userInfo, ...res.data.respData, hasTerminate }
                that.setData({ userInfo })
              }
            })
          }
        })
      } else {//未过期 过期前三天提示 只有一个数据 false
        axios.getData({ url: `${app.baseUrl}service-member/public/get/my/home/valid/member/renew/alert/info?userId=${cache.get("userId", null)}`, isToast: true }).then(res => {
          const isshow = distanceDays <= 3 && !isExpired //未过期 过期前三天
          userInfo = { ...userInfo, cashbackAmount: res.data.respData, hasTerminate: res.data.respData != 0 && isshow ? true : false }//是否展示立即续费提示条
          that.setData({ userInfo })
        })
      }
    }).catch(err => {
      console.log(err);
      that.setData({ isLoading })
      that.showToast('网络开小差了,请稍后重试')
    })
  },
  //点击开通刷脸
  openFacePay: function () {
    let that = this
    if (that.data.userAuthorization) {
      wx.navigateTo({
        url: that.data.userInfo.facePayEnable ? '../gatherSet/gatherSet' : '../gather/gather',
      })
    } else {
      that.toLogin();
    }
  },
  // 弹窗
  toInvite: function () {
    let that = this
    if (that.data.userAuthorization) {
      const { firstOrderState, memberStatus } = that.data.userInfo
      if (!firstOrderState || memberStatus == 'NON_MEMBERS' || memberStatus == 'EXPIRED_MEMBERS') {//未激活
        wx.navigateTo({
          url: `/my_member/inviteFriends/inviteFriends`
        })
      } else {//已激活
        that.setData({
          showCanvas: false
        })
      }
    } else {
      that.toLogin()
    }
  },
  // 跳转地址页
  myOrder: function () {
    let that = this
    if (that.data.userAuthorization) {
      wx.navigateTo({
        url: '../location/location',
      })
    } else {
      that.toLogin();
    }
  },
  // 联系客服
  toCustomer: function () {
    let that = this
    if (!that.data.userAuthorization) {
      that.toLogin()
    }
  },
  //扫一扫功能
  scanCode: function () {
    let that = this
    if (that.data.userAuthorization) {
      wx.scanCode({
        success: (res) => {
          if (res.result) {
            const cardNo = res.result;
            if (that.isCardNo(cardNo)) { //判断是否是正确的cardNo
              that.setData({ cardNo })
              axios.getData({
                isToast: true,
                url: `${app.baseUrl}service-member/public/get/enterprise/card/${cardNo}/${cache.get("userId", null)}`
              }).then(res => {
                if (res.data.respCode == '0000') {
                  that.setData({
                    isMember: res.data.respData.scan,
                    effectiveToCard: res.data.respData.effectiveTo, //有效期至
                    isShowCard: true,
                  })
                } else { //无效
                  const desc = res.data.respDesc ? res.data.respDesc : '请扫描正确的会员卡二维码'
                  that.showToast(desc)
                }
              })
            } else {
              that.showToast('请扫描正确的会员卡二维码');
            }
          } else {
            that.showToast('请扫描正确的会员卡二维码');
          }
        },
        fail: () => {
          that.showToast('扫描二维码失败');
        }
      })
    } else {
      that.toLogin();
    }
  },
  onShow: function () {
    let that = this, isLoading = true
    show = true  //进入会员码防连击
    if (app.globalData.quit) {
      that.setData({ quit: false })
    }
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"]) { //true  代表已经获取信息
          that.setData({ userAuthorization: true })
          that.getUserInfos()
          that.showPageData()
        } else {
          that.setData({ userAuthorization: false, isLoading })
        }
      }
    })
  },
  getUserInfos: function () {
    let that = this
    wx.getUserInfo({
      withCredentials: 'false',
      lang: 'zh_CN',
      timeout: 10000,
      success: (result) => {
        that.setData({
          userImg: result.userInfo.avatarUrl,
          userName: result.userInfo.nickName
        })
      }
    });
  },
  // 用户点击右上角分享
  onShareAppMessage: function (options) {
    let shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi',
      imgUrl: '',
      success: function () { },
    };
    return shareObj;
  },
  isCardNo: function (cardNo) {
    const reg = /^400-8888-\d+$/;
    return reg.test(cardNo)
  },
  // 立即加入 非企业会员
  joinNow: function () {
    let that = this, { userInfo } = that.data
    axios.getData({
      isToast: true,
      url: `${app.baseUrl}service-member/public/register/enterprise/member/${that.data.cardNo}/${cache.get("userId", null)}`
    }).then(res => {
      that.showToast('加入成功');
      userInfo = { ...userInfo, memberStatus: 'ENTERPRISE', memberName: '我家企业会员', memberImg: 'ENTERPRISE', isShowCard: false, effectiveTo: res.data.respData.effectiveTo }
      that.setData({ userInfo })
    }, () => {
      that.setData({ isShowCard: false })
    })
  },
  // 不加入 我知道了
  noJoin: function () {
    this.setData({ isShowCard: false })
  },
  // 验证提示
  showToast: function (tips) {
    wx.showToast({ title: tips, icon: 'none', duration: 1500 })
  },
  slideup: function () {
    let that = this
    that.setData({
      slideupAnimation: that.data.slideup ? 'animation:slideIn 0.3s linear;height:530rpx;' : 'animation:slideOut 0.3s linear;height:290rpx;',
      slideup: !that.data.slideup
    })
  },
  freeBuy: function (e) {
    const { memberStatus } = this.data.userInfo
    const { iscanbuy, item: items, status } = e.currentTarget.dataset
    if (iscanbuy) {
      const { salePrice: originaPrice, disPrice: totalPrice } = items
      let { combSubItems, orderItemType } = items, order = [], itemQty = 0
      combSubItems.map(item => {
        item.orderItemType = orderItemType
        itemQty += item.quantity
      })
      items.isCombined = 'Y'
      items.itemQty = itemQty
      items.quantity = 1
      items.blId = items.blId ? items.blId : 0
      items.returnMoney = status == 'firstFree' ? true : false
      items.refundValue = status == 'firstFree' ? items.disPrice : items.refundValue * 1
      order.push(items)
      app.globalData.order = order
      // 首单免费 需要是会员
      if (status == 'firstFree' && memberStatus == 'NON_MEMBERS' || status == 'firstFree' && memberStatus == 'EXPIRED_MEMBERS') {
        this.showToast('你还不是会员')
      } else {
        wx.navigateTo({
          url: `/pages/confirmOrder/confirmOrder?commoditStatus=myPage&originaPrice=${originaPrice}&totalPrice=${totalPrice}&status=${status}`
        })
      }
    }
  },
  // 活动说明
  toActivity: function (e) {
    let that = this
    if (that.data.userAuthorization) {
      wx.navigateTo({
        url: `/my_member/eventDesc/eventDesc?status=${e.currentTarget.dataset.status}`
        // url: `/my_member/orderDetails/orderDetails?status=${e.currentTarget.dataset.status}`
      })
    } else {
      that.toLogin()
    }
  },
  // 入会邀请
  toJoin: function () {
    let that = this
    if (that.data.userAuthorization) {
      wx.navigateTo({
        url: `/my_member/inviteFriends/inviteFriends`
      })
    } else {
      that.toLogin()
    }
  },
  // 比较两个日期距离天数
  datedifference: function (sDate1, sDate2) {
    return Math.floor(Math.abs(Date.parse(sDate1) - Date.parse(sDate2)) / (24 * 3600 * 1000))
  },
  preventTouchMove: function () { },
  // 面对面邀请
  onFaceInvitation: function () {
    this.setData({ showCanvas: false })
  },

  // 关闭弹窗
  close: function () {
    this.setData({ showCanvas: true })
  },

  // 点击保存分享码
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

  // 画出需要保存的图片
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
    ctx.fillText('可加二维码发朋友圈', 95 * rpx, 330 * rpx);
    ctx.restore();
    ctx.save();
    ctx.draw();
  },
  // 保存二维码到相册
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
          wx.hideLoading();
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
  }
})