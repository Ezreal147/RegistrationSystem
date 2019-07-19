const db=wx.cloud.database()
const _=db.command
Page({

  data: {
    //可以通过hidden是否掩藏弹出框的属性，来指定那个弹出框 
    hiddenmodalput: true,
    phone:null,
    addName:"",
    addRelation:"",
    famillyMembers: [
    ]

  },
  onLoad:function(options){
    this.setData({
      phone:options.phone
    })
    this.refreshMembers()
  },
  refreshMembers:function(){
    db.collection("userInfo").where({
      phoneNumber: this.data.phone
    }).get()
      .then(res => {
        var relatives = res.data[0].relatives
        var members = new Array()
        if (relatives.length > 1) {
          for (var i = 0; i < relatives.length; i++) {
            if (relatives[i].relation == "me") {
              continue
            }
            members.push({
              name: relatives[i].name,
              relation: relatives[i].relation
            })
          }
        }
        this.setData({
          famillyMembers: members
        })
      })
  },
  addMember: function () {
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
  //确认.上传并跟新本地 
  confirm: function () {
    
    if(this.data.addName==""||this.data.addRelation==""){
      wx.showToast({
        title: '请输入完整信息',
        icon:"none",
        duration:2000,
      })
      return
    }
    var userId=null
    db.collection("userInfo").where({
      phoneNumber:this.data.phone
    }).get()
    .then(res=>{
      var relatives=res.data[0].relatives
      var userId=res.data[0]._id
      for(var i=0;i<relatives.length;i++){
        if(relatives[i].name==this.data.addName){
          wx.showToast({
            title: '该成员已存在',
            icon:"none",
            duration:2000,
          })
          return
        }
      }
      wx.showLoading({
        title: '添加中',
      })
      db.collection("userInfo").doc(userId).update({
        data:{
          relatives:_.push({
            name:this.data.addName,
            relation:this.data.addRelation
          })
        }
      })
      .then(res=>{
        wx.hideLoading()
        if(res.stats.updated==1){
          wx.showToast({
            title: '添加成功',
          })
          this.refreshMembers()
        }else{
          wx.showToast({
            title: '发生未知错误',
            icon:"none",
            duration:2000,
          })
        }
      })
    })
    this.setData({
      hiddenmodalput: true
    })
  }
  ,
  //删除家庭成员
  delete_familly:function(e)
  {
    console.log(e.currentTarget.dataset.index);
    wx.showModal({
      title: '',
      content: '确认删除成员',
      success:res=>{
        
        if(res.confirm){
          wx.showLoading({
            title: '删除中',
          })
          db.collection("userInfo").where({
            phoneNumber:this.data.phone
          }).get()
          .then(res=>{
            var userId = res.data[0]._id
            var userName=res.data[0].name
            var newMembers = new Array()
            var target = e.currentTarget.dataset.index
            newMembers.push({
              name:userName,
              relation:"me"
            })
            for (var i = 0; i < this.data.famillyMembers.length; i++) {
              if (this.data.famillyMembers[i].name == target) {
                continue
              }
              newMembers.push(this.data.famillyMembers[i])
            }
            db.collection("userInfo").doc(userId).update({
              data:{
                relatives:newMembers
              }
            }).then(res=>{
              wx.hideLoading()
              if(res.stats.updated==1){
                wx.showToast({
                  title: '删除成功',
                })
                this.refreshMembers()
              }else{
                wx.showToast({
                  title: '发生未知错误',
                  icon:"none",
                })
              }
            })
          })
        }
      }
    })

  },
  onNameInput:function(e){
    this.setData({
      addName:e.detail.value
    })
  },
  onRelationInput:function(e){
    this.setData({
      addRelation:e.detail.value
    })
  }
})