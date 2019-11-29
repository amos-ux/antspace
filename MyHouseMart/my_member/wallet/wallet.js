import request from '../../utils/my_page'
const app = getApp();
let rpx = 0.5
Page({
  data: {
    balanceAmount: 0,
    resultData: [],
    transType: null,
    dateFrom: null,
    transAmt:0,
    index:1,
    account:[],
    vip:false,
    endvip:false,
    now:0,
    animation:'',
    date:'',
    totalAmount:0,
    quantity:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let dt=new Date(new Date().getTime()-24*60*60*1000)
    let that=this
    this.setData({
      date:`${dt.getFullYear()}-${dt.getMonth()+1<10?'0'+dt.getMonth()+1:dt.getMonth()+1}-${dt.getDate()<10?'0'+dt.getDate():dt.getDate()} 18:00`
    })
    wx.getSystemInfo({success: res => {rpx = 1 * (res.windowWidth * res.pixelRatio) / (750 * res.pixelRatio)}})
    let vipDate;
    wx.getSystemInfo({
      success:function(res){
        if(res.platform == "devtools"){
          vipDate=wx.getStorageSync('userInfo').effectiveTo?new Date(wx.getStorageSync('userInfo').effectiveTo).getTime():0
        }else if(res.platform == "ios"){
          vipDate=wx.getStorageSync('userInfo').effectiveTo?new Date(wx.getStorageSync('userInfo').effectiveTo.replace('/-/g','/')).getTime():0
        }else if(res.platform == "android"){
          vipDate=wx.getStorageSync('userInfo').effectiveTo?new Date(wx.getStorageSync('userInfo').effectiveTo).getTime():0
        }
      }
    })
    let nowDate=new Date().getTime()
    const now_date = this.getNowDate(new Date())
    let data={
      userId:wx.getStorageSync('userInfo').userId
    }
    if(vipDate){
      if(nowDate>vipDate){
        request('/service-member/public/get/my/home/invalid/member/renew/alert/info',data,true,'GET').then(res=>{
          let { lastTransDate, totalAmount, quantity } = res.respData
          wx.getSystemInfo({
            success:function(rest){
              if (lastTransDate){
                let timestr = rest.platform == "ios" ? lastTransDate.slice(0,10).replace('/-/g','/') : lastTransDate.slice(0,10)
                const endvip = that.datedifference(now_date, timestr) == 0 ? true : false
                that.setData({totalAmount,quantity,endvip})
              }
            }
          })
        })
      }else if((vipDate-nowDate)<86400000*3){
        request('/service-member/public/get/my/home/valid/member/renew/alert/info',data,true,'GET').then(res=>{
          if(res.respData!=0){
            this.setData({
              now:res.respData,
              vip:true
            })
          }
        })
      }
    }
  },
  // 加载页面数据
  showAmountData: function () {
    const data={
      "userId": wx.getStorageSync('userId'),
    }
    request('/service-member/public/get/my/home/statistics/info',data,true,'GET').then(res=>{
      let { respData: list } = res
      const cashPayPercent = list.cashPayPercent * 100, //现金支出比例
        cashPercent = (1 - Number(list.cashPayPercent)) * 100, //返现钱包比例
        progress_pay_width = (Number(cashPayPercent) / 100) * 700,//现金支出比例 百分比
        progress_act_width = (Number(cashPercent) / 100) * 700//返现钱包比例 百分比
        list.cashPayPercent = cashPayPercent
        list.cashPercent = cashPercent
        list.progress_pay_width = progress_pay_width
        list.parallelogram = Number(progress_pay_width) - 8
        list.progress_act_width = progress_act_width
        this.setData({list})
    })
  },
  account(){
    const data={
      "pageNum": 1,
      "pageSize": 5,
      "searchParams": {
        "userId": wx.getStorageSync('userId'),
      }
    }
    request('/service-member/public/get/account/info',data,true,'POST').then(res=>{
      this.setData({
        account:res.respData
      })
    })
  },
  toJoinMember(){
    wx.navigateTo({
      url: '/my_member/JoinMember/JoinMember',
    })
  },
  toOpenVip(){
    wx.navigateTo({
      url: '/my_member/openVip/openVip?status=openVip',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.showAmountData()
    this.account()
  },
  // 点击导航栏
  tabBar:app.debounce1(function(e){
    const index=e.currentTarget.dataset.index
    if(index!=this.data.index){
      this.animation = wx.createAnimation({duration: 200});
      this.animation.translate(index == 1 ? 0 : 350 * rpx, 0).step()
      this.setData({index,animation: this.animation.export()})
    }
  },600),
  //跳转账单明细
  toDetailed(){
    wx.navigateTo({
      url: '/my_member/billDateil/billDateil'
    })
  },
  // 比较两个日期距离天数
  datedifference: function (sDate1, sDate2) {
    return Math.floor(Math.abs(Date.parse(sDate1) - Date.parse(sDate2)) / (24 * 3600 * 1000))
  },
  getNowDate: function (date) {
    return [date.getFullYear(), (date.getMonth() + 1), date.getDate()].map(function (n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }).join('-')
  }
})