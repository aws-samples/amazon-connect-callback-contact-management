const response = require('cfn-response');
const cognitoAdminCreateUser = require('./cognito/cognitoAdminCreateUser');

exports.handler = async (event, context) => {
  var result = {
    responseStatus: "FAILED",
    responseData: { Data: "Never updated" },
  };

  console.info("received:", JSON.stringify(event));
  try {
    if(event.RequestType === 'Create'){
      var userPool = event.ResourceProperties.UserPool;
    var email = event.ResourceProperties.email;
    var passwordGenerated = generatePassword();

    await cognitoAdminCreateUser.create(userPool, email, passwordGenerated);

    await cognitoAdminCreateUser.setUserPassword(userPool, email, passwordGenerated);

    result.responseStatus = "SUCCESS";
    result.responseData["Data"] = "Successfully uploaded files";
    }else{
      // No need to do anything
      result.responseStatus = "SUCCESS";
      result.responseData["Data"] = "Successfully uploaded files";
    }
  } catch (error) {
    console.log(JSON.stringify(error, 0, 4));
    result.responseStatus = "FAILED";
    result.responseData["Data"] = "Failed to process event";
  }
  finally {
    return await responsePromise(event, context, result.responseStatus, result.responseData, `mainstack`);
  }
};

function responsePromise(event, context, responseStatus, responseData, physicalResourceId) {
  return new Promise(() => response.send(event, context, responseStatus, responseData, physicalResourceId));
}

function generatePassword(){
  var randPassword1 = Array(4).fill("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
  var randPassword2 = Array(4).fill("abcdefghijklmnopqrstuvwxyz").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
  var randPassword3 = Array(4).fill("0123456789").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
  return randPassword1+randPassword2+'@'+randPassword3;
}