import request from "../../utils/my_page"
Page({
    data:{
        list:{},
        traces:[]
    },
    onLoad(options){
        // /service-order-prc/applet/order/espressage/0000251911040003P9
        request('/service-order-prc/applet/order/espressage/'+options.orderNo,{},true,'GET').then(res=>{
            if(res.respData.logisticCode){
                request(`/service-iot-prc/public/expressage/query/code/${res.respData.logisticCode}`,{},true,'GET').then(res=>{
                    this.setData({
                        ShipperName:res.respData.shippers[0].ShipperName
                    })
                })
            }
            // 后端返回物流信息
            if(res.respData.traces.length!=0){
                this.setData({
                    list:res.respData,
                    traces:res.respData.traces
                })
            }else{
                // 后端查不到物流信息
                let date=new Date()
                let list=this.data.list
                const traces=[{AcceptStation:'商家已接单，等待商家发货中',AcceptTime:`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}]
                list.traces=traces
                this.setData({
                    list,
                    traces
                })
            }

        })
        // .catch(err=>{
        //     let date=new Date()
        //         let list=this.data.list
        //         const traces=[{AcceptStation:'暂无物流信息',AcceptTime:`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}]
        //         list.traces=traces
        //         this.setData({
        //             list,
        //             traces
        //         })
        // })
    }
})
