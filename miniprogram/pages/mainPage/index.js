// miniprogram/pages/mainPage/index.js
const app = getApp()
var openid = wx.getStorageSync("openid");
const db=wx.cloud.database()
const _=db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateInfo:null,
    total:0,
    // [
    //   { date: "7月17日", day: "周三", value: "2019-7-17", to: "一天后", detail: [{ time: "13:00", remain: 25 }, { time: "15:00", remain: 25 }, { time: "16:00", remain: 25 }]},
    //   { date: "7月19日", day: "周五", value: "2019-7-17",  to: "三天后", detail: [{ time: "13:00", remain: 25 }, { time: "15:00", remain: 25 }, { time: "16:00", remain: 25 }]},
    //   { date: "7月21日", day: "周日", value: "2019-7-17",  to: "五天后", detail: [{ time: "13:00", remain: 25 }, { time: "15:00", remain: 25 }, { time: "16:00", remain: 25 }] },
    // ],
    cur:0,
    black:false,
    optList:null,
    username: '',
    phonenumber: '',
    bookedNumber: '',
    hiddenmodalput: true,
    hasUserInfo: false,
    applyNumber: 0,
    card:null,
    orderInfo:null,
    orderId:null,
    userDBId:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  submit:function(e){
    console.log(e.detail.formId)
  },
  onLoad: function (options) {
    this.setData({
      username: options.name,
      phonenumber: options.tele_number,
      black:options.black
    })
    if(options.black=="true"){
      wx.showModal({
        title: '',
        content: '由于您预约后未就诊，您已进入黑名单，无法网上预约脐疗，请到门诊处现场预约并解除黑名单',
        showCancel:false
      })
    }
    this.refresh(0)
    this.refreshOrder()
  },
  showBedInfo:function(e){
    var msg = this.data.userful[e.currentTarget.dataset.index].place
    if (msg == "") {
      msg = "请于当天9:30后查看床位信息"
    } else {
      msg = "就诊地点：" + msg
    }
    wx.showModal({
      title: '就诊地点',
      content: msg,
      showCancel: false
    })
  },
  refreshOrder:function(){
    db.collection("orderInfo").where({
      phone:this.data.phonenumber
    }).get()
    .then(res=>{
      if(res.data.length==0){
        return
      }
      var detail=res.data[0].detail
      var userful=new Array()
      var now=new Date()
      for(var i=0;i<detail.length;i++){
        var datelist=detail[i].date.split("-")
        var timelist=detail[i].time.split(":")
        var a=new Date(datelist[0],Number(datelist[1])-1,Number(datelist[2]),timelist[0],timelist[1])
        if(a>now){
          userful.push(detail[i])
        }
      }
      this.setData({
        orderInfo:detail,
        userful:userful,
        orderId:res.data[0]._id
      })
    })
  },
  deleteOrder:function(e){
    wx.showModal({
      title: '',
      content: '确认取消预约',
      success:res=>{
        if(res.confirm){
          wx.showLoading({
            title: '取消中',
          })
          var total=this.data.orderInfo
          var deleteName=e.currentTarget.dataset.name
          var deleteDate = e.currentTarget.dataset.date
          var now=new Date()
          now=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()
          if(now==deleteDate){
            wx.showToast({
              title: '预约当天不可取消',
              icon:"none"
            })
            return
          }
          var deleteTime=e.currentTarget.dataset.time
          var pushOrder=new Array()
          for(var i=0;i<total.length;i++){
            if(total[i].name==deleteName && total[i].date==deleteDate){
              continue
            }
            pushOrder.push(total[i])
          }
          db.collection("orderInfo").doc(this.data.orderId).update({
            data:{
              detail:pushOrder
            }
          }).then(res=>{
            var index=-1
            for(var i=0;i<this.data.dateInfo.length;i++){
              if(this.data.dateInfo[i].value==deleteDate){
                for(var j=0;j<this.data.dateInfo[i].detail.length;j++){
                  if (this.data.dateInfo[i].detail[j].time==deleteTime){
                    index=j
                    break
                  }
                }
              }
            }
            if(res.stats.updated==1){
              wx.cloud.callFunction({
                name: "bedsDec",
                data: {
                  date: deleteDate,
                  time: j,
                  operate: "add"
                }, 
                success:res=>{
                  wx.hideLoading()
                  if(res.result.status==0){
                    db.collection("userInfo").doc(this.data.userDBId).update({
                      data: {
                        available: _.inc(1),
                        total:_.inc(-1)
                      }
                    }).then(res=>{
                      if (res.stats.updated == 1) {
                        wx.showToast({
                          title: '取消成功',
                        })
                        this.refreshOrder()
                        this.refresh(1)
                      }
                    })
                  }else{
                    wx.showToast({
                      title: '发生未知错误',
                      icon:"none"
                    })
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  orderView:function(){
    this.setData({
      cur:0
    })
  },
  my:function(){
    this.setData({
      cur:1
    })
  },
  refresh:function(current){
    if(current==0){
      
      var dateInfo = new Array()
      var all = null
      var defaultSetting = null
      var day = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
      var to = ["今天", "一天后", "两天后", "三天后", "四天后", "五天后", "六天后", "七天后"]
      var today = null
      var optlist = new Array()
      db.collection("twoWeeks").limit(8).get()
        .then(res => {
          all = res.data
          db.collection("defaultSetting").get()
            .then(res => {
              defaultSetting = res.data

              for (var i = 0; i < all.length; i++) {
                var dat = all[i].date.split("-")
                if (i == 0) {
                  today = Number(dat[2])
                  continue
                }
                var date = new Date(dat[0], Number(dat[1]) - 1, dat[2])
                if (all[i].isChange == true) {
                  if (all[i].isVisit == true) {
                    var detail = new Array()
                    optlist[all[i].date] = all[i].clinicTime
                    for (var j = 0; j < all[i].clinicTime.length; j++) {
                      detail.push({
                        time: all[i].clinicTime[j],
                        remain: all[i].beds[j] - all[i].count[j]
                      })
                    }
                    dateInfo.push({
                      date: dat[1] + "月" + dat[2] + "日",
                      day: day[date.getDay()],
                      value: all[i].date,
                      to: to[Number(dat[2]) - today],
                      detail: detail
                    })
                  }
                } else {
                  if (defaultSetting[2].date.includes(date.getDay())) {
                    var detail = new Array()
                    optlist[all[i].date] = defaultSetting[1].clinicTime
                    for (var j = 0; j < defaultSetting[1].clinicTime.length; j++) {
                      detail.push({
                        time: defaultSetting[1].clinicTime[j],
                        remain: defaultSetting[0].beds[date.getDay()][j] - all[i].count[j]
                      })
                    }
                    dateInfo.push({
                      date: dat[1] + "月" + dat[2] + "日",
                      day: day[date.getDay()],
                      value: all[i].date,
                      to: to[Number(dat[2]) - today],
                      detail: detail
                    })
                  }

                }
              }
              this.setData({
                dateInfo: dateInfo,
                optList: optlist
              })
            })
        })
    }else if(current==1){
      db.collection("userInfo").where({
        phoneNumber: this.data.phonenumber,
      }).get()
        .then(res => {
          this.setData({
            bookedNumber: res.data[0].available,
            card:res.data[0].medicalCard,
            userDBId:res.data[0]._id,
            userGender:res.data[0].gender,
            total:res.data[0].total
          })
        })
    }
  },
  bindChange:function(e){
    this.setData({
      cur:e.detail.current
    })
    this.refresh(e.detail.current)
    if(e.detail.current==1){
      this.refreshOrder()
    }
  },
  apply_number_change: function (e) {
    this.setData({
      applyNumber:e.detail.value
    })
  }
  ,
  manage_familly: function () {

    wx.navigateTo({
      url: '../familly/familly?phone='+this.data.phonenumber,
    })
  }
  ,
  apply_number: function () {
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },
  //取消按钮 
  cancel: function () {
    this.setData({
      hiddenmodalput: true
    });
  },
  //确认 
  confirm: function () {
    
    if(this.data.applyNumber==0){
      wx.showToast({
        title: '请输入申请预约的次数',
        icon:"none",
        duration:2000,
      })
      return
    }
    db.collection("orderNumber").where({
      phone:this.data.phonenumber
    }).count()
    .then(res=>{
      if(res.total==0){
        db.collection("orderNumber").add({
          data:{
            agree:false,
            apply:this.data.applyNumber,
            card:this.data.card,
            name:this.data.username,
            phone:this.data.phonenumber,
            gender:this.data.userGender
          }
        }).then(res=>{
          if (res.errMsg == "collection.add:ok"){
            wx.showToast({
              title: '等待管理员审核',
              duration:2500,
            })
          }
        })
      }else{
        wx.showToast({
          title: '已有一个申请，请等待管理员审核',
          icon:"none",
          duration:3000
        })
      }
    })
    this.setData({
      hiddenmodalput: true
    })
    
  },
  onOrderTap:function(e){
    if(!e.currentTarget.dataset.click){
      return
    }
    var opt = this.data.optList[e.currentTarget.dataset.date].indexOf(e.currentTarget.dataset.time)
    wx.navigateTo({
      url: '../two/two?date=' + e.currentTarget.dataset.date + "&time=" + e.currentTarget.dataset.time+"&phoneNumber="+this.data.phonenumber+"&opt="+opt+"&black="+this.data.black,
    })
  }
})