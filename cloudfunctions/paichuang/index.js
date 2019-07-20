// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db=cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var getAllOrder=function(){
    return new Promise((resolve,reject)=>{
      var res=db.collection("orderInfo").get()
      resolve(res)
    })
  }
  var getBeds=function(){
    return new Promise((resolve,reject)=>{
      var res=db.collection("roomList").get()
      resolve(res)
    })
  }
  var allOrder=await getAllOrder()
  allOrder=allOrder.data
  var allRoom=await getBeds()
  allRoom=allRoom.data
  var today=new Date()
  today=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()
  var orderToday=new Array()
  var timeList=new Array()
  for(var i=0;i<allOrder.length;i++){
    var detail=allOrder[i].detail
    for(var j=0;j<detail.length;j++){
      if(detail[j].date==today){
        if(detail[j].time in orderToday)
        {
          orderToday[detail[j].time].push({
            name: detail[j].name,
            phone: allOrder[i].phone,
            index_out:i,
            index_in:j,
            time:detail[j].time
          })
        }else{
          timeList.push(detail[j].time)
          orderToday[detail[j].time]=[]
          orderToday[detail[j].time].push({
            name: detail[j].name,
            phone: allOrder[i].phone,
            index_out: i,
            index_in: j,
            time: detail[j].time
          })
        }
      }
    }
  }
  var addPlace=function(phone,detail){
    return new Promise((resolve,reject)=>{
      var res=db.collection("orderInfo").where({
        phone:phone
      }).update({
        data:{
          detail:detail
        }
      })
      resolve(res)
    })
  }
  
  for(var i=0;i<timeList.length;i++){
    var count=0
    var roomIndex=0
    var total=orderToday[timeList[i]]
    for(var j=0;j<total.length;j++){
      var detail=allOrder[total[j].index_out].detail
      detail[total[j].index_in].place=allRoom[roomIndex].name
      await addPlace(total[j].phone,detail)
      count+=1
      if(count>=allRoom[roomIndex].number){
        roomIndex+=1
        count=0
      }
    }
  }
}