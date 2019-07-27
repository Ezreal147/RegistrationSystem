// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
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
    templateId: 'ivLb_XngZw3qKcTtiOSHqBiNXs6vHSl3px1OTiydy4s',
    formId: event.formID,
  })
  return result
}