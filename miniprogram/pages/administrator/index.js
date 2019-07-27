const mydate = new Date()
const db=wx.cloud.database()
Page({
  data: {
    zixun:"",
    stopOpt:null,
    pwd0:"",
    showStopTime:null,
    pwd1:"",
    changeRootHidden:true,
    searchUserInfo:null,
    bookName:"",
    bookPhone:"",
    searchUserHidden:true,
    modifyPageHidden:true,
    clinicPlace:"某某科室",
    allOrder:null,
    orderData:null,
    searchDate: (mydate.getFullYear() + "-" + (mydate.getMonth() + 1) + "-" + mydate.getDate()),
    stopDate: (mydate.getFullYear() + "-" + (mydate.getMonth() + 1) + "-" + mydate.getDate()),
    stopTime:null,
    startDate: mydate,
    isroot:false,
    allAplly:null,
    isVisit:null,
    selectedDate: (mydate.getFullYear()+"-"+(mydate.getMonth()+1)+"-"+mydate.getDate()),
    startDate:mydate,
    Default_time1: '',
    Default_time2: '',
    Default_time3: '',
    defaultBeds:null,
    specificBeds:null,
    endDate:new Date(mydate.getFullYear(),mydate.getMonth(),mydate.getDate()),
    time1: '',
    time2: '',
    time3: '',
    defaultDate: ['Monday', 'Tuesday']
    ,
    showingPerson: ""
    ,
    book_hiddenmodalput: true,
    manager_hiddenmodalput: true
    ,
    items: [
      { name: 0, value: '周日', checked: false },
      { name: 1, value: '周一', checked: false },
      { name: 2, value: '周二', checked: false },
      { name: 3, value: '周三', checked: false},
      { name: 4, value: '周四', checked: false},
      { name: 5, value: '周五', checked: false},
      { name: 6, value: '周六', checked: false}  
    ],
    level: [{
        cate_id: 0,
        cate_name: "申请处理",
      },
      {
        cate_id: 1,
        cate_name: "预约记录",
      },
      {
        cate_id: 2,
        cate_name: "时间操作",
      }, 
      {
        cate_id:3,
        cate_name:"管理员操作"
      },
      {
        cate_id:4,
        cate_name:"排床管理"
      },
      {
        cate_id:5,
        cate_name:"黑名单列表"
      },
      {
        cate_id:6,
        cate_name:"临时停诊"
      }
    ],
    application_users:null,
    managerMembers: null,
    manageName:"",
    managePhone:"",
    cur: 0, //当前选中的cate_id
    index: 0,
    bed_hiddenmodalput: true,
    temp_room_name: '',
    temp_room_number: '',
    beds: [{ name: "", number: 10, open: true },
    { name: "", number: 10, open: true },
    { name: "", number: 10, open: true },
    { name: 1, number: 10, open: true }
    ],
    blackList:null,
  },
  exportExcel:function(){
    wx.showLoading({
      title: '生成链接中',
    })
    wx.cloud.callFunction({
      name:"export",
      data:{

      },
      success:res=>{
        var fileID=res.result.fileID
        wx.cloud.getTempFileURL({
          fileList:[fileID],
          success:res=>{
            wx.hideLoading()
            var tempFilePath=res.fileList[0].tempFileURL
            wx.showModal({
              title: '导出EXCEL',
              content: "按确定复制链接"+tempFilePath,
              showCancel:false,
              success:res=>{
                if(res.confirm){
                  wx.setClipboardData({
                    data: tempFilePath,
                    success:res=>{
                      wx.showToast({
                        title: '复制成功',
                      })
                    }
                  })
                }
              }
            })
          }
        })
      }
    })
  },
  changeRoot:function(e){
    this.setData({
      changeRootHidden:false
    })
  },
  changePwdCancel:function(){
    this.setData({
      changeRootHidden:true
    })
  },
  pwdInput0:function(e){
    this.setData({
      pwd0:e.detail.value
    })
  },
  pwdInput1:function(e){
    this.setData({
      pwd1:e.detail.value
    })
  },
  changePwdConfirm:function(){
    if(this.data.pwd0=="" || this.data.pwd1==""){
      wx.showToast({
        title: '请输入信息',
        icon:'none'
      })
      return
    }
    if(this.data.pwd0!=this.data.pwd1){
      wx.showToast({
        title: '两次输入密码不同',
        icon:"none"
      })
      return
    }
    wx.cloud.callFunction({
      name:"adminOperate",
      data:{
        operation:"Admin",
        value:{
          opt: "RootPwd",
          pwd: this.data.pwd0
        }
        
      },
      success:res=>{
        if (res.result.status == 0) {
          wx.showToast({
            title: '修改成功',
          })
          this.setData({
            changeRootHidden:true
          })
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: "none"
          })
        }
      }
    })
  },
  addBlack:function(e){
    var phone=e.currentTarget.dataset.phone
    var name=e.currentTarget.dataset.name
    wx.showModal({
      title: '',
      content: '确认添加黑名单',
      success:res=>{
        if(res.confirm){
          wx.cloud.callFunction({
            name:"adminOperate",
            data:{
              operation:"Black",
              value:{
                opt:"add",
                phone:phone,
                name:name
              },
            },
              success:res=>{
                if(res.result.status==0){
                  wx.showToast({
                    title: '添加成功',
                  })
                }else{
                  wx.showToast({
                    title: res.result.msg,
                    icon:"none"
                  })
                }
              }
          })
        }
      }
    })
  },
  clinicPlaceInput:function(e){
    this.setData({
      clinicPlace:e.detail.value
    })
  },

  manageName:function(e){
    this.setData({
      manageName:e.detail.value
    })

  },
  managePhone:function(e){
    this.setData({
      managePhone:e.detail.value
    })
  },
  changeNumber:function(e){
    this.setData({
      'showingPerson.apply':e.detail.value
    })
  },
  checkboxChange: function (e) {
    this.setData({
      defaultDate: e.detail.value
    })
  },
  specificBedsInput0:function(e){
    this.setData({
      'specificBeds[0]':Number(e.detail.value)
    })
  },
  specificBedsInput1: function (e) {
    this.setData({
      'specificBeds[1]': Number(e.detail.value)
    })
  },
  specificBedsInput2: function (e) {
    this.setData({
      'specificBeds[2]': Number(e.detail.value)
    })

  },
  checkDetail:function(e){
    var msg=this.data.orderData[e.currentTarget.dataset.index].place
    if(msg=="")
    {
      msg ="请于当天9:30后查看床位信息"
    }else{
      msg="就诊地点："+msg
    }
    wx.showModal({
      title: '就诊地点',
      content: msg,
      showCancel:false
    })
  },
  fillterOrder:function(){
    wx.showLoading({
      title: '加载中',
    })
    var detail=this.data.allOrder
    var newData = new Array()
    for (var i = 0; i < detail.length; i++) {
      for (var j = 0; j < detail[i].detail.length; j++) {

        if (detail[i].detail[j].date==this.data.searchDate)
          newData.push({
            name: detail[i].detail[j].name,
            phone: detail[i].phone,
            time: detail[i].detail[j].time,
            place:detail[i].detail[j].place
          })
      }
    }
    newData.sort(function (a, b) {
      a = a.time.split(":")
      b = b.time.split(":")
      return a[0] - b[0]
    })
    this.setData({
      orderData: newData
    })
    wx.hideLoading()
  },
  refreshOrderData:function(){
    db.collection("orderInfo").get()
      .then(res => {

        var detail = res.data
        this.setData({
          allOrder:detail
        })
        this.fillterOrder()
      })
  },
  cancelSearch:function(){
    this.setData({
      searchUserHidden:true
    })
  },
  searchModifyUser:function(e){
    if(this.data.bookName=="" || this.data.bookPhone==""){
      wx.showToast({
        title: '请输入信息',
        icon:"none"
      })
      return
    }
    db.collection("userInfo").where({
      phoneNumber:this.data.bookPhone
    }).get()
    .then(res=>{
      if(res.data.length==0){
        wx.showToast({
          title: '该用户不存在',
          icon:"none"
        })
        return
      }
      this.setData({
        searchUserInfo:res.data[0],
        searchUserHidden:true,
        modifyPageHidden:false
      })
    })
  },
  tempNum:function(e){
    this.setData({
      'searchUserInfo.available':e.detail.value
    })
  },
  modifycancel:function(){
    this.setData({
      modifyPageHidden:true
    })
  },
  modifyconfirm:function(){
    wx.cloud.callFunction({
      name:"adminOperate",
      data:{
        operation:"Apply",
        value:{
          opt:"modify",
          phone: this.data.searchUserInfo.phoneNumber,
          available: this.data.searchUserInfo.available,
        }
      },
      success:res=>{
        if (res.result.status == 0) {
          wx.showToast({
            title: '修改成功',
          })
          this.setData({
            modifyPageHidden:true
          })
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: "none"
          })
        }
      }
    })
  },
  bookName:function(e){
    this.setData({
      bookName:e.detail.value
    })
  },
  bookPhone: function (e) {
    this.setData({
      bookPhone: e.detail.value
    })
  },
  modifyNumber:function(){
    this.setData({
      searchUserHidden:!this.data.searchUserHidden
    })
  },
  bindSearchChange:function(e){
    var dateList = e.detail.value.split("-")
    this.setData({
      searchDate: Number(dateList[0]) + "-" + Number(dateList[1]) + "-" + Number(dateList[2])
    })
    this.fillterOrder()
  },
  bindChange: function(e) {

    var that = this;

    that.setData({
      cur: e.detail.current
    });

  },
  refreshBlack:function(){
    db.collection("blackList").get()
    .then(res=>{
      this.setData({
        blackList:res.data
      })
    })
  },
  deleteBlack:function(e){
    wx.showModal({
      title: '',
      content: '确认删除',
      success:res=>{
        if(res.confirm){
          wx.cloud.callFunction({
            name: "adminOperate",
            data: {
              operation: "Black",
              value: {
                opt: "delete",
                phone: phone
              }
            },
            success: res => {
              if (res.result.status == 0) {
                wx.showToast({
                  title: '删除成功',
                })
                this.refreshBlack()
              } else {
                wx.showToast({
                  title: res.result.msg,
                  icon: "none"
                })
              }
            }
          })
        }
      }
    })
    var phone=e.currentTarget.dataset.phone
   
  },
  onClick: function(e) {
    switch(e.target.dataset.index){
      case 0:
        this.refreshApply()
        break
      case 1:
        this.refreshOrderData()
        break
      case 2:
        break
      case 3:
        this.refreshAdmin()
        break
      case 4:
        this.refreshRoom()
        break
      case 5:
        this.refreshBlack()
        break

    }
    var that = this;
    if (this.data.cur == e.target.dataset.cur) {

      return false;

    } else {
      that.setData({

        cur: e.target.dataset.index

      })

    }

  },
  bindDateChange:function(e)
  {
    var dateList=e.detail.value.split("-")
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      selectedDate: Number(dateList[0])+"-"+Number(dateList[1])+"-"+Number(dateList[2])
    })
    var that=this
    db.collection("twoWeeks").where({
      date: this.data.selectedDate
    }).get()
      .then(res => {
        var specificTime = res.data[0].clinicTime
        var specificBeds = res.data[0].beds
        this.setData({
          time1: specificTime[0],
          time2: specificTime[1],
          time3: specificTime[2],
          specificBeds: specificBeds,
          isVisit: res.data[0].isVisit
        })
        wx.hideLoading()
      })
  }
  ,
  bindTime1Change: function(e) {

    this.setData({
      time1: e.detail.value
    })
  },
  bindDefaultTime1Change: function(e)
  {
    this.setData({
      Default_time1: e.detail.value
    })
  },
  bindDefaultTime2Change: function (e) {
    this.setData({
      Default_time2: e.detail.value
    })
  },
  bindDefaultTime3Change: function (e) {
    this.setData({
      Default_time3: e.detail.value
    })
  },

  bindTime2Change: function(e) {

    this.setData({
      time2: e.detail.value
    })
  },
  bindTime3Change: function(e) {

    this.setData({
      time3: e.detail.value
    })
  },
  defaultBedsInput0:function(e){
    var key="defaultBeds["+e.currentTarget.dataset.index+"][0]"
    this.setData({
      [key]: Number(e.detail.value)
    })
  },
  defaultBedsInput1: function (e) {
    var key = "defaultBeds[" + e.currentTarget.dataset.index + "][1]"
    this.setData({
      [key]: Number(e.detail.value)
    })
  },
  defaultBedsInput2: function (e) {
    var key = "defaultBeds[" + e.currentTarget.dataset.index + "][2]"
    this.setData({
      [key]: Number(e.detail.value)
    })
  },
  switchChange: function(e)
  {
    this.setData({
      isVisit: e.detail.value
    })
  },

  onLoad:function(options){
    this.setData({
      isroot: options.isroot=="1" ? true : false
    })
    
    db.collection("defaultSetting").where({
      type:"clinicTime"
    }).get()
    .then(res=>{
      var clinicTime=res.data[0].clinicTime
      this.setData({
        Default_time1:clinicTime[0],
        Default_time2:clinicTime[1],
        Default_time3:clinicTime[2],
      })
    })
    db.collection("defaultSetting").where({
      type:"place"
    }).get()
    .then(res=>{
      this.setData({
        clinicPlace:res.data[0].place
      })
    })
    db.collection("defaultSetting").where({
      type: "beds"
    }).get()
      .then(res => {
        var beds = res.data[0].beds
        this.setData({
          defaultBeds:beds
        })
      })

    db.collection("defaultSetting").where({
      type:"date"
    }).get()
    .then(res=>{
      var date=res.data[0].date
      for(var i=0;i<8;i++){
        var key = "items["+i+"].checked"
        var value = false
        if(date.includes(i)){
          value=true
        }
        this.setData({
          [key]:value,
          defaultDate:date
        })
      }
    })

    db.collection("twoWeeks").where({
      date:this.data.selectedDate
    }).get()
    .then(res=>{
      var specificTime=res.data[0].clinicTime
      var specificBeds=res.data[0].beds
      this.setData({
        time1:specificTime[0],
        time2:specificTime[1],
        time3:specificTime[2],
        specificBeds:specificBeds,
        isVisit:res.data[0].isVisit
      })
    })
    this.refreshApply()
    this.refreshAdmin()
    this.refreshOrderData()
    this.refreshRoom()
    this.refreshStopTime()
  },
  refreshStopTime(){
    var res=db.collection("twoWeeks").where({
      date: this.data.selectedDate
    }).get().then(res=>{
      if(res.data.isChange==true){
        this.setData({
          showStopTime:res.data[0].clinicTime,
          stopTime: res.data[0].clinicTime[0]
        })
      }else{
        db.collection("defaultSetting").where({
          type:"clinicTime"
        }).get().then(res=>{
          this.setData({
            showStopTime: res.data[0].clinicTime,
            stopTime: res.data[0].clinicTime[0]
          })
        })
      }
    })
    var tm=wx.getStorageSync("zixun")
    this.setData({
      zixun:tm
    })
  },
  refreshAdmin:function(){
    wx.cloud.callFunction({
      name:"adminOperate",
      data:{
        operation:"Admin",
        value:{
          opt:"GET"
        }
      },
      success:res=>{
        this.setData({
          managerMembers:res.result.msg
        })
      }
    })
  },
  refreshApply:function(){
    wx.cloud.callFunction({
      name:"adminOperate",
      data:{
        operation:"Apply",
        value:{
          opt:"GET"
        }
      },
      success:res=>{
        this.setData({
          application_users:res.result.msg
        })
      }
    })
  },
  confirm:function(){
    wx.showLoading({
      title: '修改中',
    })
    wx.cloud.callFunction({
      name:"adminOperate",
      data:{
        operation:"Time",
        value:{
          defaultTime: [this.data.Default_time1, this.data.Default_time2, this.data.Default_time3],
          defaultDate:this.data.defaultDate,
          defaultBeds:this.data.defaultBeds,
          defaultPlace:this.data.clinicPlace,
          specific: this.data.selectedDate,
          isVisit: this.data.isVisit,
          specificTime: [this.data.time1, this.data.time2, this.data.time3],
          specificBeds:this.data.specificBeds,
        }
      },
      success:res=>{
        var result=res.result
        if(result.status==1){
          var msg=result.msg
        }else{
          msg="修改成功"
        }
        wx.hideLoading()
        wx.showToast({
          title: msg,
          icon:"none",
          duration:2000,
        })
      }
    })
  },
  bindStopTimeTab:function(e){
    this.setData({
      stopTime: this.data.showStopTime[Number(e.detail.value)],
      stopOpt: e.detail.value
    })
  },
  bindzixun:function(e){
    this.setData({
      zixun:e.detail.value
    })
  },
  bindStopDateTab:function(e){
    var dateList = e.detail.value.split("-")
    this.setData({
      stopDate: Number(dateList[0]) + "-" + Number(dateList[1]) + "-" + Number(dateList[2])
    })
    this.refreshStopTime()
  },
  stopTheDay:function(){
    if(this.data.zixun==""){
      wx.showToast({
        title: '请输入手机号',
        icon:"none"
      })
      return
    }
    wx.setStorageSync("zixun", this.data.zixun)
    wx.showModal({
      title: '确认停诊',
      content: '该操作会使选中时段无法预约，清空该时段的预约信息并通知患者，请谨慎操作',
      success:res=>{
        if(res.confirm){
          wx.showLoading({
            title: '请稍等',
          })
          wx.cloud.callFunction({
            name:"stopTheDay",
            data:{
              date:this.data.stopDate,
              time:this.data.stopTime,
              opt:this.data.stopOpt,
              zixun:this.data.zixun
            },
            success:res=>{
              wx.hideLoading()
              wx.showToast({
                title: '成功',
              })
            }
          })
        }
      }
    })
  },
//新增：在预约界面拒绝申请信息，申请信息在showingPerson里
  book_cancel: function () {
    wx.showLoading({
      title: '请稍等',
    })
    wx.cloud.callFunction({
      name:"adminOperate",
      data:{
        operation:"Apply",
        value:{
          opt:"POST",
          agree:false,
          phone:this.data.showingPerson.phone
        }
      },
      success:res=>{
        wx.hideLoading()
        if(res.result.status==0){
          wx.showToast({
            title: '成功',
          })
        }
        this.refreshApply()
      }
    })
    this.setData({
      book_hiddenmodalput: true
    });
  },
  //新增：在预约界面确定申请信息，申请信息在showingPerson里
  book_confirm: function () {
    wx.showLoading({
      title: '请稍等',
    })
    wx.cloud.callFunction({
      name:"adminOperate",
      data:{
        operation:"Apply",
        value:{
          opt:"POST",
          agree:true,
          phone:this.data.showingPerson.phone,
          apply:this.data.showingPerson.apply
        }
      },
      success: res => {
        wx.hideLoading()
        this.refreshApply()
        if(res.result.status==0){
          if (res.result.status == 0) {
            wx.showToast({
              title: '成功',
            })
          }
        }else{
          wx.showToast({
            title: res.result.msg,
            icon:"none"
          })
        }
      }
    })

    this.setData({
      book_hiddenmodalput: true
    })

  },
  //新增：应该不需要改动
  inspect: function (e) {
    this.data.showingPerson = this.data.application_users[e.currentTarget.dataset.index];
    this.setData({
      book_hiddenmodalput: !this.data.book_hiddenmodalput,
      showingPerson :this.data.application_users[e.currentTarget.dataset.index]
    })
  }
  ,
  //新增：在管理员界面添加管理员，可不需改动
  manager_cancel: function () {
    this.setData({
      manager_hiddenmodalput: true
    });
  },
  //新增：在管理员界面添加管理员，应放数据库并更新本地
  manager_confirm: function () {
    if(this.data.manageName=="" || this.data.managePhone==""){
      wx.showToast({
        title: '请输入信息',
        icon:"none"
      })
      return
    }
    for(var i=0;i<this.data.managerMembers.length;i++){
      if(this.data.managerMembers[i].phone==this.data.managePhone){
        wx.showToast({
          title: '该管理员已存在',
          icon:"none"
        })
        return
      }
    }
    wx.showLoading({
      title: '添加中',
    })
    wx.cloud.callFunction({
      name:"adminOperate",
      data:{
        operation:"Admin",
        value:{
          opt:"POST",
          name:this.data.manageName,
          phone:this.data.managePhone
        }
      },
      success:res=>{
        wx.hideLoading()
        if(res.result.status==0){
          wx.showToast({
            title: '添加成功',
          })
          this.refreshAdmin()
        }else{
          wx.showToast({
            title: res.result.msg,
            icon:"none"
          })
        }
      }
    })
    this.setData({
      manager_hiddenmodalput: true
    })
  },
  //新增：应该不需要改动
  addManger: function (e) {
    this.setData({
      manager_hiddenmodalput: !this.data.manager_hiddenmodalput,
    })
  },
  //长按删除管理员，操作数据库并更新本地，有一个managerMembers存放信息
  deleteManager:function(e)
  {
    var deletePhone=e.currentTarget.dataset.phone
    wx.showModal({
      title: '',
      content: '确认删除',
      success:res=>{
        if(res.confirm){
          wx.cloud.callFunction({
            name:"adminOperate",
            data:{
              operation:"Admin",
              value:{
                opt:"DELETE",
                phone:deletePhone
              }
            },
            success:res=>{
              if (res.result.status == 0) {
                wx.showToast({
                  title: '删除成功',
                })
                this.refreshAdmin()
              } else {
                wx.showToast({
                  title: res.result.msg,
                  icon: "none"
                })
              }
            }
          })
        }else{
          return
        }
      }
    })
    },
  addBed: function () {
    this.setData({
      bed_hiddenmodalput: false
    })
  },
  bed_cancel: function () {
    this.setData({
      bed_hiddenmodalput: true
    })
  },
  name_change: function (e) {
    this.setData({
      temp_room_name: e.detail.value
    })
  },
  bed_change: function (e) {
    var newOpen = e.detail.value
    var room=e.currentTarget.dataset.name
    this.data.beds[e.currentTarget.dataset.index]['open']=newOpen
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: "adminOperate",
      data: {
        operation: "BEDS",
        value: {
          opt: "OPENCHANGE",
          room: room,
          open: newOpen
        }
      },
      success: res => {
        wx.hideLoading()
        if (res.result.status == 0) {
          this.refreshRoom()
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: "none"
          })
        }
      }
    })
  },
  number_change: function (e) {
    this.setData({
      temp_room_number: e.detail.value
    })
  },
  //长按删除bed，根据index删除上面beds属性的item 
  delete_bed: function (e) {
    wx.showModal({
      title: '',
      content: '确认删除',
      success:res=>{
        if(res.confirm){
          wx.cloud.callFunction({
            name: "adminOperate",
            data: {
              operation: "BEDS",
              value: {
                opt: "REMOVE",
                room: e.currentTarget.dataset.index,
              }
            },
            success: res => {
              wx.hideLoading()

              if (res.result.status == 0) {
                this.refreshRoom()
              } else {
                wx.showToast({
                  title: res.result.msg,
                  icon: "none"
                })
              }
            }
          })
        }
      }
    })
    
  }
  ,
  //添加床位
  bed_confirm: function (e) {
    if(this.data.temp_room_name=="" || this.data.temp_room_number==""){
      wx.showToast({
        title: '请输入信息',
        icon:"none"
      })
    }
    for(var i=0;i<this.data.beds.length;i++){
      if(this.data.beds[i].name==this.data.temp_room_name){
        wx.showToast({
          title: '该房间已存在',
          icon:"none"
        })
        return
      }
    }
    wx.showLoading({
      title: '添加中',
    })
    wx.cloud.callFunction({
      name:"adminOperate",
      data:{
        operation:"BEDS",
        value:{
          opt:"ADD",
          room:this.data.temp_room_name,
          number:this.data.temp_room_number
        }
      },
      success:res=>{
        wx.hideLoading()
        
        if(res.result.status==0){
          wx.showToast({
          title: '添加成功',
        })
        this.refreshRoom()
        }else{
          wx.showToast({
            title: res.result.msg,
            icon:"none"
          })
        }
        this.setData({
          bed_hiddenmodalput:true
        })
      }
    })
  },
  refreshRoom:function(){
    db.collection("roomList").get()
    .then(res=>{
      this.setData({
        beds:res.data
      })
    })
  },
  changeBedNum:function(e){
    var newNum=e.detail.value
    var room=e.currentTarget.dataset.index
    wx.cloud.callFunction({
      name: "adminOperate",
      data: {
        operation: "BEDS",
        value: {
          opt: "NUMCHANGE",
          room: room,
          number: newNum
        }
      },
      success: res => {
        wx.hideLoading()

        if (res.result.status == 0) {
          this.refreshRoom()
        } else {
          wx.showToast({
            title: res.result.msg,
            icon: "none"
          })
        }
      }
    })
  }
})