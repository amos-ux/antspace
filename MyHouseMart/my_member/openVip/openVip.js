Page({
  data: {
    status:''
  },
  onLoad: function(options){
    const {status} = options
    wx.setNavigationBarTitle({title : status=='openVip'?'会员返现':'会员权益',})
    this.setData({status})
  },
  // 开通会员
  skipVip() {
    wx.navigateTo({
      url: '/my_member/JoinMember/JoinMember',
    })
  }
})