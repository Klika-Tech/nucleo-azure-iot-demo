const EventsProvider = require('./EventsProvider');
const config = require('./config');

const provider = new EventsProvider(config);

const WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ port: config.port });

provider.bindWss(wss);
