const cache = require("../../utils/cache.js");
const app = getApp()
const url = app.baseUrl + "service-member/";
let timer, index = 0, off = false
import axios from '../../utils/axios.js';
import request from '../../utils/my_page'
Page({
  data: {
    img: '',
    name: '',
    Tabindex: 1,
    checked: false,
    payImg: '../../images/pay-checked.svg',
    payIndex: 1,
    pay: [{ checked: 1 }, { checked: 0 }],
    price: 29.9,
    experienceCardUsed: false,
    referenceCode: '',
    value: '',
    vipText: "",
    model: false,
    show: false,
    payShow: false,
    renewal: true,
    automaticModel: false,
    isVip: false,
    firstValue: 9.8,
    autoText: '开启自动续费，可随时取消',
    isRadio: false,
    isAutomagin: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.user()
    const that = this, img = wx.getStorageSync('img'), name = wx.getStorageSync('name')
    if (img || name) {
      this.setData({
        img,
        name
      })
    }
    this.pickUpInformation()

    const { Tabindex, pay } = that.data
    if (Tabindex == 1) {
      const arr = pay
      arr[0].checked = 0, arr[1].checked = 1
      that.setData({
        pay: arr,
        payIndex: 2
      })
    } else {
      const arr = pay
      arr[0].checked = 1, arr[1].checked = 0
      that.setData({
        pay: arr,
        payIndex: 1
      })
    }
    this.http()
    this.checkAutomagin()
  },
  http() {
    let that = this
    wx.request({
      url: url + "query/all/pmCards",
      method: 'GET',
      header: {
        'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
      },
      success: function (rest) {
        let arr
        const length = rest.data.respData.length
        if (rest.data.respData !== null && rest.data.respData.length !== 0) {
          for (let i = 0; i < length; i++) {
            if (rest.data.respData[i].monthName == "1个月") {
              arr = rest.data.respData[i]
              break;
            }
          }
          that.setData({
            chose: arr,
            price: arr.price
          })
        }
      }
    })
  },
  onChange(e) {
    const that = this
    let reg = /\s/
    if (reg.test(e.detail.value)) {
      console.log('有空格')
      that.setData({
        value: that.data.value
      })
    } else {
      that.setData({
        value: e.detail.value
      })
    }

  },
  tabbar(e) {
    const index = e.currentTarget.dataset.index
    const { pay } = this.data
    if (index != this.data.Tabindex) {
      this.setData({
        Tabindex: index
      })
    }
    if (index == 2) {
      const arr = pay
      arr[0].checked = 1, arr[1].checked = 0
      this.setData({
        pay: arr,
        payIndex: 1
      })
    } else {
      const arr = pay
      arr[0].checked = 0, arr[1].checked = 1
      this.setData({
        pay: arr,
        payIndex: 2
      })
    }
  },
  radioChange(e) {
    const index = e.detail.value
    if (index == 0) {
      const arr = this.data.pay
      arr[0].checked = 1, arr[1].checked = 0
      this.setData({
        pay: arr
      })
    } else {
      const arr = this.data.pay
      arr[1].checked = 1, arr[0].checked = 0
      this.setData({
        pay: arr
      })
    }
  },
  renew() {
    // wx.showToast({
    //   title: '功能暂未开启',
    //   icon: 'none'
    // })
    if (this.data.renewal == true) {
      this.setData({
        automaticModel: true
      })
    } else {
      this.setData({
        renewal: true
      })
    }
  },
  pay() {
    const { Tabindex } = this.data
    // 1 领取体验卡 2 购买会员卡
    if (Tabindex == 2) {
      if (this.data.isRadio == false && this.data.renewal == true) {
        this.automatic()
      } else {
        this.payVip()
      }

    } else {
      if (this.data.value.length == 5 || this.data.referenceCode != '') {
        if (!this.data.disable) {
          this.setData({
            disable: true
          })
          request('/service-user/public/member/doors', {}, true, 'GET').then(res => {   //获取首单价格
            this.setData({
              firstValue: res.respData
            })
          })
          wx.showLoading({
            title: '领取中...',
            mask: true,
          });
          const data = {
          }
          request(`/service-member/public/reference/exchange/${wx.getStorageSync('userId')}/${this.data.referenceCode == '' ? this.data.value : this.data.referenceCode}`, data, true, 'GET').then(res => {
            this.setData({
              disable: false
            })

            if (res.respCode == '0000' && res.respDesc == '领取成功') {
              request(`/service-member/public/pop/invitation/${wx.getStorageSync('userId')}`, {}, true, 'GET').then(res => {
                this.setData({
                  isVip: res.respData
                })
              })
              if (res.respData == null || res.respData == false) {
                this.setData({
                  model: true
                })
              }
              this.user()
              wx.showToast({
                title: res.respDesc,
              })
              const arr = this.data.pay
              this.setData({
                experienceCardUsed: true,
                pay: arr,
                Tabindex: 2,
                payIndex: 1
              })
            } else {
              wx.showToast({
                title: res.respDesc,
                icon: 'none'
              })
            }
          }).catch(err => {
            this.setData({
              disable: false
            })
          })
        }
      } else {
        wx.showToast({
          title: '请输入5位邀请码',
          icon: 'none'
        })
      }
    }
  },
  closeAuto() {
    this.setData({
      automaticModel: false,
      renewal: false
    })
  },
  closeVip() {
    this.setData({
      isVip: false
    })
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
  payVip() {
    let p = {
      "itemNo": this.data.chose.cardNo, //商品编号
      "quantity": 1, //商品数量
      "salePrice": this.data.chose.price, //商品原价
      "vipPrice": this.data.chose.price, //会员价
      "itemName": this.data.chose.cardName, //商品名
      "weight": 10, //商品重量
    }

    let data = {
      "branchNo": app.globalData.branch.branchNo,
      "pickUpString": '',
      "orderType": "SELF",
      "pickUpTime": '',
      "items": [p],
      "locationId": "",
      "totalFee": this.data.price,
      "couponNo": "", //券编号
      "planNo": "", //促销编号
      "planId": "", //方案id
      "notes": "", //订单备注
    }
    let that = this
    wx.showLoading({
      title: '支付中',
      mask: true
    })
    if (!that.data.disable) {
      this.setData({
        disable: true
      })
      wx.request({
        url: app.baseUrl + 'service-member/member/new/prepay',
        method: "POST",
        data: data,
        header: {
          'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null')
        },
        success(rest) {
          // 请求支付
          wx.hideLoading()
          if (rest.data.respCode == '0000') {
            wx.requestPayment({
              timeStamp: rest.data.respData.timeStamp,
              nonceStr: rest.data.respData.nonceStr,
              package: rest.data.respData.package,
              signType: rest.data.respData.signType,
              paySign: rest.data.respData.paySign,
              success() { //支付成功
                that.setData({
                  disable: false
                })
                wx.redirectTo({
                  url: `/pages/paySuc/paySuc?payprice=${that.data.price}&payType=renewal`
                })
                setTimeout(() => {
                  that.user()
                }, 2000)
              },
              fail() {
                wx.showToast({
                  title: '已取消支付',
                  icon: 'none'
                })
                that.setData({
                  disable: false
                })
              }
            })
          } else {
            wx.hideLoading()
            that.setData({
              disable: false
            })
            wx.showToast({
              title: '支付失败',
              icon: "none"
            })
          }
        },
        fail() {
          wx.hideLoading()
          that.setData({
            disable: false
          })
          wx.showToast({
            title: '支付失败',
            icon: "none"
          })
        }
      })
    }
  },
  user() {
    const user = axios.getData({ url: `${app.baseUrl}service-member/new/query/usrInfo`, header: { 'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null') }, isToast: true });
    Promise.all([user]).then(res => {
      let userInfo = res[0].data.respData;
      if (userInfo.memberStatus == 'EXPIRED_MEMBERS') {
        this.setData({
          vipText: `过期 ${Math.abs(userInfo.expiredDate)} 天`
        })
      } else if (userInfo.memberStatus == 'MEMBERS' || userInfo.memberStatus == 'EXPERIENCE' || userInfo.memberStatus == 'ENTERPRISE') {
        this.setData({
          vipText: `${userInfo.effectiveTo} 到期`
        })
      } else if (userInfo.memberStatus == 'NON_MEMBERS') {
        this.setData({
          vipText: `未开通会员`
        })
      }
      this.setData({
        experienceCardUsed: userInfo.experienceCardUsed,
        referenceCode: userInfo.referenceCode
      }, () => {
        this.setData({
          show: true,
          payShow: true
        })
      })
      if (userInfo.experienceCardUsed != false) {
        const arr = this.data.pay
        arr[0].checked = 1, arr[1].checked = 0
        this.setData({
          pay: arr,
          payIndex: 1,
          Tabindex: 2,
        })
      }
    })

  },
  checked(index = 1, payIndex = 1) {
    const arr = [...this.data.pay]
    arr.map((item, index) => {
      item.checked = false
    })
    arr[index].checked = true
    this.setData({
      pay: arr,
      payIndex
    })
  },
  toOrderDetails() {
    wx.navigateTo({
      url: '/my_member/orderDetails/orderDetails?status=sendMember&isHome=true'
    })
  },
  toInviteFriends() {
    wx.navigateTo({
      url: '/my_member/inviteFriends/inviteFriends?isHome=true'
    })
  },
  // 会员权益
  toOpenVip() {
    wx.navigateTo({
      url: '/my_member/openVip/openVip?status=vipInterests',
    })
  },
  close() {
    this.setData({
      model: false
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  onShow() {
    this.user()
    let that = this
    if (off) {
      off = false
      timer = setTimeout(() => {
        that.checkAutomagin()
        if (that.data.isRadio == true) {
          clearTimeout(timer)
        }
      }, 1500)
    }

  },
  pickUpInformation() {
    const that = this
    wx.getUserInfo({
      withCredentials: 'false',
      lang: 'zh_CN',
      timeout: 10000,
      success: (result) => {
        if (wx.getStorageSync('img') != result.userInfo.avatarUrl || wx.getStorageSync('name') != result.userInfo.nickName) {
          wx.setStorageSync('img', result.userInfo.avatarUrl)
          wx.setStorageSync('name', result.userInfo.nickName)
          that.setData({
            img: result.userInfo.avatarUrl,
            name: result.userInfo.nickName
          })
        }
      },
      fail: () => { },
      complete: () => { }
    });
  },
  // 活动说明
  toActivity: function (e) {
    wx.navigateTo({
      url: `/my_member/eventDesc/eventDesc?status=${e.currentTarget.dataset.status}`
    })
  },
  toMyPage() {
    wx.switchTab({
      url: "/pages/myPage/myPage"
    })
  },
  freeBuy: function (e) {
    const { memberStatus } = wx.getStorageSync('userInfo')
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
  // 跳转详情页
  toDetail: function (e) {
    wx.navigateTo({
      url: `/my_member/orderDetails/orderDetails?status=${e.currentTarget.dataset.status}`
    })
  },
  AutoRenew() {
    this.setData({
      automaticModel: false
    })
  },
  automatic() {  //开通自动续费
    wx.showLoading()
    let that = this
    request(`/service-member/public/signing/coutinual/member/${wx.getStorageSync("open")}/CHARGE`, {}, true, 'GET').then(res => {
      let data = res.data
      let extraData = {
        appid: data.appId,
        mch_id: data.mchId,
        plan_id: data.planId,
        contract_code: data.contractCode,
        request_serial: data.requestSerial,
        contract_display_account: data.contractDisplayAccount,
        notify_url: data.notifyUrl,
        sign: data.sign,
        timestamp: data.timestamp
      }
      wx.hideLoading()
      wx.navigateToMiniProgram({
        appId: 'wxbd687630cd02ce1d', //固定值，这个是填写微信官方签约小程序的id
        extraData,
        path: 'pages/index/index',
        success(res) {
          off = true
          that.setData({
            automaticModel: false
          }, () => {
            that.payVip()
          })
          // wx.setStorageSync('contract_id', "");
          // me.globalData.contract_id = "";
          // 成功跳转到签约小程序 
        },
        fail(res) {
          that.setData({
            automaticModel: false
          })
          wx.showToast({
            title: '开通失败',
            icon: 'none'
          })
          console.log(res);
          // 未成功跳转到签约小程序 
        }
      });
      // that.setData({
      //   extradata:data
      // })
    })
  },
  checkAutomagin() {
    request(`/service-member/public/check/countinual/${wx.getStorageSync("userId")}`, {}, true, 'GET').then(res => {
      if (res.respData) {
        this.setData({
          isRadio: true,
          isAutomagin: res.respData,//自动续费  true 开  false:没开,
          autoText: '已开通自动续费，可去微信支付中关闭',
          renewal: false
        })
      }
    })
  }
})