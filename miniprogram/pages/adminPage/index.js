// miniprogram/pages/three/three.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Canclick:null,
    timeclick:null,
    click:0,
    open:false,
    menuOn:false,
    page:0,
    timelist:null,
    adminArray:null,
    datelist:null,
    addAdmin:{
      name:null,
      user:null
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideLoading()
    this.setData({
      timelist: [options.t0,options.t1, options.t2],
      datelist:app.globalData.datelist,
      clocklist:app.globalData.timelist,
    })
    var today=new Date()
    var Canclick=new Array()
    for(var i=0;i<8;i++){
      if(today.getDay()==3||today.getDay()==5||today.getDay()==0){
        Canclick[i]=true
      }else{
        Canclick[i]=false
      }
      today.setDate(today.getDate()+1)
    }
    this.setData({
      Canclick:Canclick
    })
    for(i=0;i<8;i++){
      if(Canclick[i]==true){
        this.setData({
          click:i
        })
        this.handletap(this.data.click)
        return
      }
    }
    
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
  onItemTap0:function(){
    this.handleItemTap(0)
  },
  onItemTap1: function () {
    this.handleItemTap(1)
  },
  onItemTap2: function () {
    this.handleItemTap(2)
  },
  onItemTap3: function () {
    this.handleItemTap(3)
  },
  onNameInput:function(e){
    this.setData({
      'addAdmin.name':e.detail.value
    })
  },
  onIdInput: function (e) {
    this.setData({
      'addAdmin.user': e.detail.value
    })
  },
  onT0Input:function(e){
    this.setData({
      'timelist[0]':e.detail.value
    })
  },
  onT1Input: function (e) {
    this.setData({
      'timelist[1]': e.detail.value
    })
  },
  onT2Input: function (e) {
    this.setData({
      'timelist[2]': e.detail.value
    })
  },
  ondaytap0: function () {
    this.handletap(0)
  },
  ondaytap1: function () {
    this.handletap(1)
  },
  ondaytap2: function () {
    this.handletap(2)
  },
  ondaytap3: function () {
    this.handletap(3)
  },
  ondaytap4: function () {
    this.handletap(4)
  },
  ondaytap5: function () {
    this.handletap(5)
  },
  ondaytap6: function () {
    this.handletap(6)
  },
  ondaytap7: function () {
    this.handletap(7)
  },

  onTimeTap0: function () {
    this.handleClockTap(0)
  },
  onTimeTap1:function(){
    this.handleClockTap(1)
  },
  onTimeTap2: function () {
    this.handleClockTap(2)
  },

  handleClockTap:function(e){
    this.setData({
      timeclick:e
    })
  },
  handleItemTap:function(e){
    this.setData({
      page:e,
      open:false
    })
    if(e==2){
      wx.showLoading({
        title: '查询中',
      })
      wx.cloud.callFunction({
        name:"getAllAdmin",
        data:{},
        success:res=>{
          var adminArray=res.result.data
          this.setData({
            adminArray:adminArray
          })
          wx.hideLoading()
        }
      })
    }
  },
  onMenuTap:function(){
    if(this.data.open){
      this.setData({
        open: false
      })
    }else{
      this.setData({
        open:true
      })
    }
  },

  onAddTap:function(){
    if(this.data.addAdmin.name==null || this.data.addAdmin.user==null){
      wx.showToast({
        title: '请输入信息',
        icon:"none",
        duration:2000,
      })
      return
    }

    wx.showLoading({
      title: '添加中',
    })

    wx.cloud.callFunction({
      name:"addAdmin",
      data:{
        name:this.data.addAdmin.name,
        user:this.data.addAdmin.user
      },
      success:res=>{
        wx.hideLoading()
        if(res.result.status==0){
          wx.showToast({
            title: '添加成功',
            duration:2000,
          })
        }else{
          wx.showToast({
            title: res.result.msg,
            icon:"none",
            duration:2000,
          })
        }
        
      }
    })
  },

  onChangeTap:function(){
    wx.showLoading({
      title: '提交修改中',
    })
    wx.cloud.callFunction({
      name:"changeTime",
      data:{
        t0:this.data.timelist[0],
        t1: this.data.timelist[1],
        t2: this.data.timelist[2],
      },
      success:res=>{
        if(res.result.status==0){
          wx.hideLoading()
          wx.showToast({
            title: '修改成功',
            duration:2000,
          })
        }else{
          wx.hideLoading()
          wx.showToast({
            title: res.result.msg,
            icon:"none",
            duration:2000,
          })
        }
      }
    })
  },
  onDeleteAdmin:function(event){
    wx.showModal({
      title: '',
      content: '确认删除',
      success:(res)=>{
        if(res.confirm){
          var user = this.data.adminArray[event.currentTarget.dataset.id].user
          wx.showLoading({
            title: '删除中',
          })
          wx.cloud.callFunction({
            name: "deleteAdmin",
            data: {
              user: user
            },
            success: res => {
              wx.cloud.callFunction({
                name: "getAllAdmin",
                data: {},
                success: res => {
                  var adminArray = res.result.data
                  this.setData({
                    adminArray: adminArray
                  })
                  wx.hideLoading()
                }
              })
              wx.hideLoading()
              wx.showToast({
                title: '删除成功',
                duration: 2000,
              })
            }
          })
        }
      }
    })
    
  },
  handletap:function(e){
    if(this.data.Canclick[e]==false){
      return
    }
    this.setData({
      click:e
    })
    var today=new Date()
    today.setDate(today.getDate()+e)
    wx.showLoading({
      title: '查询中',
    })
    wx.cloud.callFunction({
      name: "getAllOrder",
      data:{
        timestamp:new Date(today.getFullYear(),today.getMonth(),today.getDate()).getTime()
      },
      success:res=>{
        wx.hideLoading()
        this.setData({
          patients:res.result
        })
      }
    }
    )
  },
})