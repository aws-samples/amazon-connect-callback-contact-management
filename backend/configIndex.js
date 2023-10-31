const corSetting = require('./common/corSetting.js')

const CognitoUserPool = process.env.CognitoUserPool;
const CognitoUserPoolClient = process.env.CognitoUserPoolClient;

exports.handler = async function(event, context, callback) {
    console.info('event:', event);
    if (event.httpMethod !== 'GET') {
        throw new Error(`only Get Accepted`);
    }
    
    var output = {};
    output.aws_project_region = process.env.AWS_REGION;
    output.aws_cognito_identity_pool_id = CognitoUserPoolClient;
    output.aws_user_pools_id = CognitoUserPool;

    const response = {
        statusCode: 200,
        headers: corSetting,
        body: JSON.stringify(output)
    };
    callback(null, response);
}

