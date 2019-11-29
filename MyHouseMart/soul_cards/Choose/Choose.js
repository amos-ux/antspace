let request=require('../../utils/soul_chen')
var cache = require("../../utils/cache.js");
var call = require("../../utils/call.js")
let app=getApp()
let item,itenChild

Page({
    data:{
        hide:'none', //购物车动画是否隐藏
        soul:0,
        type:false,
        close:false,//动画
        second:0,//二级选项卡,
        second_list:{},
        three_list:[],
        index:'index0',
        specification: false,
        list:{},
        img:[],
        Advancesale:false,//预售弹窗开关,
        dateAdvancesale:[],//预售事件段
        extOptions:[],//规格
        hide_good_box: true,
        shopLength:0,
        blId:0,//业务线Id
        height:"",

      specification: [],
      option: false,
      options: [],
      extOptions: [],
    },
    onLoad(options){
        
        item=JSON.parse(options.item)
        itenChild=options.itemChild?JSON.parse(options.itemChild):{linkParam1:'',linkParam2:''}
        this.http()
        let blId = item.blId;
        this.setData({
          blId: blId
        })
        wx.setNavigationBarTitle({
            title:item.bizLineName
        })
        wx.setNavigationBarColor({
            frontColor:'#000000',
            backgroundColor: item.bizLineCode == 'CVS' || item.bizLineCode == 'COFFEE'?'#ffffff':'#FFEC14'
        })
        this.busPos = {};
        this.busPos['x'] = 70;//购物车的位置
        this.busPos['y'] = app.globalData.hh - 60;
        let data = {
        }
        call.getData("/service-item/trolley/queryTrolleyCount?branchNo="+app.globalData.branch.branchNo+"&sessionId="+cache.get("sessionId",this),data,(res)=>{
            this.setData({
            shopLength:res.respData
          })
        })
    },
    onReady(){
     
      
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
    http(){ 
            let Advertisement={
                'branchNo':app.globalData.branch.branchNo,
                'code':'business_choose_banner1',
                'bizLine':item.bizLineCode
            }
            request.request('/service-item/adverBanner/getWaterBarAdver',Advertisement,'GET').then(res=>{
                this.setData({img:res.respData})
            })
            request.request('/service-item/public/get/biz/primary/cls',{"branchNo": app.globalData.branch.branchNo,"blId": item.blId}).then(res=>{
                        this.setData({
                            list:res.respData,
                            soul:itenChild.linkParam1!=''?res.respData.findIndex(p=>p.mapCode==itenChild.linkParam1):0
                        })
                            request.request('/service-item/public/get/second/item',{"branchNo": app.globalData.branch.branchNo,"blId": item.blId,"mapCode":res.respData[itenChild.linkParam1!=''?res.respData.findIndex(p=>p.mapCode==itenChild.linkParam1):0].mapCode}).then(res=>{
                                if(res.respData!=null){
                                    let index=itenChild.linkParam2!=''?res.respData.findIndex(p=>p.mapCode==itenChild.linkParam2):0
                                    let pull=res.respData.findIndex(p=>p.mapCode==itenChild.linkParam2)+1>3?true:false //业务进去是够开启箭头
                                    this.setData({
                                       three_list:res.respData,
                                       second:itenChild.linkParam2!=''?res.respData.findIndex(p=>p.mapCode==itenChild.linkParam2):0,
                                       index:'index'+index,
                                       type:pull
                                   })
                                   let that=this
                                   setTimeout(()=>{  //解决左侧一级菜单栏过高问题
                                     var query = wx.createSelectorQuery();
                                     query.select('.top_swiper').boundingClientRect()
                                     query.exec(function (res) {   
                                     if(res[0]!=null){
                                       let height=app.globalData.hh-res[0].height-100
                                       that.setData({
                                         height:height+'px'
                                       })
                                     }
                                    })
                                   },500)
                                }else{
                                    wx.showToast({
                                        title:'暂无数据',
                                        mask:true,
                                        icon:"none",
                                    })
                                }
                            })
                    })
            // })
    },
    TabSwitching(e){//一级分类,二级切换
        let {soul,second}=this.data
        if(e.currentTarget.dataset.type=='first'){
            if(soul!=e.currentTarget.dataset.index){
                        request.request('/service-item/public/get/second/item',{"branchNo": app.globalData.branch.branchNo,"blId": item.blId,"mapCode":this.data.list[e.currentTarget.dataset.index].mapCode}).then(res=>{
                            if(res.respData!=null){
                                this.setData({
                                    three_list:res.respData,
                                    index:'index0'
                                })
                            }else{
                                this.setData({
                                    three_list:[]
                                })
                                wx.showToast({
                                    title:'暂无数据',
                                    mask:true,
                                    icon:"none",
                                })
                            }
                        })
                this.setData({
                    soul:e.currentTarget.dataset.index,
                    second:0,  //防止二级选项卡切换后立即切换一级选项卡丢失下标问题
                    type:false,  //是否加载动画
                    close:false, //处理快速切换一级分类时并将动画展开之后，动画回收延时问题！
                })
            }
        }else{
            if(second!=e.currentTarget.dataset.index){
                this.setData({
                    second:e.currentTarget.dataset.index,
                    index:'index'+e.currentTarget.dataset.index,
                })
            }
        }   
    },
    open(){
        let off=!this.data.type
        if(off==false){
            this.setData({
                close:!this.data.close  //二级分类回收动画
            })
        }
        this.setData({
            type:!this.data.type,   //二级分类展开动画
            close:true
        })
    },
  toggleToast(e) {
    this.setData({
      shopLength: e.detail
    })
  },
  hide(e) {
    this.setData({
      option: e.detail
    })
  },
  shoppingcart(e) {
    let that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.userInfo"]) {
          let data = {
            "sessionId": cache.get("sessionId", null),
            "itemNo": e.currentTarget.dataset.item.itemNo,
            "quantity": "1",
            "branchNo": app.globalData.branch.branchNo,
            "blId": e.currentTarget.dataset.item.blId,
            "isCombined": e.currentTarget.dataset.item.isCombined,
            "combSubItems": e.currentTarget.dataset.item.combSubItems
          }
          let item = e.target.dataset.item
          let option = item.extOptions
          let specification = item
          if (item.extOptions == null || item.extOptions.length == 0) {
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
          } else {
            that.setData({
              specification: specification,
              options: option,
              option: true //显示规格
            })
          }

        } else {
          wx.navigateTo({
            url: '/pages/register/register',
          })
        }
      }
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
        }, 25);
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
    
    check(e){//查看预售
        let stTimes=e.target.dataset.item
        if(stTimes.stTimes!=null||stTimes.stTimes.leng!=0){
            this.setData({
                Advancesale:true,
                dateAdvancesale:stTimes.stTimes
            })
        }
    },
    close(){
        this.setData({
            Advancesale:false
        })
    },
    tohome(){
        wx.switchTab({
            url:'/pages/index/index'    
        })
    },
    bottom(e){
        let {three_list}=this.data
        if(this.data.three_list.length>3){
            this.setData({
                type:true
            })
        }
        this.setData({
            index:'index'+three_list.length-1,
            second:three_list.length-1
        })
    },
    top(e){
        this.setData({
            index:'index0',
            second:0
        })
    },
    chen(e){
        // if(second!=e.currentTarget.dataset.index.substr(e.currentTarget.dataset.index.length-1,1)){
            if(e.currentTarget.dataset.index.substr(e.currentTarget.dataset.index.length-1,1)-3>=0){
                this.setData({
                    type:true
                })
            }else{
                this.setData({
                    type:false
                })
            }
            this.setData({
                second:e.currentTarget.dataset.index.substr(e.currentTarget.dataset.index.length-1,1)
            })
        // } 
    },
    toShop(e){
      let details = e.currentTarget.dataset.item
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
  // 跳转到搜索详情页
  toSearch: function () {
    wx.navigateTo({
      url: `/pages/shopSearch/shopSearch?blId=${this.data.blId}`,
    })
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