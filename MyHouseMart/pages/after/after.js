// pages/after/after.js
var utils = require("../../utils/util.js"),
  e = getApp();
var cache = require("../../utils/cache.js");
var app = getApp();
var url = app.baseUrl + "service-order-prc/";
// cache.get('sessionId', 'null');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['仅退款', '退货退款'],
    AfterType: "请选择售后类型",
    pleaseTime: "请选择退货时间",
    timeTemp: [],
    bon: true,
    bln: true,
    mode: false,
    imgURL: [],
    time: false,
    respData: "",
    goodsList: [],
    goods: [], //所有的产品，包括套餐的产品全部单个数据
    addGoods: false,
    totalPrice: '0.00',
    num: [],
    getTotal: 0,
    multiIndex: [0, 0, 0],
    createTime: null,
    imagesUrl: [],
    val: '',
    type: '',
    gather: [], //退款的商品的数组
    state: null,
    getTime: null,
    array: ['商品过期', '收到的商品破损', '商品错发，漏发', '不想要了', '其他'], //普通选择器
    index: 0, //普通选择器数据下标
    bln: true,
    fontColor: '',
    createTime: null,
    toEnglish: '',
    AfterSale:'REFUND',

    showGoodsList: [], //展示在页面的商品列表，套餐整个展示，无需展开
    isDelivery:false,
    isDeliveryMoney:1

  },
  getChinese(i) {
    if (i == 1) return '一'
    if (i == 2) return '二'
    if (i == 3) return '三'
    if (i == 4) return '四'
    if (i == 5) return '五'
    if (i == 6) return '六'
    if (i == 0) return '日'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let goodsList = app.globalData.message; //获取所有的商品列表
    console.log(goodsList)
    let showGoodsList = goodsList.items;
    let ListAttr =[];
    console.log(showGoodsList)
      
    //将数组中的订单属性循环出来给新的数组
    let tempArr = [];
    for (var j in goodsList.items) {
      tempArr[j] = goodsList.items[j].itemTemp
    }
    for (let i in showGoodsList){
    
      for (let index in showGoodsList[i].saleItems) {
        ListAttr.push(showGoodsList[i].saleItems[index])
        // 判断是否是配送费
        if(showGoodsList[i].saleItems[index].itemNo=='0000123456789'){
          this.setData({
            isDelivery:true,
            isDeliveryMoney:showGoodsList[i].saleItems[index].salePrice
          })
        }
      }
    }
    //将订单属性赋值过去
    console.log(ListAttr)
    ListAttr.map((i,a)=>{
      i.isShow = true
    })

    let p = []
    
    //添加1.数量的属性名改为num 2.是否勾选：否
    goodsList.saleItems.forEach(data => {
      p.push({
        num: data.quantity,
        isShow: true
      })
    })

    let g = []
    let messages = goodsList.saleItems
    for (let i in messages) {
      if (messages[i].itemName !== "商品配送运费" || messages[i].itemNo !== "0000123456789") {
        g.push(messages[i])
      }
    }

    this.setData({
      timeTemp: [
        [`今天 (周${this.getChinese(new Date().getDay())})`, `明天 (周${this.getChinese(new Date(new Date().getTime() + 86400000).getDay())})`, `后天 (周${this.getChinese(new Date(new Date().getTime() + 86400000 * 2).getDay())})`],
        ["09:00-09:30", "09:30-10:00",
          "10:00-10:30", "10:30-11:00", "11:00-11:30", "11:30-12:00", "12:00-12:30", "12:30-13:00",
          "13:00-13:30", "13:30-14:00", "14:00-14:30", "14:30-15:00", "15:00-15:30", "15:30-16:00",
          "16:00-16:30", "16:30-17:00", "17:00-17:30", "17:30-18:00", "18:00-18:30", "18:30-19:00",
          "19:00-19:30", "19:30-20:00", "20:00-20:30", "20:30-21:00"
        ]
      ],
      goodsList: goodsList,
      goods: g,
      addGoods: this.data.quantity >= 2 ? "true" : "false",
      num: p,
      totalPrice: goodsList.totalPayAmount,
      showGoodsList: ListAttr //展示在页面上的列表，套餐只显示一个
    })
    // this.getTotalPrice()
    this.getTotal()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.message = []
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.globalData.message = []
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //普通选择器
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value,
      bln: false
    })
    if (this.data.array[e.detail.value] == '退货退款') {
      this.setData({
        state: 'BOTH'
      })
    } else {
      this.setData({
        state: 'REFUND'
      })
    }
    let val = this.data.array[e.detail.value]
    this.setData({
      type: this.data.array[e.detail.value]
    })
    if (val == "退货退款") {
      this.setData({
        time: true
      })
    } else {
      this.setData({
        time: false
      })
    }
  },
  //input绑定事件
  instructions: function (event) {
    let val = event.detail.value;
    this.setData({
      val: val
    })
  },
  //退货退款说明
  refund: function () {
    this.setData({
      mode: true
    })
  },
  //关闭退货退款说明
  closes: function () {
    this.setData({
      mode: false
    })
  },
  //点击上传图片
  addimage: function (res) {
    let that = this;
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        // console.error(tempFilePaths)
        for(let i=0;i<res.tempFilePaths.length;i++){
          var path = res.tempFilePaths[i];
          //上传图片接口
          wx.showLoading({
            title: '加载中...',
          })
          wx.uploadFile({
            url: `${url}returnOrder/upload`,
            // url: "http://10.0.0.31:31899/myhome/cloud/v1/service-order-prc/returnOrder/upload",
            filePath: path,
            name: 'picture',
            success: function (rest) {
              let respData = (JSON.parse(rest.data)).respData
              that.setData({
                respData: respData
              })  
              let arrImg=that.data.imagesUrl
              arrImg.push(respData)
              that.setData({
                imagesUrl: arrImg
              })
              if (that.data.respData !== '') {
                wx.showToast({
                  title: '上传成功',
                  icon: 'none'
                })
              }
              setTimeout(function () {
                wx.hideLoading()
              }, 2000)
  
            },
            fail: (e) => {
            
            }
          })
        }
        tempFilePaths.forEach(p => {
          that.data.imgURL.push(p);
          that.setData({
            imgURL: that.data.imgURL
          })
        })
      
      }
    })
  },
  //点击删除图片
  removeImg: function (e) {
  
    var _this = this;
    var images = _this.data.imgURL;
    let httpImahe=this.data.imagesUrl
    var index = e.currentTarget.dataset.index; //获取当前长按图片下标
    if(this.data.imgURL.length==1){
      _this.setData({
        imgURL: [],
        imagesUrl:[]
      })
    }else{
      images.splice(index, 1);
      httpImahe.splice(index,1)
      _this.setData({
        imgURL: images,
        imagesUrl:httpImahe
      })
    }

  },
  //多列时间选择器
  bindPickerstartTimeChange: function (event) {

    let s = ''
    if (this.data.timeTemp[0][event.detail.value[0]].slice(0, 2) == '今天') {
    
      s = new Date().toLocaleDateString().replace(/\//g, '-')
      if (new Date().getMonth() + 1 < 10) s = s.slice(0, 5) + '0' + s.slice(5)
      if (new Date().getDate() < 10) s = s.slice(0, 8) + '0' + s.slice(8)
    }
    if (this.data.timeTemp[0][event.detail.value[0]].slice(0, 2) == '明天') {
    
      s = new Date(new Date().getTime() + 86400000).toLocaleDateString().replace(/\//g, '-')
      // s = `${year}-0${month}-${day+1}`
      if (new Date(new Date().getTime() + 86400000).getMonth() + 1 < 10) s = s.slice(0, 5) + '0' + s.slice(5)
      if (new Date(new Date().getTime() + 86400000).getDate() < 10) s = s.slice(0, 8) + '0' + s.slice(8)

    }
    if (this.data.timeTemp[0][event.detail.value[0]].slice(0, 2) == '后天') {
    
      s = new Date(new Date().getTime() + 86400000 * 2).toLocaleDateString().replace(/\//g, '-')
      // s = `${year}-0${month}-${day+1}`
      if (new Date(new Date().getTime() + 86400000 * 2).getMonth() + 1 < 10) s = s.slice(0, 5) + '0' + s.slice(5)
      if (new Date(new Date().getTime() + 86400000 * 2).getDate() < 10) s = s.slice(0, 8) + '0' + s.slice(8)
    }
    this.setData({
      multiIndex: event.detail.value,
      createTime: s + ' ' + (this.data.timeTemp[1][event.detail.value[1]] == '立即取餐' ? new Date().toTimeString().slice(0, 8) : this.data.timeTemp[1][event.detail.value[1]])
    })
    var data = {
      timeTemp: this.data.timeTemp,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[event.detail.column] = event.detail.value;
    this.setData(data);
    this.setData({
      bon: false
    })
  },


  //点击勾选商品
  check: function (e) {
    var that = this;

    const index = e.currentTarget.dataset.index // 获取data- 传进来的index
    var showGoodsList = this.data.showGoodsList;
    if (this.data.showGoodsList[index].isShow) {
      this.data.showGoodsList[index].isShow = false
    } else {
      this.data.showGoodsList[index].isShow = true
    }
    this.setData({
      showGoodsList: this.data.showGoodsList
    })

    // this.getTotalPrice(); //获取选中商品总价
    this.getTotal(); //获取选中商品件数
    this.data.gather = []
    for (var i = 0; i < showGoodsList.length; i++) {
      if (showGoodsList[i].isShow) {
        // 单品
        if (showGoodsList[i].itemTemp == "ITEM") {
          var goodsNo = showGoodsList[i].itemNo;
          var number = showGoodsList[i].quantity;
          var goodsId = showGoodsList[i].soLineId;
          var pgrouping = {
            itemNo: goodsNo,
            quantity: number,
            soLineId: goodsId,
          }
       
          that.data.gather.push(pgrouping);
       
          // 套餐
        } else if (showGoodsList[i].itemTemp == "COMBO") {
      
          for (var j = 0; j < showGoodsList[i].comItems.length; j++) {

            var itemSubno = showGoodsList[i].comItems[j].itemNo;
            var quantity = showGoodsList[i].comItems[j].quantity;
            var soLineId = showGoodsList[i].comItems[j].soLineId;
            var pgrouping = {
              itemNo: itemSubno,
              quantity: quantity,
              soLineId: soLineId,
            }
          
            that.data.gather.push(pgrouping);
          }
   
        }

      }
    }
  },
  //点击商品加减
  add: function (e) {
    //接收data- 传的下标
    const index = e.currentTarget.dataset.index;
    let num = this.data.goods[index].quantity;
    if (e.currentTarget.dataset.type == 'add') {
      if (num < this.data.num[index].num) {
        this.data.goods[index].quantity = num + 1

      }
    }
    if (e.currentTarget.dataset.type == 'minus') {
      if (num <= this.data.num[index].num && num > 1) {
        this.data.goods[index].quantity = num - 1
      }
    }
    this.setData({
      goods: this.data.goods
    })
    // this.getTotalPrice(); //获取总价
    this.getTotal(); //获取商品件数
  },
  // //总价计算
  // getTotalPrice() {
  //   let showGoodsList = this.data.showGoodsList; // 获取购物车列表
  //   let total = 0;
  //   for (let i = 0; i < showGoodsList.length; i++) { // 循环列表得到每个数据
  //     if (showGoodsList[i].isShow) { // 判断选中才会计算价格
  //       if (showGoodsList[i].combItemPrice == 0) {
  //         total += showGoodsList[i].quantity * showGoodsList[i].payPrice; // 所有价格加起来
          
  //       } else {
  //         //套餐
  //         total += showGoodsList[i].combItemQty * showGoodsList[i].combItemPrice; // 所有价格加起来
  //       }
  //     }
  //   }
  //   this.setData({ // 最后赋值到data中渲染到页面
  //     showGoodsList: showGoodsList,
  //     totalPrice: total.toFixed(2)
  //   });
  // },
  //商品总数量
  getTotal() {
    let showGoodsList = this.data.showGoodsList; // 获取购物车列表
    let addNum = 0;
    for (let i = 0; i < showGoodsList.length; i++) { // 循环列表得到每个数据
      if (showGoodsList[i].isShow) { // 判断选中才会计算数量
        // 单品
        if (showGoodsList[i].itemTemp == 0) {
          addNum += showGoodsList[i].quantity; // 所有商品相加
          // 套餐
        } else 
        // if (showGoodsList[i].itemTemp == "COMBO") 
        {
          addNum += showGoodsList[i].combItemQty; // 所有商品相加
        }
      }
    }
    this.setData({ // 最后赋值到data中渲染到页面
      showGoodsList: showGoodsList,
      getTotal: addNum
    });
  },
  //提交
  commitBtn: function () {
    let time = this.data.createTime;
    console.log(this.data.showGoodsList)
    let showGoodsList = this.data.showGoodsList
    let pgrouping = []
    showGoodsList.map(i=>{
      if (i.comboNo){
        i.comItems.map(e=>{
          pgrouping.push({
            itemNo: e.itemNo,
            quantity: i.combItemQty,
            soLineId: e.soLineId,
          })
        })
      }else{
        pgrouping.push({
          itemNo: i.itemNo,
          quantity: i.quantity,
          soLineId: i.soLineId,
        })
      }
      
    })

    var sessionId = cache.get('sessionId', 'null');
    let parameter = {
      branchNo: this.data.goodsList.branchNo, //店铺id
      orderNo: this.data.goodsList.orderNo, //订单号
      returnDate: this.data.getTime, //退货时间
      returnPictureList: this.data.imagesUrl, //退货图片凭证
      returnReason: this.data.val, //退货说明
      returnType: this.data.AfterSale, //this.data.state,   //退货类型
      sessionId: sessionId, //sessionId    
      returnItemDTOList: pgrouping, //商品组
      reasonType: this.data.toEnglish, //退货原因
      userType:'MEMBER'
      // ReturnType:
    }
    if (this.data.totalPrice == "0.00") {
      wx.showToast({
        title: '请选择需要退款的商品',
        icon: 'none',
        duration: 2000
      })
      return false
    }

    if (this.data.createTime == null) {
      wx.showToast({
        title: '请选择退款原因',
        icon: 'none',
        duration: 2000
      })
      return false
    }

    if (this.data.imagesUrl.length == 0) {
      wx.showToast({
        title: '请上传退款凭证',
        icon: 'none',
        duration: 2000
      })
      return false
    }

    let returnsData = JSON.stringify(parameter)
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({ //退货退款接口
      method: 'POST',
      url: `${url}returnOrder/addReturnOrder`,
      data: returnsData,
      success: function (rest) {
        wx.hideLoading();
        let success = rest.data.respDesc
        if (success == "提交退货信息成功") {
          wx.showModal({
            title: success,
            content: '请耐心等待审核',
            showCancel: false,
            cancelText: '',
            cancelColor: '',
            confirmText: '确定',
            confirmColor: '',
            success: function (res) {
              if (res.confirm) {
                app.globalData.refreshOrder=true
                wx.navigateBack({
                  delta: 2
                })
              } else if (res.cancel) {
              }
            },
            fail: function (res) { },
            complete: function (res) { },
          })
        } else {
          wx.showModal({
            title: success,
            content: '请稍后重试',
            showCancel: false,
            cancelText: '',
            cancelColor: '',
            confirmText: '确定',
            confirmColor: '',
            success: function (res) {
              if (res.confirm) {
                // wx.navigateBack({
                //   delta: 2,
                // })
              } else if (res.cancel) {
              }
            },
            fail: function (res) { },
            complete: function (res) { },
          })
        }

      },
      fail: function (rest) {
        wx.hideLoading();
      }
    })
  },
  bindPickerChange: function (e) {

    this.setData({
      index: e.detail.value,
      bln: false,
      fontColor: 'color:#2B2D33;',
      createTime: this.data.array[e.detail.value]
    })
    if (this.data.createTime == '商品过期') {
      this.setData({
        toEnglish: "EXPIRED"
      })
    }
    if (this.data.createTime == '收到的商品破损') {
      this.setData({
        toEnglish: "DAMAGE"
      })
    }
    if (this.data.createTime == '商品错发,漏发') {
      this.setData({
        toEnglish: "INCORRECT"
      })
    }
    if (this.data.createTime == '不想要了') {
      this.setData({
        toEnglish: "NONEED"
      })
    }
    if (this.data.createTime == '其他') {
      this.setData({
        toEnglish: "OTHERS"
      })
    }
  },
  radioChange(e){
    const value=e.detail.value
    this.setData({
      AfterSale:value
    })
    if(value=='BOTH'){
      wx.showToast({
        title:"请联系客服拿到退货地址",
        duration:3000,
        icon:'none'
      })
    }
  }
})
