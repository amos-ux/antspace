let request=require('../../utils/soul_chen')
var cache = require("../../utils/cache.js");
var call = require("../../utils/call.js")
let app=getApp()

let num=1,maxLength=0  //请求数据条数和页数  必传  后台返回的数据最大长度
let item={}
let data_chen
Page({
    data:{
        isRefreshing: true,
        isLoadingMoreData: null,
        img:[],
        list:[],
        Advancesale:false,
        specification: false,
        dateAdvancesale:[],//预售事件段
        extOptions:[],
        hide_good_box: true,
        shopLength:0,
        off:false //当数据达到上限之后出发这个，界面便不开始加载
    },
    onLoad(options){
        if(typeof options.item=='object'){
            item=JSON.parse(options.item)
        }else{
            item.blId=options.blId
            item.title=options.title?options.title:'超值返现'
        }
        wx.setNavigationBarTitle({
            title: item.title
         })  
        data_chen={
            "pageNum":num,
            "pageSize":30,
            "searchParams":{
            "branchNo":app.globalData.branch.branchNo,
            "blId":item.blId
            }
        }
        this.busPos = {};
        this.busPos['x'] = 20;//购物车的位置
        this.busPos['y'] = app.globalData.hh - 50;
        this.http()
        let data = {
        }
        call.getData("/service-item/trolley/queryTrolleyCount?branchNo="+app.globalData.branch.branchNo+"&sessionId="+cache.get("sessionId",this),data,(res)=>{
            this.setData({
            shopLength:res.respData
          })
        })
    },
    onShow(){
        let data = {
        }
        call.getData("/service-item/trolley/queryTrolleyCount?branchNo="+app.globalData.branch.branchNo+"&sessionId="+cache.get("sessionId",this),data,(res)=>{
            this.setData({
            shopLength:res.respData
          })
        })
    },
    startAnimation: function () {
        var index = 0,
          that = this,
          bezier_points = that.linePos['bezier_points'],
          len = bezier_points.length - 1;
        this.setData({
          hide_good_box: false,
          bus_x: that.finger['x'],
          bus_y: that.finger['y']
        })
        this.timer = setInterval(function () {
          index++;
          that.setData({
            bus_x: bezier_points[index]['x'],
            bus_y: bezier_points[index]['y']
          })
          if (index >= len) {
            clearInterval(that.timer);
            that.setData({
              hide_good_box: true,
            })
          }
        },25);
    },
    http(){
        let Advertisement={
            'branchNo':app.globalData.branch.branchNo,
            'bizLine':'123123', //处理后端问题
            'code':'rebate_banner1'
        }
        Promise.all([
            request.request('/service-item/adverBanner/getWaterBarAdver',Advertisement,'GET',false),
            request.request('/service-item/public/branch/activity/search',data_chen,'POST',false)
        ])
        .then(res=>{
           this.setData({
               img:res[0].respData,
               list:res[1].respData.data,
              //  list:this.filter(res[1].respData.data),
               isRefreshing:true
           })
           wx.hideLoading()
           maxLength=res[1].respData.total
        })

    },
    onReachBottom() {
        if(this.data.off==false){
            data_chen.pageNum=num+1    
                request.request('/service-item/public/branch/activity/search',data_chen,'POST',false).then(res=>{
                    this.setData({
                        isLoadingMoreData: true,
                        isRefreshing:true,
                        list:[...this.data.list,...res.respData.data]
                        // list:this.filter([...this.data.list,...res.respData.data])
                    })
                    // setInterval(()=>{
                    //       this.setData({
                    //         isLoadingMoreData: false,

                    //       },500)
                    // })
                    if(res.respData.data.length<30){
                        this.setData({
                                isLoadingMoreData: false,
                                off:true
                            })
                    }
                    wx.hideLoading()
                    num++
                })

            // }else{
                
            //     this.setData({
            //         isLoadingMoreData: false,
            //         off:true
            //     })
            // }
        }
        //数据请求
    },
    
    imgOclick(e){
        console.log(e)
        wx.navigateTo({
            url:this.data.img.advers[e.target.dataset.index].adLink
        })
    },
    close(){
        this.setData({
            Advancesale:false
        })
    },
    check(e){//查看预售
        let stTimes=e.target.dataset.item
        if(stTimes.stTimes!=null||stTimes.stTimes.leng!=0){
            this.setData({
                Advancesale:true,
                dateAdvancesale:stTimes.stTimes
            })
        }
    },
    tohome(){
        wx.switchTab({
            url:'/pages/index/index'    
        })
    },
    shoppingcart(e){
      let that =this
      wx.getSetting({
        success(res) {
          if (res.authSetting["scope.userInfo"]) {
            let item = e.target.dataset.item
            // if(item.extOptions==null||item.extOptions.length==0){
            let data = {
              "sessionId": cache.get("sessionId", null),
              "itemNo": e.currentTarget.dataset.item.itemNo,
              "quantity": "1",
              "branchNo": app.globalData.branch.branchNo,
              "blId": e.currentTarget.dataset.item.blId,
              "isCombined": e.currentTarget.dataset.item.isCombined,
              "combSubItems": e.currentTarget.dataset.item.combSubItems

            }
            call.postData("/service-item/trolley/addItemToTrolley", data, (res) => {
              that.setData({
                shopLength: that.data.shopLength + 1
              })
              if (!that.data.hide_good_box) return;
              that.finger = {};
              var topPoint = {};
              that.finger['x'] = e.touches["0"].clientX;
              that.finger['y'] = e.touches["0"].clientY;
              if (that.finger['y'] < that.busPos['y']) {
                topPoint['y'] = that.finger['y'] - 150;
              } else {
                topPoint['y'] = that.busPos['y'] - 150;
              }
              topPoint['x'] = Math.abs(that.finger['x'] - that.busPos['x']) / 2;
              if (that.finger['x'] > that.busPos['x']) {
                topPoint['x'] = (that.finger['x'] - that.busPos['x']) / 2 + that.busPos['x'];
              } else {
                topPoint['x'] = (that.busPos['x'] - that.finger['x']) / 2 + that.finger['x'];
              }
              that.linePos = app.bezier([that.finger, topPoint, that.busPos], 20);
              that.startAnimation();
            }, (rest) => {
              wx.showToast({
                title: rest.respDesc,
                icon: 'none'
              })
            })
            //执行加入购物车动画
        // }else{
        //     for(let i=0;i<item.extOptions.length;i++){
        //         for(let j=0;j<item.extOptions[i].options.length;j++){
        //             if(i==0){  //默认第一项选中
        //                 let josn={
        //                     name:item.extOptions[0].options[j],
        //                     isShow:false
        //                 }
        //                 item.extOptions[0].options[j]=josn
        //             }else{
        //                 let josn={
        //                     name:item.extOptions[i].options[j],
        //                     isShow:false
        //                 }
        //                 item.extOptions[i].options[j]=josn
        //             }
        //         }
        //     }
        //     this.setData({
        //         specification:true,
        //         extOptions:item
        //     })
        // }
          }else{
              wx.navigateTo({
                url: '/pages/register/register',
              })
          }
        }
      })
        
    },
    shut(i) {
        let item=i.target.dataset.item,
            index=i.target.dataset.index,
            extOptions=this.data.extOptions
            for(let i=0;i<item.options.length;i++){ //防止选择多个
                item.options[i].isShow=false
            }
        item.options[index].isShow=true;
        for(let i=0;i<extOptions.extOptions.length;i++){
            if(extOptions.extOptions[i].dataName==item.dataName){
                extOptions.extOptions[i].options=item.options
                this.setData({
                    extOptions:extOptions
                })
            }
        }
      },
    joinCart(){
        this.setData({
            shopLength:this.data.shopLength+1
        })
          console.log(this.data.extOptions)//加入购物车
    },
    specification(){
        this.setData({
          specification: false
        })
    },
      //关闭规格
       over(){
        this.setData({
        specification:false
        })
    },
    toShop(e){
      let details = e.currentTarget.dataset.item
      console.log(e.currentTarget.dataset.item)
      details.remarksName = details.remarksName.replace("'", "").replace("&", "").replace("=", "");
      details.itemName = details.itemName.replace("'", "").replace("&", "").replace("=", "");
      wx.navigateTo({
        url: "/pages/goodsDetails/goodsDetails?details=" + JSON.stringify(details),
      })
    },
    RouterShop(){
        wx.navigateTo({
            url:'/pages/commonCart/commonCart'
        })
    },
    /**
     * @param {Array} list
     * @return {Arrar}
     */
    filter(list){
      console.time('start')
      let arr=[],length=list.length,nextlist=[]
      for(let i=0;i<length;i++){
        if(list[i].stockQty==0){
          arr.push(list[i])
        }else{
          let maxValue=[]
          maxValue.push(list[i])
          nextlist.push(...maxValue)
        }
      }
      // nextlist.sort(this.createComparisonFunction("refundValue"))
      console.error(nextlist)
      nextlist.sort((a,b)=>{
        return b.refundValue-a.refundValue
      })
      console.timeEnd('start')
      return [...nextlist,...arr]
    },
    onShareAppMessage: function (options) {
        console.log(options)
        var that = this;
        // 设置转发内容
        var shareObj = {
        title: "我家小程序",
          path: '/pages/connectWifi/connectWifi', // 默认是当前页面，必须是以‘/’开头的完整路径
        imgUrl: '', //转发时显示的图片路径，支持网络和本地，不传则使用当前页默认截图。
        success: function (res) {　 // 转发成功之后的回调　　　　　
        
        },
        
        };
        
        return shareObj;
        },
})