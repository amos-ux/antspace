const utils = require("../../utils/util.js"),
  e = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: "",
    canvas: true
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
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
  onShareAppMessage: function(options) {
    console.log(options)
    var that = this;
    // 设置转发内容
    var shareObj = {
      title: "我家小程序",
      path: '/pages/connectWifi/connectWifi',
      imgUrl: '',
      success: function(res) {}
    };

    return shareObj;
  },
  //点击拍照
  faceButton: function(res) {
    let that = this;
    var _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: function(photo) {
        console.log(photo);
        wx.getImageInfo({
          src: photo.tempFilePaths[0],
          success: function(res) {
            console.log(res)
            var ctx = wx.createCanvasContext('photo_canvas');
            var ratio = 3;
            var canvasWidth = res.width
            var canvasHeight = res.height;
            // 保证宽高均在200以内

            while (canvasWidth > 200 || canvasHeight > 200) {
              //比例取整
              canvasWidth = Math.trunc(res.width / ratio)
              canvasHeight = Math.trunc(res.height / ratio)
              ratio++;
            }
            _this.setData({
              canvasWidth: canvasWidth,
              canvasHeight: canvasHeight
            }) //设置canvas尺寸

            ctx.drawImage(photo.tempFilePaths[0], 0, 0, canvasWidth, canvasHeight)
            ctx.draw(false, setTimeout(() => {
              wx.canvasToTempFilePath({
                canvasId: 'photo_canvas',
                success: function(res) {
                  console.log(res)
                  wx.showLoading({
                    title: '正在上传...',
                    mask: true
                  })
                  var path = res.tempFilePath;
                  console.log(path)
                  utils.uploadFile("/service-member/upload/face", path, "face", "POST", function(rest) {
                    console.log("face")
                    wx.hideLoading();
                    wx.showToast({
                      title: '上传成功',
                      //图片上传成功回调确认开通刷脸支付
                      success: function() {
                        wx.showModal({
                          title: '是否确认开通刷脸支付？',
                          content: '刷脸支付',
                          //接口调用成功的回调函数
                          success: function(res) {
                            console.log(res)
                            if (res.confirm) { //confirm为 true 时，表示用户点击了确定按钮
                              utils.httpClient("/service-member/signing", "POST", null,
                                function(rest) {
                                  console.log(rest);
                                  let data = {
                                    appid: rest.data.appId,
                                    contract_code: rest.data.contractCode,
                                    contract_display_account: rest.data.contractDisplayAccount,
                                    mch_id: rest.data.mchId,
                                    notify_url: rest.data.notifyUrl,
                                    plan_id: rest.data.planId,
                                    request_serial: rest.data.requestSerial,
                                    timestamp: rest.data.timestamp,
                                    sign: rest.data.sign
                                  }
                                  wx.navigateToMiniProgram({
                                    appId: 'wxbd687630cd02ce1d',
                                    path: 'pages/index/index',
                                    extraData: data,
                                    success(res) {
                                      console.log(res)
                                      wx.showModal({
                                        title: '开通成功',
                                        content: '您已开通刷脸支付，状态更改可能需要几分钟的时间，您每天将有五次刷脸支付的机会',
                                        showCancel: false, //是否显示取消按钮
                                        success() { //成功回调
                                          wx.navigateBack({})
                                        },
                                        fail(res) {
                                          console.log(res)
                                        }
                                      })
                                    },
                                    //接口调用失败的回调函数
                                    fail(res) {},
                                    //接口调用结束的回调函数（调用成功、失败都会执行）
                                    complete() {

                                    }
                                  })
                                },
                                function(rest) {
                                  console.log(rest);
                                  wx.showModal({
                                    title: "操作失败",
                                    content: rest.message,
                                  })
                                });
                            } else if (res.cancel) {

                            }
                          }
                        })
                      }
                    })
                    _this.setData({
                      src: path,
                      chooseImage: true
                    })
                  });
                },
                fail: function(error) {
                  console.log(error)
                }
              })
            }, 200))
          },
          fail: function(error) {

            console.log(error)
          }
        })

      },
      error: function(res) {
        console.log(res);
      }
    })

    return;
    var _this = this;
    //从本地相册选择图片或使用相机拍照
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: function(res) {
        var tempFilePaths = res.tempFilePaths[0];
        _this.drawCanvas(tempFilePaths);
        return;
        wx.showLoading({
          title: '正在上传...',
          mask: true
        })
        utils.uploadFile("/upload/face",
          tempFilePaths,
          "face",
          "POST",
          function(rest) {
            console.log(rest);
            wx.hideLoading();
            wx.showToast({
              title: '上传成功',
            })
            _this.setData({
              src: res.tempFilePaths,
              chooseImage: true
            })
          });
      }
    })
  }
})