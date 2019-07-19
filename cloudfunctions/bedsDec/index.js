// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db=cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var operation=event.operate
  var num=0
  if(operation=="dec"){
    num=1
  }else{
    num=-1
  }
  var bedsDec=function(date,count){
    return new Promise((resolve,reject)=>{
      var res=db.collection("twoWeeks").where({
        date:date,
      }).update({
        data:{
          "count":count
        }
      })
      resolve(res)
    })
  }
  var getCount=function(date){
    return new Promise((resolve,reject)=>{
      var res=db.collection("twoWeeks").where({
        date:date
      }).get()
      resolve(res)
    })
  }
  var count=await getCount(event.date)
  beds = count.data[0].beds
  count=count.data[0].count
  if(operation=="dec"){
    if (count[Number(event.time)] >= beds[Number(event.time)]) {
      return {
        status: 1,
        msg: "预约名额已满"
      }
    }
  }
  count[event.time]+=num
  var res=await bedsDec(event.date,count)
  if (res.errMsg =="collection.update:ok"){
    return {
      status:0,
      msg:""
    }
  }
}