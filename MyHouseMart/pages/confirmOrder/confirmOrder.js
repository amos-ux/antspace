import axios from '../../utils/axios.js';
const app = getApp();
const cache = require("../../utils/cache.js");
const util = require("../../utils/util.js")
const urlMall = app.baseUrl + "service-mall/";
const urlMember = app.baseUrl + "service-member/";
const urlItem = app.baseUrl + "service-item/";
const myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(19[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(16[0-9]{1})|(14[0-9]{1}))+\d{8})$/;
let presaleTime = 0, rpx = 0.5, deliveryFrom = 0, deliveryTo = 0, pickupFrom = 0, pickupTo = 0, couponLen = 0, useCoupon = {};
Page({
  data: {
    num: 1, //外送传1默认样式
    mobile: '', //用户手机号
    totalPrice: 0, //优惠价
    originaPrice: 0, //原价
    immediate: '去结算',
    payment: false, //控制支付禁用
    location: '',//用户选择地址
    shippingFee: 0, //配送费
    sendFeeIiemNo: '', //配送费商品号
    discounts: 0, //使用优惠券优惠的价格
    usable: '', //用户用券提示
    couponPrice: 0, //优惠券的价格
    planNo: '', //促销编号
    couponNo: '', //优惠券的编号
    planId: '', //方案ID
    aggregate: 0, //到店自提 没有运费
    preferentialCombined: 0, //优惠总和
    storeAddress: [], //存放店铺详细地址
    commonCommodity: [], //普通商品
    packageGoods: [], //套餐商品
    number: 0, //所有商品总数
    reAllMnt: 0, //返现总和
    outFoodNum: 0, //外卖数量 包装费
    amount: 0, //起送费
    ifPayAmt: false, //是否用余额支付,默认不使用
    ifCanAmt: true, //是否不能使用钱包支付--余额不足,默认可以使用
    Today: ['00', '00', '00'], //当前时间
    commoditStatus: '', //商品状态 区分 预售和秒杀
    tipsText: '', //门店提醒
    notes: '', //备注
    notifyText: '', //满额提示信息
    userInfo: null,//用户信息
    planNos: [],//券编号
    isPaying: false,//支付loading
    isreturnMoney: null,//是否全参与返现
    isRead: true, //是否阅读 售后服务条款 默认已阅
    afterDesc: false, //收货说明 默认不显示
    refundDesc: false, //退款说明 默认不显示
    isShowTips: false, //钱包和优惠券不能同时使用
    isShowNotify: false, //满减送券提醒
    isAllOutFood: false, //是否全部是外卖商品
    isShowLoading: true, //展示loading图
    notAllOutFood: false, //不全是外卖商品（可能包含便利店商品）
    isShowtipsText: false, //是否展示弹窗 默认不展示
    branchNo: 0,//店铺号
    status: '',//新会员超值购 sendMember 超值 greatPackage
    invitePrice: 0,//获取邀请返现最低金额
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    let that = this
    console.log("options", options);
    that.showLoading(true);
    let { order } = app.globalData, { branchNo } = app.globalData.branch
    const originaPrice = Number(options.originaPrice).toFixed(2) * 1//购物车总价
    const totalPrice = Number(options.totalPrice).toFixed(2) * 1//购物车优惠价
    const invitePrice = Number(options.firstPrice).toFixed(2) * 1//获取邀请返现最低金额
    const discountPrice = Number((originaPrice - totalPrice).toFixed(2))//购物车优惠价
    const seckillPrice = options.seckill ? Number(options.seckill).toFixed(2) * 1 : 0;//秒杀优惠价
    const commoditStatus = options.commoditStatus ? options.commoditStatus : ''
    const isVerify = commoditStatus == 'Presale' || commoditStatus == 'myPage' ? true : false
    that.setData({ commoditStatus, branchNo, invitePrice })
    if (originaPrice > 0 && totalPrice > 0 && discountPrice >= 0 && !isVerify) {//非预售 首单免费
      const options = { order, seckillPrice, discountPrice, totalPrice, originaPrice }
      that.GeneralVerify(options)//普通商品验证
    } else if (commoditStatus == 'myPage') {//首单免费
      const { status } = options
      that.setData({ totalPrice, status, originaPrice, planNos: [] })
      that.showSpecInfo(order, status); //展示页面商品数据
      that.showBasicInfo(commoditStatus); //展示页面基本数据
    } else if (commoditStatus == 'Presale') {//预售
      that.setData({ totalPrice, originaPrice, planNos: [] })
      that.showProductInfo(); //展示页面商品数据
      that.showBasicInfo(commoditStatus); //展示页面基本数据
    } else {//非预售 首单免费 金额对不上
      that.showToast('亲不要操作太频繁哦( ˘•ω•˘ )', 1500, true);
      return false
    }
  },
  // 生命周期函数--监听页面卸载
  onUnload: function () {
    clearInterval(presaleTime) //页面卸载时清除定时器
    rpx = 0.5, deliveryFrom = 0, deliveryTo = 0, pickupFrom = 0, pickupTo = 0, couponLen = 0, useCoupon = {};//置空数据
  },

  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  // 用户点击右上角分享
  onShareAppMessage: function (options) {
    let shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi',
      imgUrl: '',
      success: function () { }
    }
    return shareObj;
  },
  //手机号输入框
  onInput: function (e) {
    let that = this;
    that.setData({ mobile: e.detail.value })
    if (e.detail.value == '') {
      that.showToast('输入的手机号为空');
      return false;
    } else if (!myreg.test(e.detail.value)) {
      that.showToast('手机号有误');
      return false;
    } else if (e.detail.value < 11) {
      that.showToast('手机号长度有误');
      return false;
    }
  },
  //1元闪送 到店自提
  distribution: app.debounce1(function (e) {
    let that = this
    const clickNum = Number(e.currentTarget.dataset.num); //当前点击的num
    const { shippingFee, userInfo, totalPrice, usable, num, commoditStatus, originaPrice, amount, status } = that.data
    const payMoney = clickNum == 1 ? Number(totalPrice) + Number(shippingFee) : Number(totalPrice)
    if (clickNum == 1) { //一元闪送
      if (deliveryFrom == null || deliveryTo == null || commoditStatus == 'Presale') { //不支持外送
        that.showToast(commoditStatus == 'Presale' ? '预售商品暂不支持外送' : '该店铺暂不支持外送', 600);
        return false;
      }
    } else { //到店自提
      if (pickupFrom == null || pickupTo == null) { //不支持自提
        that.showToast('该店铺暂不支持自提', 600);
        return false;
      }
    }
    if (clickNum != num) {
      that.isPickOrDelive(clickNum);
    }
    that.animation.translate(clickNum == 1 ? 0 : 356 * rpx, 0).step()
    that.setData({
      num: clickNum,
      isPaying: false,
      ifPayAmt: status == 'greatPackage' ? false : usable.indexOf("-") == -1 ? (userInfo.balanceAmount >= payMoney ? true : false) : false,
      ifCanAmt: status == 'greatPackage' ? true : userInfo.balanceAmount >= payMoney ? false : true,
      shippingFee: originaPrice >= amount ? shippingFee : 0,//配送费
      payment: clickNum == 2 ? false : originaPrice < amount ? true : false, //不满足起送金额禁用支付
      immediate: clickNum == 2 ? '去结算' : originaPrice < amount ? `${amount}元起送` : '去结算', //不满足起送金额修改文案
      animation: that.animation.export()
    })
  }, 600),
  // 选择地址
  location: function () {
    wx.navigateTo({
      url: `../shippingAddress/shippingAddress?totalSummation=${this.data.originaPrice}&amount=${this.data.amount}`,
    })
  },
  // 选择优惠券
  discountCoupon: function () {
    let that = this
    const { ifPayAmt, totalPrice, originaPrice, planNos, commoditStatus } = that.data
    if (!ifPayAmt) { // 当支付为余额支付时,不能选择优惠券
      wx.navigateTo({
        url: `../availableVouchers/availableVouchers?total=${totalPrice}&totalPrice=${originaPrice}&planNos=${planNos}&commoditStatus=${commoditStatus}`,
      })
    } else { //选择余额支付
      that.setData({ isShowTips: true })
    }
  },
  // 微信支付节流函数
  startPay: app.debounce1(function () {
    app.globalData.refreshOrder = true
    let that = this, { num, aggregate, shippingFee, commonCommodity: order, packageGoods: setMeal, planNo: cPlanNo, couponNo, branchNo, storeAddress, reAllMnt } = that.data, items = []
    // commonCommodity 普通商品  packageGoods  套餐商品
    const payMoney1 = Number(aggregate) + Number(shippingFee); //一元闪送
    const payMoney2 = Number(aggregate); //到店自提
    order = that.getNewOrder(cPlanNo, couponNo, order)
    that.setData({ commonCommodity: order, isPaying: true })
    //添加套餐数量套餐价字段
    for (let i in setMeal) {
      setMeal[i].goodsList.map((p, a) => {
        setMeal[i].goodsList[a].combItemPrice = setMeal[i].combPrice
        setMeal[i].goodsList[a].combItemQty = setMeal[i].number
        setMeal[i].goodsList[a].vipPrice = setMeal[i].combPrice
        setMeal[i].goodsList[a].quantity = setMeal[i].goodsList[a].quantity * setMeal[i].number
      })
    }
    //拿出套餐子商品
    for (let j = 0; j < setMeal.length; j++) {
      for (let k = 0; k < setMeal[j].goodsList.length; k++) {
        p.push(setMeal[j].goodsList[k])
      }
    }
    for (let i = 0; i < order.length; i++) {
      if (order[i].quantity > 0) {
        if (order[i].isCombined == 'Y') { //套餐需要拆单
          let { combSubItems, quantity } = order[i]
          for (let j in combSubItems) {
            let goods = {
              "itemNo": combSubItems[j].itemNo, //商品编号
              "quantity": Number(combSubItems[j].quantity) * Number(quantity), //商品数量
              "salePrice": combSubItems[j].salePrice, //商品原价
              "vipPrice": combSubItems[j].vipPrice, //会员价
              "itemName": combSubItems[j].itemName, //商品名
              "weight": combSubItems[j].weight == null ? 0.01 : combSubItems[j].weight, //商品重量
              "combItemNo": combSubItems[j].combItemNo, //套餐编码
              "combItemPrice": combSubItems[j].combSalePrice, //套餐价格
              "combItemQty": quantity, //套餐的数量
              "bizLine": combSubItems[j].bizLine, //商品本身的业务线
              "blId": combSubItems[j].blId, //业务线Id
              "planNo": combSubItems[j].planNo, //促销编号
              "couponNo": combSubItems[j].couponNo ? combSubItems[j].couponNo : '', //优惠券编号
              "returnMoney": combSubItems[j].returnMoney,//是否返现
              "orderItemType": combSubItems[j].orderItemType
            }
            items.push(goods)
          }
        } else { //普通商品
          let itemProduct = {
            "itemNo": order[i].itemNo, //商品编号
            "quantity": order[i].quantity, //商品数量
            "salePrice": order[i].salePrice, //商品原价
            "vipPrice": that.data.commoditStatus == 'Presale' ? order[i].activitySalePrice : order[i].vipPrice ? order[i].vipPrice : order[i].salePrice, //会员价
            "itemName": order[i].itemName, //商品名
            "weight": order[i].weight == null ? 0.01 : order[i].weight, //商品重量 暂时没有这个字段
            "combItemNo": '', //套餐编码
            "combItemPrice": 0, //套餐价格
            "combItemQty": 0, //套餐的数量
            "bizLine": order[i].bizLine, //商品本身的业务线
            "blId": order[i].blId, //业务线Id
            "planNo": order[i].planNo, //促销编号
            "couponNo": order[i].couponNo ? order[i].couponNo : '', //优惠券编号
            "returnMoney": order[i].returnMoney,//是否返现
          }
          items.push(itemProduct);
        }
      }
    }
    const itemDist = { // 一元闪送 运费
      "itemNo": that.data.sendFeeIiemNo, //商品编号
      "quantity": 1, //商品数量
      "salePrice": shippingFee, //配送费
      "vipPrice": shippingFee, //配送费
      "weight": 0.01, //商品重量 暂时没有这个字段
      "itemName": '配送费', //配送费
    }
    if (shippingFee > 0 && num == 1) {
      items.push(itemDist); //一元闪送
    }
    let requestData = {
      "branchNo": branchNo, //店铺Id
      "entryBranchNo": branchNo == '888888' ? app.globalData.branchNo : '',//我家商城 切换店铺号
      "pickupBranchNo": branchNo == '888888' ? storeAddress.branchNo : '',//我家商城 选择的店铺号
      "orderType": num == 1 ? "DIST" : "SELF",
      "pickUpTime": '',
      "pickUpString": '',
      "items": items,
      "totalFee": num == 1 ? payMoney1 : payMoney2, //订单总价,要加上配送费
      "couponNo": that.data.couponNo, //券编号
      "planNo": that.data.planNo, //促销编号
      "planId": that.data.planId, //方案id
      "notes": that.data.notes, //订单备注
      "userMobile": num == 1 ? that.data.location.userNumber : that.data.mobile, //用户下单手机号，不能为空
      "locationId": num == 1 ? that.data.location.locationId : null, //地址
      "payType": that.data.ifPayAmt ? 'WALLET' : '' //支付方式 WALLET 钱包支付 '' 微信支付
    }
    if (that.data.num == 1) { // 一元闪送
      if (that.data.location == '') {
        that.showToast('请选择地址');
        return false;
      }
    } else { //到店自提
      if (that.data.mobile == '') {
        that.showToast('输入的手机号为空');
        return false;
      } else if (!myreg.test(that.data.mobile)) {
        that.showToast('手机号有误');
        return false;
      } else if (that.data.mobile < 11) {
        that.showToast('手机号长度有误');
        return false;
      }
      if (that.data.commoditStatus == 'Presale' && that.data.isRead == false) {// 预售商品 售后服务条款
        that.showToast('请勾选《售后服务条款》');
        return false;
      }
      if (branchNo == '888888' && storeAddress.length == 0) {
        that.showToast('请选择自提门店');
        return false;
      }
    }
    that.setData({ payment: true, isPaying: true }); // 禁用支付
    wx.showLoading({ title: '加载中' })
    // 发起支付
    wx.request({
      url: `${urlMember}member/new/prepay`,
      data: requestData,
      method: 'POST',
      header: { 'Cookie': `JSESSIONID=${cache.get('sessionId', 'null')}` },
      success: rest => {
        wx.hideLoading();
        items = []; //置空数组
        if (rest.data.respData !== null) { //发起支付成功
          if (rest.data.respData.paySign) { //微信支付
            wx.requestPayment({
              timeStamp: rest.data.respData.timeStamp == "" ? rest.data.respData.timetemp : rest.data.respData.timeStamp,
              nonceStr: rest.data.respData.nonceStr,
              package: rest.data.respData.packageValue,
              signType: rest.data.respData.signType,
              paySign: rest.data.respData.paySign,
              success() {
                app.globalData.order = []; //清空商品数据
                wx.vibrateLong(); //使手机发生较长时间的振动
                that.setData({ payment: false, isPaying: false }); //不禁用支付
                wx.redirectTo({
                  url: `../paySuc/paySuc?payprice=${aggregate}&payType=wechat&reAllMnt=${reAllMnt}`,//微信支付
                })
              },
              fail() { // 取消支付
                app.globalData.order = [];
                that.setData({ payment: false, isPaying: false }) //不禁用支付
                wx.switchTab({ //跳转订单列表页
                  url: '/pages/newOrder/newOrder',
                })
                that.showToast('支付取消');
              }
            })
          } else { //钱包支付
            if (rest.data.success == true) { //支付成功
              app.globalData.order = [];
              that.setData({ payment: false, isPaying: false }); //不禁用支付
              wx.reLaunch({
                url: `../paySuc/paySuc?payprice=${rest.data.respData.totalPrice}&payType=wallet&reAllMnt=0`,//钱包支付
              })
            }
          }
        } else { //发起支付失败
          wx.showModal({
            title: '支付失败',
            content: rest.data.respDesc,
          })
          that.setData({ payment: false, isPaying: false }); //不禁用支付
        }
      },
      fail: () => {//支付失败
        wx.hideLoading();
        items = []; //置空数组
        that.setData({ payment: false, isPaying: false }); //不禁用支付
      }
    })
  }, 1000),
  // 是否选中返现钱包支付
  checkboxChange: function (e) {
    let that = this
    let { ifPayAmt, commonCommodity, totalPrice, originaPrice, planNos } = that.data, reAllMnt = 0
    if (!ifPayAmt) { //未选中钱包支付 改用钱包支付
      commonCommodity.map(item => {
        item.returnMoney = false
        const isInActivity = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.promotionRule.promotionRule[0].multipleValue == item.refundMultiple : true : true
        item.mulreturnMoney = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.refundValue * (isInActivity ? item.promotionRule.promotionRule[0].multipleValue : 1) : item.refundValue : item.refundValue //多倍返现金额
        reAllMnt += planNos.indexOf(item.planNo) == -1 ? item.quantity * item.mulreturnMoney : 0
      })
      reAllMnt = (Math.floor(reAllMnt * 100) / 100).toFixed(2)
      that.setData({
        discounts: 0,
        couponPrice: 0,
        planNo: '',
        couponNo: '',
        planId: '',
        reAllMnt, commonCommodity,
        aggregate: totalPrice,
        preferentialCombined: originaPrice - totalPrice,
        usable: couponLen == 0 ? '暂无可用券' : `有${couponLen}张可用`,
        isShowLoading: false
      })
    } else { //已选中钱包支付 改用券
      if (couponLen != 0) {//有券
        that.showLoading(true);
        that.getTicket(useCoupon); //获取券默认选中券
      } else {//没有券
        commonCommodity.map(item => {
          item.returnMoney = planNos.indexOf(item.planNo) == -1 ? true : false
          const isInActivity = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.promotionRule.promotionRule[0].multipleValue == item.refundMultiple : true : true
          item.mulreturnMoney = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.refundValue * (isInActivity ? item.promotionRule.promotionRule[0].multipleValue : 1) : item.refundValue : item.refundValue //多倍返现金额
          reAllMnt += planNos.indexOf(item.planNo) == -1 ? item.quantity * item.mulreturnMoney : 0
        })
        reAllMnt = (Math.floor(reAllMnt * 100) / 100).toFixed(2)
        that.setData({ reAllMnt, commonCommodity })
      }
    }
    that.setData({ ifPayAmt: !ifPayAmt })
  },
  // 获取第一张优惠券或商品券
  getTicket: function (useCoupon) {
    let that = this
    const { order } = app.globalData
    const { planNo, planId, couponNo } = useCoupon
    let couponItemPrices = order.map(item => {
      return { salePrice: item.salePrice, itemQty: item.quantity, couponPlanNo: item.couponPlanNo }
    })
    axios.post({
      url: `${urlMall}user/coupon/v2/calc`,
      data: {
        "userId": cache.get("userId", null),
        "planNo": planNo, //促销编号
        "totalPrice": that.data.originaPrice, //原价
        "couponNo": couponNo, //券编号
        "couponItemPrices": couponItemPrices,
      }
    }).then(res => {
      const discounts = (res.data.respData.discountPrice).toFixed(2)//使用优惠券优惠的价格
      const couponPrice = that.data.originaPrice - discounts //优惠售价
      const isreturnMoney = res.data.respData.returnMoney
      let { commonCommodity } = that.data, reAllMnt = 0
      commonCommodity.map(item => {//多倍返现和优惠券互斥
        item.returnMoney = item.couponPlanNo.indexOf(planNo) != -1 ? isreturnMoney : true;//使用券 置为true 
        reAllMnt += item.couponPlanNo.indexOf(planNo) != -1 ? isreturnMoney ? item.quantity * item.refundValue : 0 : item.quantity * item.refundValue
      })
      reAllMnt = (Math.floor(reAllMnt * 100) / 100).toFixed(2)
      that.setData({
        planNo, planId, couponNo, discounts, couponPrice, commonCommodity, reAllMnt, isreturnMoney,
        ifPayAmt: false, //不选中钱包
        usable: '-' + discounts, //优惠券提示
        aggregate: discounts > 0 ? couponPrice : that.data.totalPrice, //售价
        preferentialCombined: discounts > 0 ? discounts : (that.data.originaPrice - that.data.totalPrice) //优惠总和
      })
      that.showLoading(false);
    })
  },
  // 计算商品中有多少外卖商品
  outFoodNum: function (data) {
    let outFoodLen = 0; //外卖数量
    for (let i in data) {
      if (data[i].stTimes.length != 0) {
        if (data[i].bizLine == "OUTFOOD") {
          outFoodLen += data[i].quantity;
        }
      }
    }
    return { outFoodNum: outFoodLen, isAllOutFood: outFoodLen == data.length }
  },
  // 外卖 普通商品提醒
  isPickOrDelive: function (clickNum) {
    let that = this
    const { order } = app.globalData, { commoditStatus } = that.data
    if (commoditStatus == 'Presale' || commoditStatus == 'myPage') {
      var outFoodNum = 0, isAllOutFood = false
    } else {
      var { outFoodNum, isAllOutFood } = that.outFoodNum(order); //外卖数量 是否全部外卖
    }
    const clickNumber = clickNum || that.data.num
    const nowTime = util.getNowTime(new Date()); //当前时间 11:05
    let activityTimeTo = 0, deliveryTimeFrom = 0, deliveryTimeTo = 0, dinnerName = 0, intervals = 0, tipsText = '', tipText1 = '', tipText2 = '', notAllOutFood = false, isShowtipsText = false;
    let tipsTemp = clickNumber == 1 ? '送达' : '自提'; //提醒文字
    if (outFoodNum >= 1) { //当确认订单中有外卖商品
      for (let i in order) {
        if (order[i].bizLine == "OUTFOOD") {
          activityTimeTo = order[i].stTimes[0].activityTimeTo ? order[i].stTimes[0].activityTimeTo.slice(0, 5) : ''; //供应结束时间
          deliveryTimeFrom = order[i].stTimes[0].deliveryTimeFrom ? order[i].stTimes[0].deliveryTimeFrom.slice(0, 5) : ''; //送达开始时间
          deliveryTimeTo = order[i].stTimes[0].deliveryTimeTo ? order[i].stTimes[0].deliveryTimeTo.slice(0, 5) : ''; //送达结束时间
          dinnerName = order[i].stTimes[0].stName; //早餐 午餐 晚餐
          intervals = util.getHour(nowTime, activityTimeTo); //当前时间 供应结束时间
          break;
        }
      }
    }
    if (isAllOutFood) { //如果全是外卖商品
      tipsText = intervals >= 2 ? `预计${tipsTemp}时间为${deliveryTimeFrom.substring(0, 5)}-${deliveryTimeTo.substring(0, 5)}` : '',
        isShowtipsText = intervals >= 2 ? true : false, isAllOutFood = true, notAllOutFood = false;
    } else { //不全是外卖或者没有外卖商品
      if (clickNumber == 1) { //一元闪送
        const isDelive = util.timeRange(deliveryFrom.slice(0, 5), deliveryTo.slice(0, 5), nowTime); // 判断是否在外送时间范围内
        if (isDelive) { //在外送时间范围内
          tipsText = intervals >= 2 ? `${dinnerName}预计${tipsTemp}时间为${deliveryTimeFrom.substring(0, 5)}-${deliveryTimeTo.substring(0, 5)}` : '',
            isShowtipsText = intervals >= 2 ? true : false, isAllOutFood = true, notAllOutFood = false;
        } else { // 不在外送时间内容
          // true 营业时间后，不超过当天00:00  false 营业时间后，超过当天的00:00
          const isMidnight = util.timeRange(deliveryTo.slice(0, 5), '24:00', nowTime);
          tipText1 = intervals >= 2 ? `1、${dinnerName}预计送达时间为${deliveryTimeFrom}-${deliveryTimeTo}` : '',
            tipText2 = intervals >= 2 ? `2、便利、咖啡商品现在下单可${isMidnight ? '明天' : '今天'}${deliveryFrom.slice(0, 5)}开始配送哦！` : '',
            tipsText = intervals >= 2 ? '' : `便利、咖啡商品现在下单可${isMidnight ? '明天' : '今天'}${deliveryFrom.slice(0, 5)}开始配送哦！`,
            notAllOutFood = intervals >= 2 ? true : false, isShowtipsText = true;
        }
      } else if (clickNumber == 2) { //到店自提
        const isPicker = util.timeRange(pickupFrom.slice(0, 5), pickupTo.slice(0, 5), nowTime); // 判断是否在到店自提时间范围内
        if (isPicker) { //在到店自提时间内
          tipsText = intervals >= 2 ? `${dinnerName}预计${tipsTemp}时间为${deliveryTimeFrom.substring(0, 5)}-${deliveryTimeTo.substring(0, 5)}` : '',
            isShowtipsText = intervals >= 2 ? true : false, isAllOutFood = true, notAllOutFood = false;
        } else { //不在到店自提时间内
          // true 营业时间后，不超过当天00:00  false 营业时间后，超过当天的00:00
          const isMidnight = util.timeRange(pickupTo.slice(0, 5), '24:00', nowTime);
          tipsText = intervals >= 2 ? '' : `便利、咖啡商品现在下单可${isMidnight ? '明天' : '今天'}${pickupFrom.slice(0, 5)}前来门店自提哦！`,
            tipText1 = intervals >= 2 ? `1、${dinnerName}预计自提时间为${deliveryTimeFrom}-${deliveryTimeTo}` : '',
            tipText2 = intervals >= 2 ? `2、便利、咖啡商品现在下单可${isMidnight ? '明天' : '今天'}${pickupFrom.slice(0, 5)}开始配送哦！` : '',
            notAllOutFood = intervals >= 2 ? true : false, isShowtipsText = true;
        }
      }
    }
    that.setData({ outFoodNum, tipsText, tipText1, tipText2, isAllOutFood, notAllOutFood, isShowtipsText })
  },
  // 展示Loading背景
  showLoading: function (isTrue) {
    this.setData({ isShowLoading: isTrue })
  },
  // 点击 知道了 隐藏提示框
  tipBtn: function () {
    this.setData({ isShowtipsText: false })
  },
  // 退款说明
  refundDes: function () {
    this.setData({ refundDesc: !this.data.refundDesc })
  },
  // 售后服务
  afterDes: function () {
    this.setData({ afterDesc: !this.data.afterDesc })
  },
  // 钱包优惠券不能同时使用
  walletTips: function () {
    this.setData({ isShowTips: false })
  },
  //满减券弹窗
  isShowNotify: function () {
    this.setData({ isShowNotify: !this.data.isShowNotify })
  },
  // 是否已读 售后服务条款
  isReadChange: function () {
    this.setData({ isRead: !this.data.isRead })
  },
  // 备注
  instructions: function (e) {
    this.setData({ notes: e.detail.value });
  },
  // 倒计时函数 预售
  TodayDate: function (startDate, endDate) {
    let that = this
    if (startDate || endDate) {
      let d = new Date(),
        newDate = d.getFullYear() + "-" + (d.getMonth() * 1 + 1) + "-" + d.getDate() + "-" + startDate.replace(/:/g, "-"),
        endDates = d.getFullYear() + "-" + (d.getMonth() * 1 + 1) + "-" + d.getDate() + "-" + endDate.replace(/:/g, "-"),
        startArr = newDate.split("-"),
        endArr = endDates.split("-"),
        _TimeStart = new Date(Date.UTC(startArr[0], startArr[1] - 1, startArr[2], startArr[3] - 8, startArr[4], startArr[5])),
        _TimeEnd = new Date(Date.UTC(endArr[0], endArr[1] - 1, endArr[2], endArr[3] - 8, endArr[4], endArr[5])),
        _TimeRubbingStart = _TimeStart.getTime() / 1000, //开始时间戳
        _TimeRubbingEnd = _TimeEnd.getTime() / 1000, //结束时间戳 
        NewTimeRubbing = d.getTime() / 1000; //本地时间戳
      if (NewTimeRubbing < _TimeRubbingStart) { //活动还没结束
        that.setData({ Today: app.timeTrans(_TimeRubbingStart - NewTimeRubbing) })
      } else if (NewTimeRubbing > _TimeRubbingEnd) { //活动已经结束
        that.setData({ Today: app.timeTrans(NewTimeRubbing - NewTimeRubbing), payment: true, isPaying: true })
      } else {
        let date = _TimeRubbingEnd - NewTimeRubbing
        let arr = app.timeTrans(date)
        if (arr[0] == 0) {
          if (arr[1] == 0) {
            if (arr[2] == 0) {
              that.setData({ payment: true })
              clearInterval(presaleTime); //清除预售定时器
            }
          }
        }
        that.setData({ Today: app.timeTrans(date) })
      }
    }
  },
  //获取满额送券
  getFullTicket: function (couponPlanNo) {
    let that = this;
    axios.post({
      url: `${urlMall}user/full/promotion/notify`,
      data: couponPlanNo
    }).then(res => {
      if (res.data.respData != null) {
        that.setData({ notifyText: (res.data.respData).join("、") })
      }
    })
  },
  //获取planNo集合
  getPlanNoList: function (commonCommodity) {
    let planNoList = [];
    for (let i in commonCommodity) {
      if (commonCommodity[i].planNo != '' || commonCommodity[i].planNo == null) {
        planNoList.push(commonCommodity[i].planNo)
      }
    }
    return planNoList;
  },
  // 重新渲染数据 加入couponNo值
  getNewOrder: function (cPlanNo, couponNo, order) {
    let that = this
    const { isreturnMoney, planNos, ifPayAmt } = that.data
    if (cPlanNo) {//调用优惠券
      order.map(item => {
        item.couponNo = item.couponPlanNo ? item.couponPlanNo.indexOf(cPlanNo) != -1 ? couponNo : '' : ''
        item.planNo = item.couponPlanNo ? item.couponPlanNo.indexOf(cPlanNo) != -1 ? cPlanNo : '' : ''
        item.returnMoney = item.couponPlanNo.indexOf(cPlanNo) != -1 ? isreturnMoney : true
      })
    } else {//未使用优惠券
      order.map(item => {
        item.returnMoney = ifPayAmt ? false : planNos.indexOf(item.planNo) == -1 ? true : false
      })
    }
    return order;
  },
  // 阻止事件向下传递
  preventTouchMove: function () { },
  // 验证提示
  showToast: function (tips, seconds, isPrice) {
    const isTrue = isPrice || false
    const second = seconds || 1000;
    if (isTrue) {
      wx.showToast({ title: tips, icon: 'none', mask: true })
      setTimeout(function () {
        wx.navigateBack()
      }, second)
    } else {
      wx.showToast({ title: tips, icon: 'none' })
      setTimeout(function () {
        wx.hideToast()
      }, second)
    }
  },
  /**
   * 获取店铺信息 用户信息
   * NON_MEMBERS: 非会员，仅仅只是注册了账号，尚未购买过会员卡且未领取体验卡
   * MEMBERS: 会员，表示开通了会员且此时此刻会员正处于有效期内
   * EXPIRED_MEMBERS: 过期会员，表示曾今开通了会员，可是现在会员已经过期了
   * EXPERIENCE: 体验卡会员
   * ENTERPRISE：我家企业会员
   */
  showBasicInfo: function (commoditStatus) {
    let that = this, { order } = app.globalData, { branchNo } = app.globalData.branch, payCouponsParams = {}
    if (commoditStatus == 'Presale' || commoditStatus == 'myPage') {//预售 首单免费
      payCouponsParams = { couponPlanNo: order[0].couponPlanNo, itemQty: order[0].itemQty, salePrice: order[0].salePrice }
    } else {
      payCouponsParams = order.map(item => {
        return { couponPlanNo: item.couponPlanNo, itemQty: item.quantity, salePrice: item.salePrice }
      })
    }
    if (commoditStatus == 'Presale') { //预售
      if (order[0].stTimes.length != 0) { //数组不为空
        const endTime = order[0].stTimes[0].activityTimeTo, startTime = util.getNowTime(new Date());//现在时间
        presaleTime = setInterval(() => {
          that.TodayDate(startTime, endTime)
        }, 1000)
      }
    }
    const deliveryUrl = axios.postData({ url: `${urlMall}address/user/find/address/list/${cache.get("userId", null)}?branchNo=${branchNo}` }); //用户所有地址
    const shopUrl = axios.getData({ url: `${urlItem}user/branch/order/service/spec/${branchNo}` }); //店铺下单时间
    const phoneUrl = axios.getData({ url: `${app.baseUrl}service-order-prc/saleOrder/queryPreOrderData?sessionId=${cache.get('sessionId', 'null')}` }); //获取用户首单电话号码
    const userUrl = axios.getData({ url: `${urlMember}new/query/usrInfo`, header: { 'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null') } }); // 获取用户信息 
    const couponUrl = axios.postData({ url: `${urlMall}public/v2/user/coupon/list`, data: { "userId": cache.get("userId", null), "payCouponsParams": payCouponsParams } }); //优惠券数据
    const startFeeUrl = axios.getData({ url: `${urlMall}address/queryMinBranchDistFee/${branchNo}` }); //获取最低起送费
    wx.getLocation({ // 到店自提
      type: 'gcj02',
      success: function (res) {
        const placeOption = that.getPlaceOption(res, branchNo)
        axios.post(placeOption).then(res => {
          const storeAddress = res.data.respData //存放店铺详细地址
          Promise.all([deliveryUrl, shopUrl, phoneUrl, userUrl, couponUrl, startFeeUrl]).then(res => {
            // console.log("店铺信息Promise.all", res);
            let mobile = ''
            const location = res[0].data.respData; //用户所有地址
            const shopTimeMess = res[1].data.respData; //店铺开店时间
            const mobileMess = res[2].data.respData; //手机信息
            const userInfo = res[3].data.respData; //用户信息
            const couponMess = res[4].data.respData; //优惠券数据
            const amount = res[5].data.respData ? res[5].data.respData : 0; //起送金额
            const { useCouponList, useProductList } = couponMess; //可用优惠券 可用商品券
            couponLen = useProductList.length + useCouponList.length; //获取可用券个数
            useCoupon = useCouponList.length > 0 ? useCouponList[0] : useProductList[0]; //正在使用的优惠券
            deliveryFrom = branchNo == '888888' ? '00:00:00' : shopTimeMess.deliveryFrom; //外送开始时间
            deliveryTo = branchNo == '888888' ? '23:59:59' : shopTimeMess.deliveryTo; //外送结束时间
            pickupFrom = shopTimeMess.pickupFrom; //自提开始时间
            pickupTo = shopTimeMess.pickupTo; //自提结束时间
            const num = pickupFrom == null || pickupTo == null ? 1 : branchNo == '888888' ? 1 : 2;
            if (mobileMess) { mobile = mobileMess.userMobile }
            that.animation = wx.createAnimation({ duration: 200 });
            that.animation.translate(pickupFrom == null || pickupTo == null ? 0 : branchNo == '888888' ? 0 : 356 * rpx, 0).step(); //除不支持自提 默认跳转到店自提 (除了我家商城)
            let usabls = location.filter(item => item.isDistribution == 'Y')//可用地址
            const defaultPlace = usabls.filter(item => item.defaultAddress == 'Y')//默认地址
            if (usabls.length > 0) { //有可用地址
              axios.postData({ // 获取配送费
                isToast: true,
                url: `${urlMall}address/queryDistFee`,
                data: {
                  "branchNo": branchNo, //店铺号
                  "locationId": defaultPlace.length > 0 ? defaultPlace[0].locationId : usabls[0].locationId, //地址id
                  "totalPriceAmount": that.data.originaPrice, //原价
                }
              }).then(res => {
                that.setData({
                  shippingFee: res.data.respData.distPrice, //配送费
                  sendFeeIiemNo: res.data.respData.itemNo //配送费商品号
                })
              })
            } else { //无可用地址
              that.setData({
                shippingFee: 0,
                sendFeeIiemNo: ''
              })
            }
            // 使用钱包余额
            if (userInfo.memberStatus != 'NON_MEMBERS' && userInfo.balanceAmount >= that.data.totalPrice && that.data.status != 'greatPackage') {
              that.getAmnt(couponLen); //会员
            } else { //钱包余额不足
              if (couponLen == 0) { //无优惠券
                that.setData({
                  usable: '暂无可用券',
                  ifPayAmt: false,
                  ifCanAmt: true,
                  discounts: 0,
                  couponPrice: 0,
                  planNo: '',
                  couponNo: '',
                  planId: '',
                  preferentialCombined: that.data.originaPrice - that.data.totalPrice,
                  aggregate: that.data.totalPrice
                })
                that.showLoading(false);
              } else { //有优惠券
                that.getTicket(useCoupon);
              }
            }
            that.setData({
              mobile, amount, num, userInfo,
              storeAddress: branchNo != '888888' ? storeAddress : storeAddress.userBranchs[0] ? storeAddress.userBranchs[0] : storeAddress.commonBranchs[0],
              animation: that.animation.export(),
              location: usabls.length > 0 ? defaultPlace.length > 0 ? defaultPlace[0] : usabls[0] : '',
              payment: num == 2 ? false : that.data.originaPrice < amount ? true : false, //不满足起送金额禁用支付
              immediate: num == 2 ? '去结算' : that.data.originaPrice < amount ? `${amount}元起送` : '去结算' //不满足起送金额修改文案
            })
            that.isPickOrDelive(); //外卖便利商品提醒
          }).catch(err => {
            console.log(err);
            that.throwErr();
          })
        })
      }
    })
  },
  // 会员
  getAmnt: function (couponLen) {
    let that = this
    let { commonCommodity, planNos } = that.data, reAllMnt = 0
    commonCommodity.map(item => {
      item.returnMoney = false
      const isInActivity = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.promotionRule.promotionRule[0].multipleValue == item.refundMultiple : true : true
      item.mulreturnMoney = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.refundValue * (isInActivity ? item.promotionRule.promotionRule[0].multipleValue : 1) : item.refundValue : item.refundValue //多倍返现金额
      reAllMnt += planNos.indexOf(item.planNo) == -1 ? item.quantity * item.mulreturnMoney : 0
    })
    reAllMnt = (Math.floor(reAllMnt * 100) / 100).toFixed(2)
    that.setData({
      discounts: 0,
      couponPrice: 0,
      planNo: 0,
      couponNo: '',
      planId: '',
      commonCommodity, reAllMnt,
      preferentialCombined: that.data.originaPrice - that.data.totalPrice,
      aggregate: that.data.totalPrice,
      ifCanAmt: false, //勾选钱包支付,不选择优惠券
      ifPayAmt: true, //勾选可选择
      usable: couponLen == 0 ? '暂无可用券' : `有${couponLen}张可用`
    })
    that.showLoading(false);
  },
  // 展示页面商品信息
  showProductInfo: function (planNos) {
    let number = 0, reAllMnt = 0, commonCommodity = [], packageGoods = [], that = this, planNoList = planNos || []
    let { order } = app.globalData
    wx.getSystemInfo({ success: res => { rpx = 1 * (res.windowWidth * res.pixelRatio) / (750 * res.pixelRatio) } })
    order.map(item => {//默认不选券情况
      number += item.quantity
      item.returnMoney = planNoList.indexOf(item.planNo) == -1 ? true : false
      item.isreturnMoney = planNoList.indexOf(item.planNo) == -1 ? true : false
      const isInActivity = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.promotionRule.promotionRule[0].multipleValue == item.refundMultiple : true : true
      item.mulreturnMoney = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.refundValue * (isInActivity ? item.promotionRule.promotionRule[0].multipleValue : 1) : item.refundValue : item.refundValue //多倍返现金额
      reAllMnt += planNoList.indexOf(item.planNo) == -1 ? item.quantity * item.mulreturnMoney : 0
      if (item.comb == false) {
        commonCommodity.push(item); //普通商品
      } else {
        packageGoods.push(item); //套餐商品
      }
    })
    reAllMnt = (Math.floor(reAllMnt * 100) / 100).toFixed(2)
    that.setData({ number, packageGoods, commonCommodity, reAllMnt })
  },
  // 预售 新会员超值购 续费大礼包
  showSpecInfo: function (order, status) {
    let that = this, reAllMnt = 0
    wx.getSystemInfo({ success: res => { rpx = 1 * (res.windowWidth * res.pixelRatio) / (750 * res.pixelRatio) } })
    order.map(item => {
      const isInActivity = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.promotionRule.promotionRule[0].multipleValue == item.refundMultiple : true : true
      item.mulreturnMoney = item.promotionRule ? item.promotionRule.promotionType == 'MULTIPLE_RETURN' ? item.refundValue * (isInActivity ? item.promotionRule.promotionRule[0].multipleValue : 1) : item.refundValue : item.refundValue //多倍返现金额
      reAllMnt += item.quantity * item.mulreturnMoney * 1
    })
    reAllMnt = (Math.floor(reAllMnt * 100) / 100).toFixed(2)
    that.setData({ number: order[0].quantity, commonCommodity: order, reAllMnt, status })
  },

  throwErr: function () {
    this.showLoading(false)
    wx.showModal({
      title: '服务器出错',
      content: '开发工程师正在努力抢修中',
      showCancel: false, //是否显示取消按钮
      confirmText: "重新加载", //默认是“取消”
      success: function (res) {
        if (!res.cancel) {
          if (getCurrentPages().length != 1) {
            wx.navigateBack()
          }
        }
      }
    })
  },
  // 普通商品 价格验证
  GeneralVerify: function (options) {
    let that = this, requestData = [], salePrice = 0;//原价
    let { order, seckillPrice, discountPrice, totalPrice, originaPrice, commoditStatus } = options
    order.map(item => {
      requestData.push({ "itemNo": item.itemNo, "quantity": item.quantity })
      salePrice += item.salePrice * item.quantity
    })
    axios.post({//计算优惠价
      url: `${urlItem}trolley/discountsCount?branchNo=${app.globalData.branch.branchNo}`,
      data: requestData
    }).then(res => {
      salePrice = Number(salePrice.toFixed(2))//确认订单总价
      const preferentialPrice = Number((res.data.respData.discountAmt).toFixed(2)) + seckillPrice//确认订单优惠价
      const planNos = res.data.respData.planNos
      const planNoList = that.getPlanNoList(order);
      if (planNoList.length > 0) { that.getFullTicket(planNoList); }//满减送券提醒
      if (preferentialPrice != discountPrice || originaPrice != salePrice) {//价格和购物车对不上
        that.showToast('亲不要操作太频繁哦( ˘•ω•˘ )', 1500, true);
        return false
      } else {//与购物车金额一致
        that.setData({ totalPrice, originaPrice, planNos })
        that.showProductInfo(planNos); //展示页面商品数据
        that.showBasicInfo(commoditStatus); //展示页面基本数据
      }
    })
  },
  // 我家商城 跳转选择地址
  toRecent: function () {
    const { branchNo } = this.data
    if (branchNo == '888888') {
      wx.navigateTo({
        url: '/pages/recentPlace/recentPlace',
      })
    }
  },
  getPlaceOption: function (res, branchNo) {
    const general = { url: `${app.baseUrl}service-item/user/get/branch/by/branchNo/and/location`, data: { "branchNo": branchNo, "latitude": res.latitude, "longitude": res.longitude, } }//普通商店
    const myHome = { url: `${app.baseUrl}service-item/user/get/branch/list/by/location/${cache.get('userId', 'null')}`, data: { "latitude": res.latitude, "longitude": res.longitude } }//我家商城
    return branchNo == '888888' ? myHome : general
  }
})