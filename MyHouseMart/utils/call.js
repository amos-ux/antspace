//封装get请求生产
let we = require("./util.js")

function getData(url, data, dosuccess, dofail, succeed) {
  wx.request({
    url: we.webUrl + url,
    data: data,
    header: {
      "content-type": "application/json;"
    },
    method: "GET",
    success(res) {
      if (res.data.respCode == "0000" || res.data.code == "00") {
        dosuccess(res.data)
      } else {
        dofail(res.data)
      }
    },
    fail(res) {
      succeed(res.data)
    }
  })
}
//封装post请求不需要请求cokie
function postData(url, data, dosuccess, dofail, succeed) {
  wx.request({
    url: we.webUrl + url,
    data: data,
    header: {
      "content-type": "application/json;"
    },
    method: "POST",
    success(res) {
      if (res.data.respCode == "0000" || res.data.code == "00") {
        dosuccess(res.data)
      } else {
        dofail(res.data)
      }
    },
    dofail(res) {
      succeed(res.data)
    }
  })
}
//携带cookie的get请求
function getCookie(url, cookie, data, dosuccess, dofail, succeed) {
  wx.request({
    url: we.webUrl + url,
    data: data,
    header: {
      "Cookie": cookie
    },
    method: 'GET',
    success: function(res) {
      if (res.data.respCode == "0000" || res.data.code == "00") {
        dosuccess(res.data)
      } else {
        dofail(res.data)

      }
    },
    fail: function(res) {
      succeed(res.data)
    },
  })
}
//携带cookie的post请求
function postCookie(url, cookie, data, dosuccess, dofail, succeed) {
  wx.request({
    url: we.webUrl + url,
    data: data,
    header: {
      "Cookie": cookie
    },
    method: 'POST',
    success: function(res) {
      if (res.data.respCode == "0000" || res.data.code == "00") {
        dosuccess(res.data)
      } else {
        dofail(res.data)

      }
    },
    fail: function(res) {

      succeed(res.data)

    },
  })
}
module.exports = {
  getCookie: getCookie,
  postCookie: postCookie,
  getData: getData,
  postData: postData
}
//调用
// call.getData(url,data,(res)=>{
//     成功
// },(res)=>{
//     失败
// })