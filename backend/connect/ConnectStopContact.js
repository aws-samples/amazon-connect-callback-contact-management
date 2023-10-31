const { ConnectClient, StopContactCommand } = require("@aws-sdk/client-connect");
const region = process.env.AWS_REGION;
const accountId = process.env.ACCOUNT_ID;
const instanceArn = process.env.InstanceArn;

const ConnectStopContact = {
    async stop(contactId) {
        const instanceArnSplit = instanceArn.split('/');
        let instanceId = instanceArnSplit[instanceArnSplit.length-1];
  
        const client = new ConnectClient({ region: region });
    
        var response = null;
        try {
            var StopContactCommandInput = {};

            StopContactCommandInput.InstanceId = instanceId;
            StopContactCommandInput.ContactId = contactId;

            const command = new StopContactCommand (StopContactCommandInput);

            response = await client.send(command);

            console.log(response);

            console.log(JSON.stringify(response));
        } catch (error) {
            console.error(error);
        }
        return response;
    }

}
module.exports = ConnectStopContact;