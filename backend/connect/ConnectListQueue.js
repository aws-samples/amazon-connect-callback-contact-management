const { ConnectClient, ListQueuesCommand  } = require("@aws-sdk/client-connect");
const region = process.env.AWS_REGION;
const accountId = process.env.ACCOUNT_ID;

const ConnectListQueue = {
    async get(instanceId) {

        const client = new ConnectClient({ region: region });
    
        var response = null;
        try {
            var input = {};
            input.InstanceId = instanceId;
            input.QueueTypes = [ 
            "STANDARD"
            ];
            input.MaxResults = 100;
            
            console.log('ListQueuesCommand  : ', input);

            const command = new ListQueuesCommand (input);

            response = await client.send(command);
        } catch (error) {
            console.error(error);
        }
        return response;
    }
}
module.exports = ConnectListQueue;