// 云函数入口文件
const cloud = require('wx-server-sdk')
const nodeExcel = require('excel-export')
const path = require('path');
cloud.init()
const db=cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var allOrder=await db.collection("orderInfo").get()
  var today = new Date()
  today = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + (today.getDate())
    await cloud.deleteFile({
      fileList: [process.env.fileIdList]
    })
    
  var orderToday = new Array()
  var timeList = new Array()
  allOrder = allOrder.data
  for (var i = 0; i < allOrder.length; i++) {
    var detail = allOrder[i].detail
    for (var j = 0; j < detail.length; j++) {
      if (detail[j].date == today) {
        if (detail[j].time in orderToday) {
          orderToday[detail[j].time].push({
            name: detail[j].name,
            phone: allOrder[i].phone,
            place:detail[j].place
          })
        } else {
          timeList.push(detail[j].time)
          orderToday[detail[j].time] = []
          orderToday[detail[j].time].push({
            name: detail[j].name,
            phone: allOrder[i].phone,
            place: detail[j].place
          })
        }
      }
    }
  }
  var excelResult=null
  var sheet=new Array()
  for(var i=0;i<timeList.length;i++){
    var tableHead = ["姓名", "电话", "就诊地点"];
    var tableMap = {
      styleXmlFile: path.join(__dirname, "styles.xml"),
      name: timeList[i] + "-export",
      cols: [],
      rows: [],
    }
    for (var k = 0; k < tableHead.length; k++) {
      tableMap.cols[tableMap.cols.length] = {
        caption: tableHead[k],
        type: 'string'
      }
    }
    var Output = orderToday[timeList[i]]
    for(var j=0;j<Output.length;j++){
      tableMap.rows[tableMap.rows.length] = [
        Output[j].name,
        Output[j].phone,
        Output[j].place,
      ]
    }
    sheet.push(tableMap)
  }
  excelResult = nodeExcel.execute(sheet)

  //保存excelResult到相应位置
  
  var filePath = "outputExcels";
  var fileName = today +  '-output.xlsx';
  //上传文件到云端
  var res=await cloud.uploadFile({
    cloudPath: path.join(filePath, fileName),
    fileContent: new Buffer(excelResult, 'binary')
  });
  process.env.fileIdList=res.fileID
  return res
}