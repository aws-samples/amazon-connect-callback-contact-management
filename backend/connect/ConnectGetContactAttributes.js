const { ConnectClient, GetContactAttributesCommand } = require("@aws-sdk/client-connect");
const region = process.env.AWS_REGION;
const accountId = process.env.ACCOUNT_ID;

const ConnectGetContactAttributes = {
    async getContactAttributes(instanceId, contactId) {

        const client = new ConnectClient({ region: region });
    
        var response = null;
        try {
            var input = {};
            input.InstanceId = instanceId;
            input.InitialContactId = contactId;

            console.log(input);

            const command = new GetContactAttributesCommand(input);

            response = await client.send(command);
        } catch (error) {
            console.error(error);
        }
        return response;
    }
}
module.exports = ConnectGetContactAttributes;