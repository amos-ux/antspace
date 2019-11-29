//封装支付请求
function pay(res, successData, errorData) {
  wx.requestPayment({
    "timeStamp": res.data.timeStamp,
    "nonceStr": res.data.nonceStr,
    "package": res.data.package,
    "signType": res.data.signType,
    "paySign": res.data.paySign,
    "success": function (res) {
      wx.showToast({
        title: '支付成功',
        icon: "success",
        duration: 1000,
        success: function (data) {
          successData(data)
        }
      })
    },
    "fail": function (res) {
      if (errorData) {
        errorData(res)
      }
      wx.showToast({
        title: '取消支付成功!',
        icon: "success",
        duration: 1500,
      })
    }
  })
}
module.exports={
  pay:pay
}

//调用
// config.pay(res, (res) => {
 
// },(res) => {
 
// })