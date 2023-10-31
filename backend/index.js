const instanceArn = process.env.InstanceArn;
const callbackEventLog = require("./dynamodb/callbackEventLog.js");
const constants = require("./common/constants.js");
const connectDescribeContact = require("./connect/ConnectDescribeContact.js");
const connectGetContactAttributes = require("./connect/ConnectGetContactAttributes.js");
const connectListQueue = require("./connect/ConnectListQueue.js");

exports.handler = async function (event, context, callback) {

  if (event.detail && event.detail.channel === "VOICE" && event.detail.initiationMethod === "CALLBACK" && event.detail.instanceArn === instanceArn) {
    console.log(JSON.stringify(event));

    let contactId = event.detail.contactId;

    const instanceArnSplit = instanceArn.split("/");
    let instanceId = instanceArnSplit[instanceArnSplit.length - 1];

    // Callback is INITIATED
    if (event.detail.eventType === constants.INITIATED) {
      console.log("CALLBACK INITIATED");
      await callbackEventLog.saveInfo( contactId, event.detail.eventType, event.time );
    }
    
    // Callback is QUEUED
    else if (event.detail.eventType === constants.QUEUED) {
      console.log("CALLBACK QUEUED");
      // Get Contact Details for Queue Id
      let queueName = '';
      let connectDescribeContactData = await connectDescribeContact.getConnectDescribeContact(instanceId, contactId);
      if (connectDescribeContactData && connectDescribeContactData.Contact &&  connectDescribeContactData.Contact.QueueInfo && connectDescribeContactData.Contact.QueueInfo.Id ) {

        let queueList = await connectListQueue.get(instanceId);

        if(queueList && queueList.QueueSummaryList){
          for (let index = 0; index < queueList.QueueSummaryList.length; index++) {
            const element = queueList.QueueSummaryList[index];
            if(element.Id === connectDescribeContactData.Contact.QueueInfo.Id){
              queueName = element.Name;
              break;
            }
          }
        }
        if(queueName && queueName!=''){
          await callbackEventLog.updateInfo(contactId, constants.queueName, queueName);
        }

        await callbackEventLog.updateInfo(contactId, constants.queueId, connectDescribeContactData.Contact.QueueInfo.Id);
      }

      // Get Contact Attributes for Caller Phone Number saved earlier
      var attributeData = await connectGetContactAttributes.getContactAttributes(instanceId, contactId);
      console.log(attributeData);
      let callbackNumber;
      if (attributeData && attributeData.Attributes && attributeData.Attributes.callbackNumber ) {
        await callbackEventLog.updateInfo(contactId, constants.callbacknumber, attributeData.Attributes.callbackNumber );
        callbackNumber = attributeData.Attributes.callbackNumber;
      }
      await callbackEventLog.updateInfo(contactId, constants.callbackStatus , constants.QUEUED);

      // Add Duplicate Indicator for callbacks with same caller in same queue. 
      if(callbackNumber && callbackNumber.length>0){
      let duplicateCheck = await callbackEventLog.scanThree(constants.callbackStatus, constants.QUEUED, constants.queueName, queueName , constants.callbacknumber, callbackNumber);
      if(duplicateCheck && duplicateCheck.Items && duplicateCheck.Items.length>1){
        for (let index = 0; index < duplicateCheck.Items.length; index++) {
          const element = duplicateCheck.Items[index];
          if(index>0){
            await callbackEventLog.updateInfo(element.contactId.S, constants.duplicateStatus, 'true' );
          }
        }
      }
      }
    } 

    // Callback is CONNECTED_TO_AGENT
    else if (event.detail.eventType === constants.CONNECTED_TO_AGENT) {
      console.log("CALLBACK CONNECTED_TO_AGENT");
      await callbackEventLog.updateInfo(contactId, constants.callbackStatus , constants.CONNECTED_TO_AGENT);
    } else if (event.detail.eventType === constants.CONNECTED_TO_SYSTEM) {
      console.log("CALLBACK CONNECTED_TO_SYSTEM");
      await callbackEventLog.updateInfo(contactId, constants.callbackStatus , constants.CONNECTED_TO_SYSTEM );
    } else if (event.detail.eventType === constants.DISCONNECTED) {
      console.log("CALLBACK DISCONNECTED");
      await callbackEventLog.updateInfo(contactId, constants.callbackStatus , constants.DISCONNECTED);
    }
  }
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
  callback(null, response);
};
