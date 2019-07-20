// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const result = await cloud.openapi.templateMessage.send({
    touser: event.userInfo.openId,
    data: {
      keyword1: {
        value: event.name
      },
      keyword2: {
        value: event.phone
      },
      keyword3: {
        value: event.time
      },
      keyword4: {
        value: event.place
      },
    },
    templateId: 'M5fZ2HDEp8Ut92p27vwqFjJbH0dBAbUEsty0zhWfJ4M',
    formId: event.formID,
  })
  console.log(result)
  return result
}