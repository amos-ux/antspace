Page({
  data: {
    status:''
  },
  onLoad: function (options) {
    let that = this
    const {status} = options
    wx.setNavigationBarTitle({title : status=='firstFree'?'会员首单免费购':status=='greatPackage'?'超值大礼包活动说明':'新会员超值购说明',})
    that.setData({status})
  }
})