const { CognitoIdentityProviderClient, InitiateAuthCommand } = require("@aws-sdk/client-cognito-identity-provider");
const region = process.env.AWS_REGION;

const initiateAuth = {
  async login(username, password) {
    let response;
    try {

      const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({ region: region });

      let params = {
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          PASSWORD: password,
          USERNAME: username
        },
        ClientId: process.env.CognitoPool,
      };

      const command = new InitiateAuthCommand(params);
      response = await cognitoIdentityProviderClient.send(command);

    } catch (error) {
      console.log(error);
    }
    return response;
  }

};
module.exports = initiateAuth;
