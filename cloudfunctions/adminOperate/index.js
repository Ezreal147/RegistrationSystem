// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db=cloud.database()
const _=db.command
// 云函数入口函数
exports.main = async (event, context) => {
  var operation = event.operation //Time Order Admin Doctor
  var value=event.value
  var status=0
  var msg=""
  
  switch (operation){
    case "Time":
      console.log("Time")
      /*
      {
        opration:Time,
        value:{
          defaultTime:[t0,t1,t2],
          specific:"2019-7-12",
          isVisit:true,
          specificTime:[t0,t1,t2]
        }
      }
       */
      var checkAvaliable= function () {
        return new Promise((resolve, reject) => {
          var res = db.collection("twoWeeks").where({
            date: value.specific
          }).count()
          resolve(res)
        })
      }
      count=await checkAvaliable()
      if(count.total==0){
        status=1;
        msg="当前日期不可修改"
      }else{
        var updateClinicTime=function(){
          return new Promise((resolve,reject )=>{
            var res=db.collection("defaultSetting").where({
              type: "clinicTime"
            }).update({
              data: {
                clinicTime: [value.defaultTime[0], value.defaultTime[1], value.defaultTime[2]]
              }
            })
            resolve(res)
          })
        }
        var updateBeds = function () {
          return new Promise((resolve, reject) => {
            var res = db.collection("defaultSetting").where({
              type: "beds"
            }).update({
              data: {
                beds: value.defaultBeds
              }
            })
            resolve(res)
          })
        }
        var result=await updateClinicTime()
        var result2=await updateBeds()
        if (result.errMsg != "collection.update:ok" || result2.errMsg != "collection.update:ok"){
          status=1
        }
        if(status==0){
          var converDate=new Array()
          for(var i=0;i<value.defaultDate.length;i++){
            converDate[i]=Number(value.defaultDate[i])
          }
          var updateDefaultDate=function(){
            return new Promise((resolve,reject)=>{
              var res = db.collection("defaultSetting").where({
                type: "date"
              }).update({
                data: {
                  date: converDate
                }
              })
              resolve(res)
            })
            
          }
          var res=await updateDefaultDate()
          if (result.errMsg != "collection.update:ok") {
            status = 1
          }
          if (status == 0) {
            var updateSpecific = function () {
              return new Promise((resolve, reject) => {
                var res = db.collection("twoWeeks").where({
                  date: value.specific
                }).update({
                  data: {
                    clinicTime: [value.specificTime[0], value.specificTime[1], value.specificTime[2]],
                    isVisit: value.isVisit,
                    beds: value.specificBeds,
                    isChange:true,
                  }
                })
                resolve(res)
              })
            }
            var result = await updateSpecific()
            if (result.errMsg != "collection.update:ok") {
              status = 1
            }
          }
        }
        if(status==1){
          return {
            status:1,
            msg:"发生未知错误，请稍后再试或联系开发人员"
          }
        }
      }

      break

    case "Apply":
      console.log("Apply")
      if(value.opt=="GET"){
        var getAll=function(){
          return new Promise((resolve,reject)=>{
            var res=db.collection("orderNumber").get()
            resolve(res)
          })
        }
        var result=await getAll()
        msg=result.data
        status=0
      }else if(value.opt=="POST"){
        var removeApply = function () {
          return new Promise((resolve, reject) => {
            var res = db.collection("orderNumber").where({
              phone: value.phone
            }).remove()
            resolve(res)
          })
        }
        if(value.agree){
          var updateAvailable=function(){
            return new Promise((resolve,reject)=>{
              var res = db.collection("userInfo").where({
                phoneNumber: value.phone,
              }).update({
                data: {
                  available: _.inc(Number(value.apply))
                }
              })
              resolve(res)
            })
          }
          var res=await updateAvailable()
          var res2=await removeApply()
          console.log(res.errMsg)
          if (res.errMsg != "collection.update:ok" || res2.errMsg !="collection.remove:ok"){
            status=1
            msg="发生未知错误"
          }
        }else{
          var res=await removeApply()
          console.log(res.errMsg)
          if (res.errMsg != "collection.remove:ok"){
            status = 1
            msg = "发生未知错误"
          }
        }
      }
    break

    case "Admin":
      console.log("Admin")
      if(value.opt=="GET"){
        var getAdmin=function(){
          return new Promise((resolve,reject)=>{
            var res=db.collection("adminList").get()
            resolve(res)
          })
        }
        var res=await getAdmin()
        msg=res.data
      } else if (value.opt == "POST") {
        var name = value.name
        var phone = value.phone
        var checkUser = function () {
          return new Promise((resolve, reject) => {
            var res = db.collection("userInfo").where({
              phoneNumber: phone
            }).count()
            resolve(res)
          })
        }
        var register = function () {
          return new Promise((resolve, reject) => {
            var res = db.collection("userInfo").add({
              data: {
                available: 0,
                gender: "保密",
                isAdmin: true,
                medicalCard: "0000",
                name: name,
                phoneNumber: phone,
                relatives: [{ name: name, relation: "me" }]
              }
            })
            resolve(res)
          })
        }
        var changeRole = function () {
          return new Promise((resolve, reject) => {
            var res = db.collection("userInfo").where({
              phoneNumber: phone
            }).update({
              data: {
                isAdmin: true
              }
            })
            resolve(res)
          })
        }
        var addList = function () {
          return new Promise((resolve, reject) => {
            var res = db.collection("adminList").add({
              data: {
                name: name,
                phone: phone,
              }
            })
            resolve(res)
          })
        }
        var res = await checkUser()
        if (res.total == 0) {
          await register()
        } else {
          await changeRole()
        }
        var res2 = await addList()
        if (res2.errMsg !="collection.add:ok")
        {
          status=1
          msg="发生未知错误"
        }

      } else if (value.opt == "DELETE") {
        console.log(value.phone)
        var removeUser = function () {
          return new Promise((resolve, reject) => {
            var res = db.collection("userInfo").where({
              phoneNumber: value.phone
            }).remove()
            resolve(res)
          })
        }
        var removeList = function () {
          return new Promise((resolve, reject) => {
            var res = db.collection("adminList").where({
              phone:value.phone
            }).remove()
            resolve(res)
          })
        }
        var res=await removeUser()
        var res2=await removeList()
        if (res.errMsg != 'collection.remove:ok' || res2.errMsg != 'collection.remove:ok'){
          status=1
          msg="发生未知错误"
        }
      }
    break

    case "Doctor":
      console.log("Doctor")
    break
    default:
      console.log("default")
      break
  }
  return {
    status:status,
    msg:msg
  }

  
}