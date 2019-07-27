// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db=cloud.database()
const _=db.command
// 云函数入口函数
exports.main = async (event, context) => {
  var date=event.date
  var time=event.time
  var allOrder=await db.collection("orderInfo").get()
  allOrder=allOrder.data
  var rmOrder=new Array()
  for(var i=0;i<allOrder.length;i++){
    var detail = allOrder[i].detail
    var change=false
    var newList=new Array()
    for(var j=0;j<detail.length;j++){
      if(detail[j].date==date){
        if(detail[j].time==time){
          detail[j].phone=allOrder[i].phone
          rmOrder.push(detail[j])
          change=true
        }else{
          newList.push(detail[j])
        }
      }else{
        newList.push(detail[j])
      }
      
    }
    if (change) {
      await db.collection("orderInfo").where({
        phone:allOrder[i].phone
        }).update({
          data:{
            detail:newList
          }
        })
    }
  }
  var res=await db.collection("twoWeeks").where({
    date:date
  }).get()
  var beds=res.data[0].beds
  var count=res.data[0].count
  var isChange=res.data[0].isChange
  if(isChange){
    beds[Number(event.opt)] = 0
    count[Number(event.opt)]=0
    await db.collection("twoWeeks").where({
      date: date
    }).update({
      data: {
        beds: beds,
        count:count,
        isChange: true
      }
    })
  }else{
    var dateList=date.split("-")
    var thatDay=new Date(dateList[0],(Number(dateList[1]-1)),dateList[2])
    var defaultBeds=await db.collection("defaultSetting").where({
      type:"beds"
    }).get()
    defaultBeds=defaultBeds.data[0].beds[thatDay.getDay()]
    
    var defaultTime = await db.collection("defaultSetting").where({
      type: "clinicTime"
    }).get()
    clinicTime = defaultTime.data[0].clinicTime
    defaultBeds[Number(event.opt)]=0
    count[Number(event.opt)] = 0
    await db.collection("twoWeeks").where({
      date: date
    }).update({
      data: {
        beds: defaultBeds,
        clinicTime: clinicTime,
        count:count,
        isChange: true
      }
    })

  }
  

  for (var i = 0; i < rmOrder.length;i++){
    await db.collection("userInfo").where({
      phoneNumber:rmOrder[i].phone
    }).update({
      data:{
        available: _.inc(1),
        total: _.inc(-1)
      }
    })
    const result = await cloud.openapi.templateMessage.send({
      touser: rmOrder[i].openId,
      data: {
        keyword1: {
          value: rmOrder[i].name
        },
        keyword2: {
          value: rmOrder[i].phone
        },
        keyword3: {
          value: rmOrder[i].date + " " + rmOrder[i].time
        },
        keyword4: {
          value: ("非常抱歉，该时段临时停诊，您的预约已被取消，已恢复您的可预约次数。如果想要更改时段，请电话咨询："+event.zixun)
        },
      },
      templateId: 'dZILf7ApsJ5FY3bjdLaeDLIKbZJ6Rx81Yj-7y58kS7A',
      formId: rmOrder[i].formID,
    })
  }
  
}