// miniprogram/pages/two/two.js
wx.cloud.init()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formID:"",
    userDBId:null,
    available: null,
    clinicTime: null,
    clinicDate: null,
    relatives: null,
    showname:null,
    clinicPlace: "",
    patient: "",
    phoneNumber: "",
    strdate: null,
    opt:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  submit:function(e){
    this.setData({
      formID:e.detail.formId
    })
  },
  onLoad: function(options) {
    if(options.black=="true"){
      wx.showModal({
        title: '',
        content: '您已进入黑名单，无法预约！请到门诊处解除',
        showCancel:false,
        success:res=>{
          if(res.confirm){
            wx.navigateBack({
              delta: 1,
            })
          }
        }
      })
    }
    var d = options.date.split('-')
    db.collection("defaultSetting").where({
      type:"place",
    }).get()
    .then(res=>{
      this.setData({
        phoneNumber: options.phoneNumber,
        strdate: options.date,
        clinicDate: d[0] + "年" + d[1] + "月" + d[2] + "日",
        clinicTime: options.time,
        clinicPlace: res.data[0].place,
        opt: options.opt
      })
    })
    
    db.collection("userInfo").where({
        phoneNumber: options.phoneNumber
      }).get()
      .then(res => {
        var showname=new Array()
        for(var i=0;i<res.data[0].relatives.length;i++){
          showname.push(res.data[0].relatives[i].name)
        }
        this.setData({
          available: res.data[0].available,
          relatives: res.data[0].relatives,
          showname:showname,
          patient: res.data[0].relatives[0].name,
          userDBId:res.data[0]._id
        })
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.hideLoading()

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
  onShareAppMessage: function() {

  },

  bindPickerChange: function(e) {
    this.setData({
      patient: this.data.relatives[e.detail.value].name
    })
  },

  onSure: function() {

    wx.showLoading({
      title: '预约中',
    })
    if (Number(this.data.available) == 0) {
      wx.hideLoading()
      wx.showToast({
        title: '可预约次数不足，请到门诊购买',
        icon: "none",
        duration: 4000,
      })
      return
    }
    var now=new Date()
    var ll=this.data.strdate.split("-")
    var mm=this.data.clinicTime.split(":")
    var a=new Date(ll[0],Number(ll[1])-1,ll[2],mm[0],mm[1])
    if(now>a){
      wx.hideLoading()
      wx.showToast({
        title: '当前时段已过期，不可预约',
        icon:"none",
        duration:2000
      })
      return
    }
    var query_id = null
    var that = this
    db.collection("orderInfo").where({
        phone: this.data.phoneNumber
      }).get()
      .then(res => {
        if(res.data.length==0){
          db.collection("orderInfo").add({
            data:{
              phone:this.data.phoneNumber,
              detail:[{
                date:this.data.strdate,
                name:this.data.patient,
                time:this.data.clinicTime,
                place:""
              }]
            }
          }).then(res=>{
            wx.hideLoading()
            if (res.errMsg == "collection.add:ok"){
              wx.showToast({
                title: '预约成功',
                duration:2000,
                complete: function () {
                  var time=this.data.clinicTime
                  setTimeout(function(){
                    console.log(that.data.formID)
                    wx.cloud.callFunction({
                      name: "sendMsg",
                      data: {
                        formID: that.data.formID,
                        phone: that.data.phoneNumber,
                        name: that.data.patient,
                        time: that.data.clinicDate + " " + that.data.clinicTime,
                        place: that.data.clinicPlace,
                      }
                    })
                    wx.navigateBack({
                      delta: 1,
                    })
                  },2000)

                  
                }
              })
              
            }else{
              wx.showToast({
                title: '发生未知错误，预约失败',
                icon:"none",
                duration:2000,
              })
            }
          })
        }else{
          var that = this
          query_id=res.data[0]._id
          var now=new Date()
          var detail=res.data[0].detail
          var hasorder=false
          for(var i=0;i<detail.length;i++){
            if(detail[i].name==this.data.patient){
              var datelist = detail[i].date.split("-")
              var timelist = detail[i].time.split(":")
              var target=new Date(datelist[0],Number(datelist[1])-1,datelist[2],timelist[0],timelist[1])
              if(target>now){
                hasorder=true
              }
            }
          }
          if(!hasorder){
            db.collection("orderInfo").doc(query_id).update({
              data:{
                detail:_.push({
                  date: this.data.strdate,
                  name: this.data.patient,
                  time: this.data.clinicTime,
                  place:""
                })
              }
            }).then(res=>{
              
              if(res.stats.updated==1){
                db.collection("userInfo").doc(this.data.userDBId).update({
                  data: {
                    available: _.inc(-1),
                    total:_.inc(1)
                  }
                }).then(res => {
                  wx.cloud.callFunction({
                    name: "bedsDec",
                    data: {
                      date: this.data.strdate,
                      time: Number(this.data.opt),
                      operate:"dec"
                    }, 
                    success:res=>{
                      wx.hideLoading()
                      if(res.result.status==0){
                        
                        wx.showToast({
                          title: '预约成功',
                          duration: 2000,
                          complete: function () {
                            
                            setTimeout(function () {
                              console.log(that.data.formID)
                              wx.cloud.callFunction({
                                name: "sendMsg",
                                data: {
                                  formID: that.data.formID,
                                  phone: that.data.phoneNumber,
                                  name: that.data.patient,
                                  time: that.data.clinicDate + " " + that.data.clinicTime,
                                  place: that.data.clinicPlace,
                                }
                              })
                              wx.navigateBack({
                                delta: 1,
                              })
                            }, 2000)
                          }
                        })
                        
                      }
                      else{
                        wx.showToast({
                          title: res.result.msg,
                          icon:"none",
                          duration:2000
                        })
                      }
                    }
                  })
                })


                
              }else{
                wx.showToast({
                  title: '发生未知错误，预约失败',
                  icon: "none",
                  duration: 2000,
                })
              }
            })
          }else{
            wx.hideLoading()
            wx.showToast({
              title: '该病人已有预约',
              icon:"none",
              duration:2000
            })
          }
        }
      }).catch(reason=>{
        console.log(reason)
        wx.hideLoading()
        wx.showToast({
          title: '获取用户信息失败，请稍后重试',
          icon:"none",
          duration:2500
        })
      })
  },
  onpatientInput: function(e) {
    this.setData({
      patient: e.detail.value,
    })
  },
  onphoneInput: function(e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },
})