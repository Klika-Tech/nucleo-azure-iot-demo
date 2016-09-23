# Nucleo Board Demo Platform Back-end Setup Guide

The demo platform is entirely powered by [Amazon Web Services](http://aws.amazon.com/). If you don't have an AWS account, create one. Amazon provides the [AWS Free Tier](https://aws.amazon.com/free/) for new accounts. The demo platform is lightweight and should fit into the free tier limits.

There is a number of Amazon services to be configured for the Nucleo board demo platform:

1. [Amazon DynamoDB](#amazon-dynamodb)
1. [AWS IoT](#aws-iot)
1. [AWS Lambda](#aws-lambda)
1. [Amazon Cognito](#amazon-cognito)
1. [Amazon S3](#amazon-s3)

## AWS DynamoDB

DynamoDB is used as a data storage for the demo platform. We will need two tables: one for sensor data and one for weather data.

Create the sensor data table with the following parameters:
- Name: `nucleo-metrics`
- Primary partition key: `metric` (String)
- Primary sort key: `timestamp` (String)

Create the weather data table with the following parameters:
- Name: `nucleo-weather`
- Primary partition key: `city` (Number)
- Primary sort key: `timestamp` (Number)

In fact, you can use any table names but don't forget to change them in lambdas code as well.

## AWS IoT

AWS IoT works as a middleware between the "things" (Nucleo board in our case) and other system components.

Open the AWS IoT console and create the following resources (click on "Create a resource" button):

1. **Thing**. Name is the only required parameter here. Set it to `Nucleo`. The thing will reflect the Nucleo board status.
1. **Policy**. The policy defines access rules for the thing. Name it `Nucleo-Policy` and set the parameters:
  - Action: `iot:*`
  - Resource: `*`
  - Allow: checked
1. **Certificate**. The thing will use the certificate for authentication. Please see the [Nucleo board software readme](../nucleo/README.md) for details on how to generate a CSR. As soon as you get the CSR, upload it by clicking "Create with CSR" (don't forget to set the "Activate" checkbox) then "Upload certificate". Amazon will sign a certificate for you. After the certificate is added, click on it's checkbox in the IoT console and attach the thing and the policy:
  1. Click "Actions" > "Attach a policy", specify `Nucleo-Policy` in "Policy name" field and click "Attach"
  1. Click "Actions" > "Attach a thing", specify `Nucleo` in "Thing name" fiels and click "Attech"
1. **Rules**. We will need two rules:
  1. A rule to store **sensor data** to DynamoDB. Click "Create a rule" and set the following parameters:
    - Name: any, i.e. `store_temperature`
	- Attribute: `state.reported.temperature, state.reported.humidity, state.reported.pressure, state.reported.accelerometer, state.reported.gyroscope, state.reported.magnetometer, timestamp`
	- Topic filter: `$aws/things/Nucleo/shadow/update/accepted`
	- Choose an Action: "Insert message into a database table (DynamoDB)"
	- Table name: select the sensor data table created earlier
	- Hash key value: `temperature`
	- Range key value: `${metadata.reported.temperature.timestamp}`
	- Payload field: `payload`
	- Role name: click "Create new role" then click "Allow". This will generate a AWS IAM role which allows writing to the table.

    Click "Add action" to create the action.
    
    For this rule we will need to create another action:
      1. Select "Republish this item to another topic"
      1. Set `Nucleo/data` as the target topic
      1. Click "Create a new role" then "Allow"
      1. Click "Add action"
      
    After that submit the rule by clicking "Create" button.
  1. A rule to store **markers**. Click "Create a rule" and set the following parameters:
    - Name: any, i.e. `store_markers`
	- Attribute: `*`
	- Topic filter: `Nucleo/data`
	- Condition: `marker = true`
	- Choose an Action: "Insert message into a database table (DynamoDB)"
	- Table name: select the sensor data table created earlier
	- Hash key value: `temperature`
	- Range key value: `${timestamp() / 1000}`
	- Payload field: `payload`
	- Role name: select the role you generated for the previous rule (defaults to `aws_iot_dynamoDB`)

	Click "Add action" to create the action then "Create" button to create the rule.

## AWS Lambda

There are three Lambdas to set up. See the [lambdas folder](lambdas/) for their sources.

First we need to build the lambdas:
1. [Install Node.js](https://nodejs.org/en/download/package-manager/)
1. Copy the `config.dist.js` file as `config.js`:
    ```
    cp config.dist.js config.js
    ```
1. Edit the `config.js` file. There is one configuration parameter: IoT endpoint host name. It is unique for every AWS account. You can get it in IoT console. Go to the console and click the small button with a question mark on the right then copy any paste the host name to the `iotEndpoint` config parameter.
1. Build the lambdas:
    ```
    npm i && npm run build && npm run zip
    ```
    
Now there is a ZIP file for each lambda in the `dist` folder. Open the AWS Lambda console and create a lambda for each file:

1. Click "Create a Lambda Function"
1. Click "Skip" on blueprints select page and "Next" on "Configure triggers" page
1. Give a name to the function and select Node.js 4.3 runtime
1. Set "Code entry type" to "Upload a .ZIP file", click "Upload" and select the corresponding ZIP file
1. If this is the first lambda, select "Basic with DynamoDB" in the "Role" field. This will generate a default IAM role with DynamoDB access. Select this role for the next lambdas as well.
1. In "Advanced settings" set:
  - Memory: 256 MB
  - Timeout: 10 sec
1. Click "Next" then "Create function"

The `getNucleoData` lambda provides initial data set for client applications. We need to assign an API endpoint to it so the clients will be able to call it remotely:

1. Go to the Lambda console and click on the `getNucleoData` lambda
1. Go to API Endpoints tab
1. Click "Add API Endpoint" and select "API Gateway" as API endpoint type
1. Set the API endpoint parameters:
  - API name: any
  - Resource name: any, i.e. `/getNucleoData`
  - Method: GET
  - Deployment stage: `prod`
  - Security: Open
1. Go to API Gateway console and click on the API created on previous step
1. Click on the GET method of the resource created on previous steps
1. Click on "Method Request"
1. Expand "URL Query String Parameters" and click on "Add query string"
1. Add "metric" and "since" parameters (use "Add query string" link)
1. Return to Method Execution
1. Click on "Integration Request" and expand "Body Mapping Templates"
1. Click on "Add mapping template" and specify `application/json` as content type
1. Copy and paste this JSON into text area:

    ```
	{
        "metric": "$input.params('metric')",
        "since": "$input.params('since')"
    }
    ```
1. Click "Save"
1. Select the resource in the resources list and click "Actions"
1. Select "Enable CORS" and then click on "Enable CORS and replace existing CORS headers"

Now the API endpoint is open and available for invocation by user browsers.

The `nucleoFetchWeather` lambda fetches weather data for a number of cities from [OpenWeatherMap](http://openweathermap.org/) API. Historical data is not available for free accounts so we have to fetch current data from time to time to build the temperature history. In order to be able to invoke the API [sign up](https://home.openweathermap.org/users/sign_up) for a free account, get an API key, copy and paste it into the `owmApiKey` variable value.

In order to invoke the lambda periodically we can use Amazon CloudWatch scheduling service. AWS Lambda console provides handy functionality to set up the invocations schedule:

1. Go to AWS Lambda console and click on the lambda
1. Go to the "Event sources" tab and click on "Add event source"
1. Select "CloudWatch Events - Schedule" as event source type
1. Give a name for the rule and select a schedule expression, i.e. "rate (20 minutes)"
1. Make sure the "Enable event source" checkbox is checked and click "Submit" button

The `generateNucleoData` lambda is an optional one. It emulates the Nucleo board activity by updating its shadow and generating markers. You can set up an API endpoint or invocations scheduler like for the previous lambdas.

This lambda requires more privileges in order to publish to IoT data streams. Perform the following steps to grant it access:

1. Go to IAM console and then to "Roles" section
1. Select the role you generated for the lambdas
1. Click "Create Role Policy" then "Custom Policy" then "Select" button
1. Give a name to the policy and copy and paste the following JSON into the "Policy Document" text area:

    ```
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "iot:*"
                ],
                "Resource": [
                    "*"
                ]
            }
        ]
    }
    ```
    
## Amazon Cognito

We use Amazon Cognito to provide public read only access to IoT data streams.

The configuration here is pretty simple. Open Cognito console, go to "Manage Federated Identities" and create new identity pool. Give it any name and set the "Enable access to unauthenticated identities" checkbox. 

Along with the pool, an IAM role will be generated. This role will not grant access to our IoT topics by default. We need to extend it:

1. In Cognito console go to the just created pool and click "Edit identity pool"
1. Note the authenticated and unauthenticated role names. We will need them on the next step.
1. Go to IAM console
1. Go to Roles and find the roles from the previous step, do the following for both:
  1. Click on the role
  1. Click "Create Role Policy"
  1. Click "Custom Policy" then "Select"
  1. Give it any name and paste the following text into the "Policy Document" text area:

      ```
      {
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Effect": "Allow",
                  "Action": [
                      "iot:*"
                  ],
                  "Resource": [
                      "*"
                  ]
              }
          ]
      }
      ```
  1. Click "Apply Policy"

## Amazon S3

The web dashboard is a static web application which can be hosted on Amazon S3. Just create a bucket and configure it as described in [this guide](https://docs.aws.amazon.com/AmazonS3/latest/dev/HowDoIWebsiteConfiguration.html).
