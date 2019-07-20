// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db=cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var today=new Date()
  today=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()
  var getAll=function(){
    return new Promise((resolve,reject)=>{
      var res=db.collection("orderInfo").get()
      resolve(res)
    })
  }
  var removeOrder=function(phone,detail){
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
  var all=await getAll()
  all=all.data
  for(var i=0;i<all.length;i++){
    var total=all[i].detail
    var detail=new Array()
    for(var j=0;j<total.length;j++){
      if(total[j].date==today){
        continue
      }
      detail.push(total[j])
    }
    await removeOrder(all[i].phone,detail)
  }

  
}