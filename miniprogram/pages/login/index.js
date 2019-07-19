const app = getApp()
wx.cloud.init()
const db=wx.cloud.database()
Page({
  data: {
    tele_number:"",
    name:"",
    focus:false,
    isSave:true,
    tips:"",
  },
  onLoad:function(e){
    var hasRead = wx.getStorageSync("hasRead")
    if(!hasRead){
      wx.redirectTo({
        url: '../agreement/index',
      })
    }
    var focus=false
    var tele_number=wx.getStorageSync("tele_number")
    var name=wx.getStorageSync("name")
    if(tele_number==""){
      focus=true
    }
    this.setData({
      focus:focus,
      tele_number:tele_number,
      name:name
    })
  },

  onChange:function(e){
    var isSave
    if (e.detail.value.length > 0) {
      if (e.detail.value[0] == "accept") {
        isSave=true
      }
    } else {
      isSave=false
    }
    this.setData({
      isSave: isSave
    })
  },

  onTeleNumberInput:function(e){
    this.setData({
      tele_number:e.detail.value
    })
  },
  onNameInput:function(e){
    this.setData({
      name:e.detail.value
    })
  },
  enter:function()
 {
   if(this.data.name==""){
     wx.showToast({
       title: '请输入姓名',
       icon:"none"
     })
     return
   }else if(this.data.tele_number==""){
     wx.showToast({
       title: '请输入电话号码',
       icon:"none"
     })
     return
   }else{
     this.setData({
       tips:""
     })
   }
   wx.showLoading({
     title: '登录中',
   })
    if (this.data.name == "root") {
      db.collection("defaultSetting").where({
        type: "rootPwd"
      }).get()
        .then(res => {
          if (res.data[0].rootPwd == this.data.tele_number) {
            wx.setStorageSync("tele_number", this.data.tele_number)
            wx.setStorageSync("name", this.data.name)
            wx.hideLoading()
            wx.navigateTo({
              url: '../administrator/index?isroot=1',
            })
          } else {
            wx.hideLoading()
            wx.showToast({
              title: '管理员密码错误',
              icon: "none",
              duration: 2500
            })
          }
        })
        return
    }

   db.collection("userInfo").where({
     phoneNumber:this.data.tele_number
   }).get()
   .then((res)=>{
     if(res.data.length==0){
       wx.hideLoading()
       wx.showToast({
         title: '电话号码不存在，请检查电话号码或申请病号',
         duration:3000,
         icon:"none"
       })
       return
     }else if(res.data[0].name!=this.data.name){
       wx.hideLoading()
       wx.showToast({
         title: '姓名错误，请检查后重试',
         duration:3000,
         icon:"none"
       })
       return
     }
     
     wx.setStorageSync("tele_number", this.data.tele_number)
     wx.setStorageSync("name", this.data.name)
     
     if (res.data[0].isAdmin == true) {
       wx.hideLoading()
       wx.navigateTo({
         url: '../administrator/index?isroot=0',
       })
     }else{
       wx.hideLoading()
       wx.redirectTo({
         url: '../mainPage/index?name='+this.data.name+'&tele_number='+this.data.tele_number,
       })
     }
   })

 },
  apply:function(){
    wx.navigateTo({
      url: '../register/index',
    })
  },

})
