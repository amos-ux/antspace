// pages/refund/refund.js
var utils = require("../../utils/util.js"),
  e = getApp();
var app = getApp();
var cache = require("../../utils/cache.js");
var url = app.baseUrl + "service-order-prc/";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList:[],
    addGoods:[],
    totalPrice:'0.00',
    getTotal:0,
    val: '',
    forbidden:false, //提交不禁用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let list=[],length=app.globalData.messages[0].items.length
    for(let i=0;i<length;i++){
      if(app.globalData.messages[0].items[i].itemTemp=='ITEM'){
        list=[...list,...app.globalData.messages[0].items[i].saleItems]
      }else{
        let arr=[]
        for(let j=0;j<app.globalData.messages[0].items[i].saleItems.length;j++){
          arr=app.globalData.messages[0] 
          arr.items[i].saleItems[j].comItems[0].itemPicture=app.globalData.messages[0].items[i].saleItems[j].thumbPicture
          arr=arr.items[i].saleItems[j].comItems[0]
          list.push(arr)
        }
        
      }
    }
    this.setData({
      goodsList: app.globalData.messages[0],
      addGoods:list
    })

    console.log(this.data.goodsList)
    console.log(this.data.addGoods)
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
    //计算商品总价
    let goods = this.data.addGoods;                  // 获取商品列表
    // let total = 0;
    // for (let i = 0; i < goods.length; i++) {         // 循环列表得到每个数据
    //   total += goods[i].quantity * goods[i].payPrice;     // 所有价格加起来
    // }
    this.setData({                                // 最后赋值到data中渲染到页面
      addGoods: goods,
      totalPrice: app.globalData.messages[0].totalPayAmount.toFixed(2)
    });
    //计算商品总数
    let addNum = 0;
    for (let i = 0; i < goods.length; i++) {         // 循环列表得到每个数据
        addNum += goods[i].quantity;     // 所有商品相加
    }
    this.setData({                                // 最后赋值到data中渲染到页面
      addGoods: goods,
      getTotal: addNum
    });
    this.data.gather = []
    for (let i = 0; i < goods.length; i++) {
        console.log(goods[i])
      let goodsNo = goods[i].itemNo;
      let number = goods[i].quantity;
      let goodsId = goods[i].soLineId;
        let pgrouping = {
          itemNo: goodsNo,
          quantity: number,
          soLineId: goodsId,
        }
        console.log(this.data.gather);
        this.data.gather.push(pgrouping);
    }
  },
  //input绑定事件
  instructions: function (event) {
    let val = event.detail.value;
    console.log(val);
    this.setData({
      val: val
    })
  },
  //提交
  commit:function(){
    let that = this;
    var sessionId = cache.get('sessionId', 'null');
    console.log(that.data.val);
    let parameter = {
      branchNo: that.data.goodsList.branchNo,     //店铺id
      orderNo: that.data.goodsList.orderNo,       //订单号
      returnReason: that.data.val,	              //退货原因
      returnType: 'REFUND',                       //退货类型
      sessionId: sessionId,                       //sessionId    
      returnItemDTOList: that.data.gather,         //商品组
      userType:'MEMBER'
    }
    console.log(JSON.stringify(parameter))
    if (that.data.val == ""){
      wx.showToast({
        title: '请填写退款原因',
        icon: 'none',
      })
      return false;
    }
      let returnsData = JSON.stringify(parameter) //数据转json格式
      wx.showLoading({
        title: '加载中...',
      })
    that.setData({
        forbidden:true,//提交禁用
      })
      wx.request({  //退款接口
        method: 'POST',
        url: `${url}returnOrder/addReturnOrder`,
        data: returnsData,
        success: function (rest) {
          console.log(rest);
          let success = rest.data.respDesc
          wx.hideLoading();
          wx.showModal({
            title: success,
            content: '',
            showCancel: false,
            cancelText: '',
            cancelColor: '',
            confirmText: '确定',
            confirmColor: '',
            success: function (res) {
              if (res.confirm) {
                app.globalData.refreshOrder=true
                that.setData({
                  forbidden: false,//提交不禁用
                })
                
                wx.navigateBack({
                  delta: 2
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
                that.setData({
                  forbidden: false,//提交不禁用
                })
              }
            },
            fail: function (res) { 
              wx.hideLoading();
            },
            complete: function (res) { },
          })
        }
      })
    
    
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.messages = []
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.globalData.messages = []
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})