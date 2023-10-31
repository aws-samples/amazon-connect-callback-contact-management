const { CognitoIdentityProviderClient, AdminSetUserPasswordCommand, AdminCreateUserCommand } = require("@aws-sdk/client-cognito-identity-provider");
const region = process.env.AWS_REGION;

const adminCreateUser = {
  async create(userPoolId, email, passwordGenerated) {
    const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({ region: region});

    let params = {
      UserPoolId: userPoolId,
      Username: email,
      DesiredDeliveryMediums: ["EMAIL"],
      ForceAliasCreation: false,
      UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: "true" },
      ]
    };
    params["TemporaryPassword"] = passwordGenerated;

    const command = new AdminCreateUserCommand(params);
    const response = await cognitoIdentityProviderClient.send(command);

    console.log(response);
    return response;
  }
  ,
  async setUserPassword(userPoolId, email, password) {
    const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({ region: region});
    let params = {
      UserPoolId: userPoolId,
      Username: email,
      Password : password,
      Permanent: true
    };

    const command = new AdminSetUserPasswordCommand(params);
    const response = await cognitoIdentityProviderClient.send(command);

    console.log(response);
    return response;
  }


};
module.exports = adminCreateUser;
