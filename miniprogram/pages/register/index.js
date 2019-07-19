const app = getApp()
wx.cloud.init()
const db=wx.cloud.database()
/*

*/ 
Page({
  data: {
    array:['男','女'],
    name:null,
    phone:null,
    card:null,
    gender:"男",
  },
  //性别选择
  radioChange(e)
 {
   var gender=e.detail.value
   if(gender=="girl"){
     gender="女"
   }else{
     gender="男"
   }
   this.setData({
     gender:gender
   })
 },
 //申请
  namechang(e) {
    this.setData({
      name:e.detail.value
    })
  },
  numberchange(e) {
    this.setData({
      phone:e.detail.value
    })
  },
  cardchang(e) {
    this.setData({
      card:e.detail.value
    })
  },
  verify(e) {
    if(this.data.name==null || this.data.phone==null || this.data.card==null){
      wx.showToast({
        title: '注册信息未填写完整',
        icon:"none",
        duration:2000,
      })
      return
    }
    wx.showLoading({
      title: '请稍后',
    })
    db.collection("userInfo").where({
      phoneNumber:this.data.phone
    }).count()
    .then(res=>{
      if(res.total>0){
        wx.showToast({
          title: '该手机号已注册',
          icon:"none",
          duration:2000,
        })
      }else{
        db.collection("userInfo").add({
          data:{
            available:0,
            gender:this.data.gender,
            isAdmin:false,
            medicalCard:this.data.card,
            name:this.data.name,
            phoneNumber:this.data.phone,
            relatives:[{name:this.data.name,relation:"me"}]
          }
        })
        .then(res=>{
          if (res.errMsg =='collection.add:ok'){
            wx.hideLoading()
            wx.showToast({
              title: '注册成功',
            })
            setTimeout(function(){
              wx.navigateBack({
              })
            },2000)
            
          }
        }).catch(reason=>{
          console.log(reason)
          wx.showToast({
            title: '注册失败，请稍后再试',
          })
        })
      }
    }).catch(reason=>{
      console.log(reason)
      wx.hideLoading()
      wx.showToast({
        title: '未知错误，请稍后尝试',
        icon: "none",
        duration: 2000,
      })
    })
  },

})
