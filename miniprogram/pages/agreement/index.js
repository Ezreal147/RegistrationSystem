Page({
  data: {
    isRead:false
  },
  onLoad:function(e){
  },
  enter:function(){
    if(this.data.isRead){
      wx.redirectTo({
        url: '../login/index',
      })
      wx.setStorageSync("hasRead", true)
    }
  },
  onChange:function(e){
    var isRead
    if (e.detail.value.length > 0) {
      if (e.detail.value[0] == "accept") {
        isRead = true
      }
    } else {
      isRead = false
    }
    this.setData({
      isRead: isRead
    })
  }
})