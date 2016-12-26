# Nucleo Board Demo Platform Back-end Setup Guide

The demo platform is entirely powered by [Microsoft Azure Cloud](https://azure.microsoft.com/en-us/). If you don't have an Microsoft account, create one. Azure provides the [Azure Free Trial](https://azure.microsoft.com/en-us/offers/ms-azr-0044p/) for new accounts.

There is a number of Azure services to be configured for the Nucleo board demo platform:

1. [Azure DocumentDB](#azure-documentdb)
1. [Azure IoT Hub](#azure-iot-hub)
1. [Azure Stream Analytics](#azure-stream-analytics)
1. [Azure Functions](#azure-functions)
1. [Azure Web Apps](#azure-web-apps)

## Azure DocumentDB

DocumentDB is used as a data storage for the demo platform. We will need two tables: one for sensor data and one for weather data.

Create database with the following parameters:
- Name: `nucleo-data`
- NoSQL API: `DocumentDB`

Create the sensor data collection with the following parameters:
- Name: `metric`

Create the weather data collection with the following parameters:
- Name: `weather`

In fact, you can use any collection names but don't forget to change them in Functions code as well.

Also for support needs you can use following stored procedures:
- [Truncate collection](./documentdb/truncate_v_1_0.js)

## Azure IoT Hub

Azure IoT Hub works as a middleware between the "things" (Nucleo board in our case) and other system components.
Create IoT Hub via wizard on Azure Portal.

_Notice: Azure IoT Hub have several default [endpoints](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-endpoints). 
Most interesting default endpoint is `messages/events` with allow use [IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/) as [Event Hub](https://azure.microsoft.com/en-us/services/event-hubs/).
All incoming messages by default handled by `messages/events` endpoint._

## Azure Stream Analytics

Azure Stream Analytics job works for processing and saving [IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/) data stream in [DocumentDB](https://azure.microsoft.com/en-us/services/documentdb/)
Create new Stream Analytics job. For example see guide [here](https://docs.microsoft.com/en-us/azure/stream-analytics/stream-analytics-add-inputs).

Add input with the following parameters:
- Name: iot;
- Type: IoT Hub;
- Consumer group: $Default;
- Event serialization format: JSON;
- Encoding: UTF-8;

Add output with the following parameters:
- Name: database;
- Database: nucleo-data;
- Collection name pattern: metric

Add query, see body of query [here](./stream-analytics/processIotHub.saq).

In fact, you can use any collection names but don't forget to change them in Functions code as well.

## Azure Functions

There are three functions to set up. See the [functions folder](./functions/) for their sources.

First we need to build the each of functions:
1. [Install Node.js](https://nodejs.org/en/download/package-manager/)
1. Copy the `config.dist.js` file as `config.js`:
    ```
    cp config.dist.js config.js
    ```
1. Edit the `config.js` file. Setup connectionStrings and DocumentDB settings from your app instances.
_Notice: for function `generateNucleoData` in use connection string to `iothubowner` shared access key._
1. Build the functions:
    ```
    npm i && npm run build
    ```
    
Now each function have the `dist` folder which contain builds. Open the Azure Portal and create [Azure Function App](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-azure-function) after app will deploy go yo app and do following:

1. Click "Function app settings" -> "Configure CORS" and set ALLOWED ORIGINS to "*"

So let's start adding functions.
The `getNucleoData` function provides initial data set for client applications. We need to assign an API endpoint to it so the clients will be able to call it remotely:

1. Click "New Function" and select Language "Javascript" and template: "HttpTrigger-JavaScript"
1. Set the parameters:
    - Name your function: getNucleoData;
    - Authorization level: Function;
1. Upload via FTP or copy-paste in built-in file explorer content of files in `dist` folder in `getNucleoData` function folder;
1. Click "Save"

Now the API endpoint is open and available for invocation by user browsers.

_Notice: For triggering `getNucleoData` in browser specify on config of dashboard function key which you can see in Manage console of function on Azure function App._

The `nucleoFetchWeather` function fetches weather data for a number of cities from [OpenWeatherMap](http://openweathermap.org/) API. Historical data is not available for free accounts so we have to fetch current data from time to time to build the temperature history. In order to be able to invoke the API [sign up](https://home.openweathermap.org/users/sign_up) for a free account, get an API key, copy and paste it into the `owmApiKey` variable value.

In order to invoke the lambda periodically we can use Amazon CloudWatch scheduling service. AWS Lambda console provides handy functionality to set up the invocations schedule:

1. Click "New Function" and select Language "Javascript" and template: "TimerTrigger-JavaScript"
1. Set the parameters:
    - Name your function: nucleoFetchWeather;
1. Upload via FTP or copy-paste in built-in file explorer content of files in `dist` folder in `nucleoFetchWeather` function folder;
1. Click "Save"

The `generateNucleoData` function is an optional one. It emulates the Nucleo board activity by sending messages to IoT Hub and generating markers.

This function requires more privileges in order to publish to IoT data streams. Perform the following steps to grant it access:

1. Click "New Function" and select Language "Javascript" and template: "TimerTrigger-JavaScript"
1. Set the parameters:
    - Name your function: generateNucleoData;
1. Upload via FTP or copy-paste in built-in file explorer content of files in `dist` folder in `generateNucleoData` function folder;
1. Click "Save"
    
## Azure Web Apps

We use Azure Web Apps to provide public read only access to IoT data streams and hosting for web dashboards.

### Events broadcasting

`events-broadcaster` is a node.js app which provide public read only access to IoT data streams.
Application connect to [IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/) in [Event Hub](https://azure.microsoft.com/en-us/services/event-hubs/) compatible mode and broadcast events to the clients via Websockets.
See sources in the [events-broadcaster folder](./events-broadcaster/).
For build app to do following:

1. [Install Node.js](https://nodejs.org/en/download/package-manager/)
1. Run:
    ```
    npm i && npm run build
    ```
    
For deploy app to do following:
1. Create new Azure WebApp;
1. Set Application Settings: 
    - Web sockets: On;
    - Always On: On;
1. Add following environment variables (see `App settings` subsection):
    - EVENT_HUB_CONNECTION_STRING= 'Endpoint=sb://iothub_compatible_endpoint;SharedAccessKeyName=key_name;SharedAccessKey=access_key;EntityPath=iothub_compatible_name';
    - HUB_NAME='iothub_compatible_name';
1. Setup FTP Access, see [guide](https://blogs.msdn.microsoft.com/kaushal/2014/08/01/microsoft-azure-web-site-connect-to-your-site-via-ftp-and-uploaddownload-files/);
1. Upload all files from local folder `dist/` of `events-broadcaster` to remote folder `/site/wwwroot`;

_Notice: For create Event Hub compatible connection string use following pattern:
`Endpoint=sb://iothub_compatible_endpoint;SharedAccessKeyName=key_name;SharedAccessKey=access_key;EntityPath=iothub_compatible_name`_

### Web dashboard

The dashboard is a demo front-end implemented as a web application. It is a [React](https://facebook.github.io/react/) application which renders the Nucleo board temperature data as a [D3.js](https://d3js.org/) chart.
See sources in the build instruction [here](../dashboard/README.md).

Setup following parameters in config of dashboard app:
- `fetchApiUrl` is url for `getNucleoData` function;
- `fetchApiKey` is function key for `getNucleoData` function;
- `eventNotifierUri` is a uri to deployed `events-broadcaster` instance;

First build dashboard edit config and build app.

One of the simplest hosting options is [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/). In order to deploy the application to Azure do the following:

1. Configure empty [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/) on [Azure Portal](https://portal.azure.com/#);
1. Setup FTP Access, see [guide](https://blogs.msdn.microsoft.com/kaushal/2014/08/01/microsoft-azure-web-site-connect-to-your-site-via-ftp-and-uploaddownload-files/);
1. Upload all files from local folder `dist/` to remote folder `/site/wwwroot`;
