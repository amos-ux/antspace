import axios from '../../utils/axios.js';
const app = getApp();
const cache = require("../../utils/cache.js");
Page({
  data: {
    status:'',
    bannerImg:'',
    shop:[],
    noshop:false,
    isLoading:false,
    userInfo:{},//用户信息
    isHome:false
  },
  onLoad: function (options) {
    if(options.isHome){
      this.setData({
        isHome:true
      })
    }
    let that = this
    const {status} = options
    that.setData({ status })
    that.getPageData(status)//获取商品数据
  },
  // 获取页面数据
  getPageData: function (status){
    let that = this
    wx.setNavigationBarTitle({title: status == 'firstFree' ? '会员首单免费购' : status=='greatPackage' ? '超值续费大礼包' : '新会员超值购'})
    const firstFree = {url:`${app.baseUrl}service-item/user/first/item/${app.globalData.branch.branchNo}/${cache.get("userId", null)}`}//首单免费
    const greatGift = {url:`${app.baseUrl}service-item/user/include/member/combination/${app.globalData.branch.branchNo}/${cache.get("userId", null)}`}//超值大礼包
    const getMember = {url:`${app.baseUrl}service-item/user/new/member/item/${app.globalData.branch.branchNo}/${cache.get("userId", null)}`} //新会员超值购
    axios.get({
      url: `${app.baseUrl}service-member/new/query/usrInfo`, 
      header: { 'Cookie': "JSESSIONID=" + cache.get('sessionId', 'null') }
    }).then(res=>{
      const userInfo = res.data.respData
      const {memberStatus} = userInfo
      that.setData({userInfo})
      if(status=='firstFree'){//首单免费
        if(memberStatus!='NON_MEMBERS' && memberStatus!='EXPIRED_MEMBERS'){
          that.getshopMess(status,firstFree)
        }else{
          that.setData({noshop:true})//无商品
        }
      }else if(status=='greatPackage'){//超值大礼包
        that.getshopMess(status,greatGift)
      }else{//新会员超值购
        that.getshopMess(status,getMember)
      }
    },()=>{
      that.setData({noshop:true})//无商品
    })
  },
  getshopMess:function(status,option){
    let that = this,isLoading = true
    const adPosition = status == 'sendMember' ? 'vip_shop' : 'recharge_package_banner'
    that.setData({shop:[]})//清空数据
    wx.showLoading({title: '加载中...'})
    const backImg = axios.getData({url: `${app.baseUrl}service-item/adverBanner/getWaterBarAdver?branchNo=${app.globalData.branch.branchNo}&code=${adPosition}`})
    const shopUrl = axios.getData(option)
    Promise.all([backImg,shopUrl]).then(res=>{
      console.log("res",res);
      let shop = [],noshop = true
      const defaultImg = status == 'firstFree' ? 'https://antspace-prod-img-1.oss-cn-shenzhen.aliyuncs.com/31c22bf1294b4eeeb6222d6038b29bdd.png' : 'https://antspace-prod-img-1.oss-cn-shenzhen.aliyuncs.com/31c22bf1294b4eeeb6222d6038b29bdd.png'
      const bannerImg = res[0].data.respData ? res[0].data.respData.advers[0].adImg : defaultImg
      wx.hideLoading()
      if (res[1].data.respData){
        shop = res[1].data.respData.itemPromotions
        noshop = shop.length == 0 ? true : false
        shop.map(item=>{
          item.picAddr = item.picAddr?item.picAddr:'https://antspace-prod-img-1.oss-cn-shenzhen.aliyuncs.com/16b5af2afaa.png'//图片
          item.thumbPic = item.picAddr?item.picAddr:'https://antspace-prod-img-1.oss-cn-shenzhen.aliyuncs.com/16b5af2afaa.png'//图片
          item.isCombined = 'Y'//是否套餐
          item.combSubItems[0].blId = item.combSubItems[0].blId ? item.combSubItems[0].blId : 0
          item.comb = false
          let {combSubItems} = item,disPrice = 0
          combSubItems.map(data=>{
            data.bizLine = data.bizLine ? data.bizLine : 0
            data.isCombined = 'Y'
            data.returnMoney = false
            disPrice += data.quantity * data.salePrice
          })
          item.disPrice = item.salePrice
          item.salePrice = disPrice
        })
      }
      that.setData({shop,bannerImg,noshop,isLoading})
    },()=>{
      wx.hideLoading()
      that.setData({isLoading})
    }).catch(err => {
      console.log(err);
      wx.hideLoading()
      that.setData({isLoading})
      that.showToast('网络开小差了,请稍后重试')
    })
  },
  // 跳转确认订单 
  freeBuy: function(e){
    const {status} = this.data
    const items = e.currentTarget.dataset.item
    const {salePrice:originaPrice,disPrice:totalPrice} = items
    let {combSubItems,orderItemType} = items,order = [],itemQty = 0
    combSubItems.map(item=>{
      item.orderItemType = orderItemType
      itemQty += item.quantity
    })
    items.isCombined = 'Y'
    items.itemQty = itemQty
    items.quantity = 1
    items.blId = items.blId?items.blId:0
    items.returnMoney = status=='firstFree' ? true : false
    items.refundValue = status=='firstFree' ? items.disPrice : items.refundValue * 1
    order.push(items)
    app.globalData.order = order
    wx.navigateTo({
      url: `/pages/confirmOrder/confirmOrder?commoditStatus=myPage&originaPrice=${originaPrice}&totalPrice=${totalPrice}&status=${status}`
    })
  },
  // 跳转首页
  toIndex:function(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 跳转介绍页
  toActivity:function(e){
    wx.navigateTo({
      url: `/my_member/eventDesc/eventDesc?status=${e.currentTarget.dataset.status}`
    })
  },
  //跳转商品详情页
  details(e) {
    let details = e.currentTarget.dataset.item

    console.log(e.currentTarget.dataset.item)
    details.remarksName = details.remarksName.replace("'", "").replace("&", "").replace("=", "");
    details.itemName = details.itemName.replace("'", "").replace("&", "").replace("=", "");
    console.log(JSON.parse(JSON.stringify(details)))
    wx.navigateTo({
      url: "/pages/goodsDetails/goodsDetails?details=" + JSON.stringify(details) + "&type=gift",
    })
  },
  // 验证提示
  showToast: function (tips) {
    wx.showToast({ title: tips, icon: 'none', duration: 1500 })
  },
  tohome(){
    wx.switchTab({
        url:'/pages/index/index'    
    })
  },
})