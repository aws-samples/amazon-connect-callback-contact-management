const corSetting = require("./common/corSetting.js");
const constants = require("./common/constants.js");
const connectDescribeContact = require("./connect/ConnectDescribeContact.js");
const connectStopContact = require("./connect/ConnectStopContact.js");
const callbackEventLog = require("./dynamodb/callbackEventLog.js");

exports.handler = async function (event, context, callback) {
  console.info("event:", event);
  if (event.httpMethod !== "GET") {
    throw new Error(`only Get Accepted`);
  }

  let output = {};

  const operation = event.queryStringParameters.operation ? event.queryStringParameters.operation : "";
  const contactId = event.queryStringParameters.contactId ? event.queryStringParameters.contactId : "";
  const scanKey = event.queryStringParameters.scanKey ? event.queryStringParameters.scanKey : "";
  const scanValue = event.queryStringParameters.scanValue ? event.queryStringParameters.scanValue : "";
  const queue = event.queryStringParameters.queue ? event.queryStringParameters.queue : "";
  const status = event.queryStringParameters.status ? event.queryStringParameters.status : "";
  const stopMessage = event.queryStringParameters.stopMessage ? event.queryStringParameters.stopMessage : "";

  if(operation && operation === 'SEARCH'){

    if(queue && status && queue === 'ALL' && status === 'ALL'){
      output = await callbackEventLog.scanAll();
    }
    else if (queue && status && queue === 'ALL' && status != 'ALL') {
      output = await callbackEventLog.scan(constants.callbackStatus, status);
    }
    else if (queue && status && queue != 'ALL' && status === 'ALL') {
      output = await callbackEventLog.scan(constants.queueName, queue);
    }
    else{
      output = await callbackEventLog.scanTwo(constants.queueName, queue , constants.callbackStatus, status);
    }
  }
  else if (operation && operation === 'STOP'){
    console.log('stopMessage',stopMessage);
    
    let serviceOutput = await connectStopContact.stop(contactId);
    if(serviceOutput && serviceOutput.$metadata.httpStatusCode){
      await callbackEventLog.updateInfo(contactId, constants.cancelled , 'true');
    }    
    output = 'success';
  }
  else if (operation && operation === 'LIST'){
    let queueList = [];
    let callbackData = await callbackEventLog.scanAll();
    if(callbackData && callbackData.Items){
      for (let index = 0; index < callbackData.Items.length; index++) {
        const element = callbackData.Items[index];
        
        if(element && element.queueName && element.queueName.S && !queueList.includes(element.queueName.S)){
          queueList.push(element.queueName.S);
        }
      }
    }
    output = queueList;
  }
  else if (operation && operation === 'DOWNLOAD'){
/*
    const csvRows = [
      '1,"blah",123',
      '2,"qwe",456'
    ]
*/

    if(queue && status && queue === 'ALL' && status === 'ALL'){
      output = await callbackEventLog.scanAll();
    }
    else if (queue && status && queue === 'ALL' && status != 'ALL') {
      output = await callbackEventLog.scan(constants.callbackStatus, status);
    }
    else if (queue && status && queue != 'ALL' && status === 'ALL') {
      output = await callbackEventLog.scan(constants.queueName, queue);
    }
    else{
      output = await callbackEventLog.scanTwo(constants.queueName, queue , constants.callbackStatus, status);
    }

    let outputListFormatted= [];
    if(output && output.Items && output.Items.length>0)
    {
      for (let index = 0; index < output.Items.length; index++) {
        const element = output.Items[index];
        const elementFormatted = {};

        if(element.contactId && element.contactId.S){
          elementFormatted.contactId = element.contactId.S;
        }

        if(element.queueName && element.queueName.S){
          elementFormatted.queueName = element.queueName.S;
        }else {
          elementFormatted.queueName = '';
        }

        if(element.queueId && element.queueId.S){
          elementFormatted.queueId = element.queueId.S;
        }else {
          elementFormatted.queueId = '';
        }

        if(element.callbackStatus && element.callbackStatus.S){
          elementFormatted.callbackStatus = element.callbackStatus.S;
        }else {
          elementFormatted.callbackStatus = '';
        }

        if(element.callbacknumber && element.callbacknumber.S){
          elementFormatted.callbacknumber = element.callbacknumber.S;
        }else {
          elementFormatted.callbacknumber = '';
        }


        if(element.eventTime && element.eventTime.S){
          elementFormatted.eventTime = element.eventTime.S;
        }else {
          elementFormatted.eventTime = '';
        }

        outputListFormatted.push(elementFormatted);
      }
    }

    let csv;
    if(outputListFormatted && outputListFormatted.length>0){
      const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
      const header = Object.keys(outputListFormatted[0]);
      csv = outputListFormatted.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(header.join(','));
      csv = csv.join('\r\n');
    }
    
    callback(null, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-disposition': 'attachment; filename=download.csv'
      },
      body: csv,
      statusCode: 200
    })

  }


  const response = {
    statusCode: 200,
    headers: corSetting,
    body: JSON.stringify(output),
  };

  callback(null, response);
};
