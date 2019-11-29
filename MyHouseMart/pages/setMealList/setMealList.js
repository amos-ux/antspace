// pages/setMealList/setMealList.js
var app = getApp()
var call = require("../../utils/call.js");
var confirm = require("../../utils/confirm.js");
var cache = require("../../utils/cache.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    param: [],
    difference: false,
    money: null,
    setMealIndex: [],
    scrollPosition: false,
    setMeal: [],
    secondList: [],
    setMeallist: [],
    i: 0,
    setImg: null,
    p: null,
    e: 0,
    color: [],
    combname: null, //套餐名称
    combpicture: null, //套餐图片
    combprice: null, //套餐价格
    colors: null,
    plusMaxChoose: [],
    plusMaxChooses: null,
    groupId: [],
    groupIds: null,
    addColor: false,
    combNum: null,
    quantity: null,
    quantityIndex: null,
    show: false,
    cartShow: false,
    setconst: []
  },



  /**
   * PUBLIC FUNCION
   */
  getGoods(num) {
    let data = []
    let index = this.data.setMeal.findIndex(p => p.combItemNo == num)
    console.log(index)
    call.getData("/service-item/user/combination/group/goods/" + app.globalData.branch.branchNo + "/" + num, data, (res) => {
      
      console.log(res)
      if (res.respData.lenght !== 0 && res.respData !== null) {
        let param = res.respData
        param.map((p, i) => {
          param[i].combinationGroupGoods.map((a, b) => {
            param[i].combinationGroupGoods[b].quantity = 0
          })
        })
        this.data.setMeal[index].goods = param
        this.setData({
          setMeal: this.data.setMeal,
          e: index
        })
        console.log(this.data.setMeal)
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let setMeal = app.globalData.setMeal
    console.log(setMeal)
    let p = []
    for (let i in setMeal) {
      p.push(setMeal[i].combPicture)
    }

    this.setData({
      setMeal: setMeal,
      setP: p,
      setImg: app.globalData.comMeal.combPicture
    })

    this.getGoods(app.globalData.comMeal.combItemNo)
  },
  //点击套餐
  second(i) {
    this.setData({
      i: 0,
      setImg: this.data.setP[i.currentTarget.dataset.index]
    })
    let index = this.data.setMeal.findIndex(p => p.combItemNo == i.currentTarget.dataset.combitemno)
    console.log(index)
    if (!this.data.setMeal[index].goods) {
      this.getGoods(i.currentTarget.dataset.combitemno)
    } else {
      this.setData({
        e: index
      })
    }
  },

  //套餐二级点击
  secondList(i) {
    this.setData({
      i: i.currentTarget.dataset.index
    })
  },

  // 添加&&减少
  numChange(i) {
    let type = i.currentTarget.dataset.type
    let leftIndex = this.data.e
    let topIndex = this.data.i
    let itemNo = i.currentTarget.dataset.itemno
    let index = this.data.setMeal[leftIndex].goods[topIndex].combinationGroupGoods.findIndex(p => p.itemNo == itemNo)
    console.log(index)
    // 加
    if (type == 'add') {
      let maxs = 0
      this.data.setMeal[leftIndex].goods[topIndex].combinationGroupGoods.map(p => {
        maxs += p.quantity
      })
      if (maxs != this.data.setMeal[leftIndex].goods[topIndex].plusMaxChoose) {
        this.data.setMeal[leftIndex].goods[topIndex].combinationGroupGoods[index].quantity < this.data.setMeal[leftIndex].goods[topIndex].plusMaxChoose ? this.data.setMeal[leftIndex].goods[topIndex].combinationGroupGoods[index].quantity++ : null
        wx.showToast({
          title: '添加成功',
        })
      }

    }
    // 减
    if (type == 'subtract') {
      this.data.setMeal[leftIndex].goods[topIndex].combinationGroupGoods[index].quantity > 0 ? this.data.setMeal[leftIndex].goods[topIndex].combinationGroupGoods[index].quantity-- : null

    }

    // 加号灰
    let max = 0
    this.data.setMeal[leftIndex].goods[topIndex].combinationGroupGoods.map(p => {
      max += p.quantity
    })
    this.setData({
      cartShow: (max == this.data.setMeal[leftIndex].goods[topIndex].plusMaxChoose) ? true : false
    })
    this.data.setMeal[leftIndex].goods[topIndex].addColor = (max == this.data.setMeal[leftIndex].goods[topIndex].plusMaxChoose) ? true : false

    if (max == this.data.setMeal[leftIndex].goods[topIndex].plusMaxChoose) {
      console.log(this.data.i)
      if (this.data.i < this.data.setMeal[leftIndex].goods.length - 1) {
        this.setData({
          i: this.data.i + 1
        })
        console.log(this.data.i)
      }
      if (topIndex == this.data.setMeal[leftIndex].goods.length - 1) {
        // 显示
        this.setData({
          cartShow: true
        })
        // if (leftIndex<this.data.setMeal.length-1){
        //   this.setData({
        //     e: this.data.e + 1
        //   })
        //   this.setData({
        //     i: 0
        //   })
        //   let index = this.data.setMeal.findIndex(p => p.combItemNo == this.data.setMeal[this.data.e].combItemNo)
        //   console.log(index)
        //   if (!this.data.setMeal[index].goods) {
        //     this.getGoods(this.data.setMeal[this.data.e].combItemNo)
        //   } else {
        //     this.setData({
        //       e: index
        //     })
        //   }
        // }
      } else {
        this.setData({
          cartShow: false
        })
      }
    }

    this.setData({
      setMeal: this.data.setMeal,
      setconst: this.data.setMeal
    })





  },









  //显示商品
  show() {
    this.shopping()
  },
  //点击显示
  shopping() {
    let setMeals = this.data.setconst
    let goodsList = []

    for (let i in setMeals) {
      for (let e in setMeals[i].goods) {
        for (let index in setMeals[i].goods[e].combinationGroupGoods) {
          if (setMeals[i].goods[e].combinationGroupGoods[index].quantity > 0) {
            goodsList.push(setMeals[i].goods[e].combinationGroupGoods[index])

          }
        }
      }
    }


    setMeals.map((p, i) => {
      setMeals[i].goodsList = goodsList
    })

    setMeals = setMeals.forEach((res, e) => {
      res.goodsList = res.goodsList.filter(item => item.combItemNo == res.combItemNo)

    })

    console.log(this.data.setMeal)
    app.globalData.order = this.data.setMeal

    this.setData({
      show: true,
      setMealIndex: this.data.setMeal
    })
    console.log(this.data.setMealIndex)
    let money
    for (let i in this.data.setMeal) {
      if (this.data.setMeal[i].goodsList.length !== 0) {
        money += this.data.setMeal[i].combPrice
      }

    }
    if (money < 15) {
      this.setData({
        money: 15 - money
      })
    } else {
      this.setData({
        difference: true
      })
    }

  },
  //点击关闭显示
  imgShow() {
    this.setData({
      show: false
    })
  },
  //点击空白关闭
  bigShow() {
    this.setData({
      show: false
    })
  },

  //滚动触发
  event(e) {
    this.setData({
      scrollPosition: e.detail.scrollTop > 161 ? true : false
    })
  },

  //点击支付
  pay() {
    console.log(this.data.setMeal)

    let good = []
    let sumsalePrice = null;
    let money = null
    for (let i in this.data.setMeal) {
      if (this.data.setMeal[i].goodsList.length !== 0) {
        sumsalePrice += this.data.setMeal[i].combPrice
        money += this.data.setMeal[i].combPrice
        good.push({
          id: this.data.setMeal[i],
          number: 1,
          comb: true,
          extOption: []
        })

      }

    }
    console.log(good)
    console.log(sumsalePrice)
    console.log(money)

    app.globalData.order = good
    wx.navigateTo({
      url: '../confirmOrder/confirmOrder?money=' + money + "&sumsalePrice=" + sumsalePrice,
    })

  },
  //点击继续选购
  contInue() {
    console.log(this.data.setMeal)
    this.data.setMeal.map((p, i) => {
      this.data.setMeal[i].salePrice = this.data.setMeal[i].combPrice
      this.data.setMeal[i].disPrice = 0
    })
    let good = []
    let sumsalePrice = null;
    let money = null
    for (let i in this.data.setMeal) {
      if (this.data.setMeal[i].goodsList.length !== 0) {
        sumsalePrice += this.data.setMeal[i].combPrice
        money += this.data.setMeal[i].combPrice
        good.push({
          id: this.data.setMeal[i],
          number: 1,
          comb: true,
          extOption: []
        })

      }

    }

    app.globalData.order = good
    wx.switchTab({
      url: '../commodityList/commodityList',
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },




  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {


  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})