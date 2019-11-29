function pay(rest, successFun, failFun) {
  let packages = rest.data.package;
  let nonceStr = rest.data.nonceStr;
  let paySign = rest.data.paySign;
  let timeStamp = rest.data.timeStamp.toString();
  let signType = rest.data.signType;
  wx.requestPayment({
    timeStamp: timeStamp,
    nonceStr: nonceStr,
    package: packages,
    signType: signType,
    paySign: paySign,
    success(res) {
      successFun(res)
    },
    fail(res) {
      failFun(res);
    }
  })
}

module.exports = {
  pay: pay
}