# Amazon Connect callback contact management

## Introduction

Customer wants the capability to programmatically stop queued callbacks using the StopContact API. Queued callbacks reduce the time callers have to wait by enabling them to provide a phone number to be called back when an agent becomes available. In some situations, customers can end up calling repeatedly and registering for multiple callbacks. You can now use the StopContact API to prevent duplicate callback requests, improving customer experience and reducing contact center costs as callers will no longer receive multiple callbacks for the same issue. 

In this web-based tool, you view the contacts in the queue along with the phone number and associated details. In addition, you can view all the duplicate contact and use the StopContact API to remove the calls from the Queue.

## Prerequisites
It is assumed that you understand the use of the services below and you have the following prerequisites:
1.  An AWS account with both management console and programmatic administrator access.
2.  An existing Amazon Connect instance.


## Architecture diagram 

![Architecture Diagram](images/callback-management-architecture.png?raw=true)

In the above architecture, Amazon Connects fires contact lifecycle events for callbacks, including when a callback was queued, answered, or disconnected. Amazon Connect contact events are published in near real-time via Amazon EventBridge. You process the event data thought AWS lambda and store the event data in the Amazon DynamoDB for it to be viewed in the Web-based tool. You expose event data in the Amazon DynamoDB over a REST API using Amazon API gateway. The AWS CloudFront lets you access the web application hosted in the Amazon S3. This web application integrates with the API gateway to get the event data. You can interact with the web application to call Amazon Connect StopContact API to view and remove duplicate callback contacts. Amazon Cognito authenticates and authorized user to login to the Web App and also makes secured APIGW calls to the backed.


## Walkthrough

1.	Download the backend source code (from /backend) in your local.
    1. Run npm install
    2. zip the content 
    3. Name the ziped file index.zip

2.  Download the frontend code (./frontend).

3.	Create a S3 solution bucket in your AWS account.

4.	Place the Zip files downloaded in step 1.3 in the S3 bucket created in step 3

5.	Run the CFT located (./info/cft/connect-callback-cft.yaml).

6.	Following parameters needed for the CFT:
    1.	InstanceArn: Copy the Amazon Connect instance ARN
    2.	SolutionSourceBucket: Solution bucket created in step 3
    3.  AdminUserEmail: For users to get temporary login credentials from Cognito

![CloudFormation Template Screenshot](images/cft-call-back-stop-contact-cft.png?raw=true)

7. After CFT success, under the CFT output tab, copy the S3 bucket name against the key "S3BucketUi"

8. Upload the forntend code (step 2) in the UI S3 bucket (step 7) 

9. Download the contact flows from here (./info/contactflow/)
    1. First, under the customer queue flow, import the "Sample interruptible queue flow with callback-2" and publish
    2. Second, under the flow, import "test_callback_contact_flow", then upda the "Set customer queue flow" with the flow imported in Stp 9.1 and then publish

10. Associate a phone number to the flow imported in step 9.2

## Validate and testing
1.  Navigate to CloudFront service and use the domain name to browse the Web App
2.  Use the temporary password you received in the email for first time login
3.	Place test calls to the phone number procured in Walktrhough step 10 and create callback requests
4.	You will see the callback event in the Amazon DynamoDB table
5.	You will also see the event details in the web based tool
6.  For the contacts interested, select and execute the Stop Contact API in the Web application.


## Rollback

In order to delete the resources created by the stack:

1. Delete the CloudFormation template
2. Empty and delete the S3 bucket created while executing the CloudFormation template

## Consideration
1. This solution calls Amazon Connect DescribeContact, GetContactAttributes, ListQueues, StopContact API
2. Increase the Amazon Connect SLI for the above APIs.
3. Connect Instace must allow outbound calls.

## Conclusion
In this guide, you learned how to stream Amazon Connect callback events and store it in the Amazon DynamoDB. You learned how to see the event details in the Web Application and execute Amazon Connect StopContact API.
