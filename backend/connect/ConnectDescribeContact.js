const { ConnectClient, DescribeContactCommand } = require("@aws-sdk/client-connect");
const region = process.env.AWS_REGION;
const accountId = process.env.ACCOUNT_ID;

const ConnectDescribeContact = {
    async getConnectDescribeContact(instanceId, contactId) {

        const client = new ConnectClient({ region: region });
    
        var response = null;
        try {
            var input = {};
            input.InstanceId = instanceId;
            input.ContactId = contactId;

            console.log('DescribeContactCommand : ', input);

            const command = new DescribeContactCommand(input);

            response = await client.send(command);
        } catch (error) {
            console.error(error);
        }
        return response;
    }
}
module.exports = ConnectDescribeContact;