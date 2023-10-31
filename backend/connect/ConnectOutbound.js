const { ConnectClient, StartOutboundVoiceContactCommand } = require("@aws-sdk/client-connect");
const REGION = process.env.AWS_REGION;

const ConnectOutbound = {
    async callNumber(destinationNumber, channelMsgValue) {
        const client = new ConnectClient({ region: REGION });

        var Attributes = {};
        Attributes.message = channelMsgValue;

        var AnswerMachineDetectionConfig = {};
        AnswerMachineDetectionConfig.AwaitAnswerMachinePrompt =true;
        AnswerMachineDetectionConfig.EnableAnswerMachineDetection =true;

        var input = {};
        input.InstanceId = "";
        input.DestinationPhoneNumber = destinationNumber;
        input.ContactFlowId = "";
        input.SourcePhoneNumber = "";
        input.Attributes = Attributes;
        input.AnswerMachineDetectionConfig = AnswerMachineDetectionConfig;
        input.TrafficType = '';


        const command = new StartOutboundVoiceContactCommand(input);
        const response = await client.send(command);
    
    }
}
module.exports = ConnectOutbound;
