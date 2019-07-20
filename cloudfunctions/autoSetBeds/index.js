// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
db=cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var getBeds=function(){
    return new Promise((resolve,reject)=>{
      var res=db.collection("defaultSetting").where({
        type:"beds"
      }).get()
      resolve(res)
    })
  }
  var getClinicTime = function () {
    return new Promise((resolve, reject) => {
      var res = db.collection("defaultSetting").where({
        type: "clinicTime"
      }).get()
      resolve(res)
    })
  }
  var getDefaultDate=function(){
    return new Promise((resolve,reject)=>{
      var res=db.collection("defaultSetting").where({
        type:"date"
      }).get()
      resolve(res)
    })
  }
  var addDate=function(beds,clinicTime,date,visit){
    return new Promise((resolve,reject)=>{
      var res=db.collection("twoWeeks").add({
        data:{
          "beds": beds,
          "clinicTime": clinicTime,
          "date":date,
          "count":[0,0,0],
          "isVisit":visit,
          "isChange":false
        }
      })
      resolve(res)
    })
  }
  var removeDate=function(date){
    return new Promise((resolve,reject)=>{
      var res=db.collection("twoWeeks").where({
        date:date
      }).remove()
      resolve(res)
    })
  }
  var defaultBeds=await getBeds()
  defaultBeds=defaultBeds.data[0].beds
  var defaultClinicTime=await getClinicTime()
  defaultClinicTime = defaultClinicTime.data[0].clinicTime
  var strDate=""
  now = new Date()
  strDate = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate()
  var res=await removeDate(strDate)
  now.setDate(now.getDate()+14)
  defaultBeds=defaultBeds[now.getDay()]
  strDate = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate()
  var defaultDate=await getDefaultDate()
  var visit=false
  if(defaultDate.data[0].date.includes(now.getDay())){
    visit=true
  }
  res=await addDate(defaultBeds,defaultClinicTime,strDate,visit)
  
}