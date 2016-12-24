/**
 * You need to add following `Application Settings` to your Azure Web App:
 * EVENT_HUB_CONNECTION_STRING = Endpoint=<iothub_compatible_endpoint>;SharedAccessKeyName=<key_name>;SharedAccessKey=<access_key>;EntityPath=<iothub_compatible_name>
 * HUB_NAME = <iothub_compatible_name>
 * For details see section `Application Settings`
 * */

const config = {
    connectionString: process.env.EVENT_HUB_CONNECTION_STRING,
    hubName: process.env.HUB_NAME,
};

const EventsProvider = require('./EventsProvider');
const provider = new EventsProvider(config);

const WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ port: process.env.PORT || 3000 });

provider.bindWss(wss);
