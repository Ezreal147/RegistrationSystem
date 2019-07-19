// miniprogram/pages/one/one.js
const app = getApp()
wx.cloud.init()
const db=wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:null,
    tele_number:null,
    isAdmin:false,//是否为管理员
    open: false,//右侧菜单的开关
    click:true,//所有按钮是否可点击
    menuon:false,//菜单开关状态
    opt:0,//当前按下的按钮
    time:null,//每个按钮的日期,为Array,{day:日期,weekday:周几}
    timelist:[//预约时间按钮属性
      { uniquekey: '0', remain: null, time: null},
      { uniquekey: '1', remain: null, time: null },
      { uniquekey: '2', remain: null, time: null},
    ],
    buttonAttr: [//日期按钮属性,color为点击后圆圈颜色，textcolord为下面数字日期颜色，textcoloru为上面周几字体颜色，click为每个按钮是否可点击
      { uniquekey: "day0", color: "white", textcolord: "gainsboro", textcoloru: "gainsboro", click: false  },
      { uniquekey: "day1", color: "white", textcolord: "gainsboro", textcoloru: "gainsboro", click: false },
      { uniquekey: "day2", color: "white", textcolord: "gainsboro", textcoloru: "gainsboro", click: false},
      { uniquekey: "day3", color: "white", textcolord: "gainsboro", textcoloru: "gainsboro", click:false },
      { uniquekey: "day4", color: "white", textcolord: "gainsboro", textcoloru: "gainsboro", click:false },
      { uniquekey: "day5", color: "white", textcolord: "gainsboro", textcoloru: "gainsboro", click:false },
      { uniquekey: "day6", color: "white", textcolord: "gainsboro", textcoloru: "gainsboro", click:false },
      { uniquekey: "daY7", color: "white", textcolord: "gainsboro", textcoloru: "gainsboro", click:false  },],
    subdate:null,
    showdate:null,
    subtime:null,
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideLoading()
    this.setData({
      name:options.name,
      tele_number:options.tele_number
    })
    this.onpagetap()  //每次加载首页时先关闭右侧菜单
    var week= ["日", "一", "二", "三", "四", "五", "六"];
    var today = new Date();
    var time = new Array();
    for (var i = 0; i < 8; i++) {//初始化日期
      var a = new Date();
      a.setDate(a.getDate() + i);
      time[i] = { day: a.getDate(), weekday: week[a.getDay()] };
      if(a.getDay()==3 || a.getDay()==5 || a.getDay()==0){
        var key1 = 'buttonAttr[' + i +'].textcolord'
        var key2 = 'buttonAttr[' + i + '].textcoloru'
        var key3 = 'buttonAttr[' + i + '].click'
        this.setData({
          [key1]:"black",
          [key2]: "black",
          [key3]:true
        });
      }
    }
    this.setData({
      time: time,
    })
    wx.cloud.callFunction({
      name: "checkAdmin",
      data: {},
      success: res => {
        if(res.result==true){
          this.setData({
            isAdmin: true
          })
        }else{
          this.setData({
            isAdmin:false
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
    this.onpagetap()//关闭菜单
    var a=["13:00","15:00","16:30"]//暂时为定值，应改为从云端获取!!!
    var now=new Date()
    wx.cloud.callFunction({//调用云函数查询可用预约
      name: "checkBook",
      data: {
        now:new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime()
      },
      success: res => {
        if (res.result.length > 0) {
          var day = new Date(Number(res.result[0].timestamp))
          res.result[0].day = day.getFullYear() + "年" + (day.getMonth()+1) + "月" + day.getDate() + "日"
          res.result[0].time=a[res.result[0].time]
          this.setData({
            order: true,
            orderDetail: res.result[0]
          })
        } else {
          this.setData({
            order: false
          })
        }
      },
      fail: error => {
        wx.showToast({
          title: '查询预约失败，请检查网络',
          icon: "none",
          duration: 2500
        })
      }
    })
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
  gotoBackgroud:function(){
    wx.showLoading({
      title: '加载中',
    })
    wx.navigateTo({
      url: '../three/three?t0=' + this.data.timelist[0].time + '&t1=' + this.data.timelist[1].time + '&t2=' + this.data.timelist[2].time ,
    })
  },

  onCancel: function () {
    wx.showModal({
      title: '',
      content: '确认取消',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '取消中',
          })
          var now = new Date()
          wx.cloud.callFunction({
            name: "deleteOrder",
            data: {
              now: new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
            },
            success: res => {
              if (res.result.status == 0) {
                var now = new Date()
                wx.cloud.callFunction({
                  name: "checkBook",
                  data: {
                    now: new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
                  },
                  success: res => {
                    if (res.result.length > 0) {
                      var day = new Date(Number(res.result[0].timestamp))
                      res.result[0].day = day.getFullYear() + "年" + (day.getMonth() + 1) + "月" + day.getDate() + "日"
                      res.result[0].time = a[res.result[0].time]
                      this.setData({
                        order: true,
                        orderDetail: res.result[0]
                      })
                    } else {
                      this.setData({
                        order: false
                      })
                    }
                  },
                  fail: error => {
                    wx.showToast({
                      title: '查询预约失败，请检查网络',
                      icon: "none",
                      duration: 2500
                    })
                  }
                })
                wx.hideLoading()
                wx.showToast({
                  title: '取消成功',
                  duration: 2500,
                })
              } else {
                wx.hideLoading()
                wx.showToast({
                  title: '取消失败',
                  icon: "none",
                  duration: 2500,
                })
              }
            },
            fail: err => {
              wx.hideLoading()
              wx.showToast({
                title: '取消失败',
                icon: "none",
                duration: 2500,
              })
            }
          })
          setTimeout(function () {
            wx.hideLoading()
          }, 2000)
        } else {
          return
        }
      }
    })
  },


  onpagetap: function () {
    if (this.data.menuon) {
      var key1 = 'buttonAttr[' + this.data.opt + '].color';
      var key2 = 'buttonAttr[' + this.data.opt + '].textcolord';
      var key3 = 'buttonAttr[' + this.data.opt + '].textcoloru';
      if (this.data.opt != null) {
        this.setData({
          open: false,
          click: true,
          menuon: false,
          [key1]: "white",
          [key2]: "black",
          [key3]: "black"
        });
      }
    } else {
      return
    }
  },


  /* 查询日期点击响应函数 */
  handletap:function(e){
    if(!this.data.click){
      return
    }
    if(!this.data.buttonAttr[e].click){
      return
    }
    var key1 = 'buttonAttr[' + e + '].color';
    var key2 = 'buttonAttr[' + e + '].textcolord';
    var key3 = 'buttonAttr[' + e + '].textcoloru';
    this.setData({
      [key1]: "rgb(255, 153, 0)",
      [key2]: "white",
      [key3]: "rgb(255, 153, 0)",
      click: false
    })
    wx.showLoading({
      title: '查询中',
    })
    var today = new Date()
    today.setDate(today.getDate() + e)
    var strDate=today.getFullYear()+"-"+(today.getMonth()+1)+'-'+today.getDate()
    var showDate = today.getFullYear() + "年" + (today.getMonth() + 1) + '月' + today.getDate()+'日'
    db.collection("twoWeeks").where({
      date:strDate
    }).get()
    .then(res=>{
      var remain=new Array()
      var time=new Array()
      for(var i=0;i<3;i++){
        remain[i] = res.data[0].beds[i] - res.data[0].count[i]
        time[i]=res.data[0].clinicTime[i]
      }
      this.setData({
        opt: e,
        open: true,
        'timelist[0].remain': remain[0],
        'timelist[1].remain': remain[1],
        'timelist[2].remain': remain[2],
        "timelist[0].time": time[0],
        "timelist[1].time": time[1],
        "timelist[2].time": time[2],
        subdate: strDate,
        subtime:time,
        showDate: showDate
      });
      wx.hideLoading()
    })
    var context=this;

    setTimeout(function () {
      context.setData({
        menuon: true,
      });
    }, 500);
  },

  /*  菜单页点击响应函数，点击跳转到确认预约界面 */
  handletimetap: function (e) {
    if (this.data.timelist[e].remain < 1) {
      return
    }
    wx.showLoading({
      title: '加载中',
    })

    wx.navigateTo({
      url: '../two/two?date=' + this.data.subdate+'&opt=' + e+'&strtime='+this.data.subtime[e]+'&tele_number='+this.data.tele_number,
    })
  },

  /*********3个时间段的点击响应，集中处理*************/
  ontimetap0: function () {
    this.handletimetap(0);
  },
  ontimetap1: function () {
    this.handletimetap(1)
  },
  ontimetap2: function () {
    this.handletimetap(2)
  },
  /**********************************************/

  
/*************八个日期的点击处理******************************/
  ondaytap0: function(){
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
  /*****************************/

  
})