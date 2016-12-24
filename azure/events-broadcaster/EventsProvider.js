const EventHubClient = require('azure-event-hubs').Client;

module.exports = class {

    constructor({connectionString, hubName}) {
        this.client = this.connect({connectionString, hubName});
        setInterval(() => {
            this.client.close().then(() => {
                console.log('Reconnect ....');
                this.client = this.connect({connectionString, hubName});
            }, (err) => {
                console.log('ERROR on close:' + JSON.stringify(err))
            });
        }, 10*60*1000);
    }

    connect({connectionString, hubName}) {
        const client = EventHubClient.fromConnectionString(connectionString, hubName);
        const receiveAfterTime = Date.now() - 5000;
        client.open()
            .then(client.getPartitionIds.bind(client))
            .then((partitionIds) => {
                console.log('Connected to Azure, partitionIds:', partitionIds);
                return Promise.all(partitionIds.map((partitionId) => {
                    return client.createReceiver('$Default', partitionId, { 'startAfterTime' : receiveAfterTime}).then((receiver) => {
                        console.log('Receiver create for partition:', partitionId);
                        receiver.on('message', (msg) => {
                            this.broadcast(msg.body);
                        });
                        receiver.on('errorReceived', (e) => {
                            this.broadcast({ error: e.message });
                            console.log('ERROR: ' + e.message, e);
                        });
                    });
                }));
            }, (err) => {
                console.log('ERROR on connect:' + JSON.stringify(err))
            });
        return client;
    }

    broadcast(message) {
        const str = JSON.stringify(message);
        this.wss.clients.forEach(function each(client) {
            client.send(str);
        });
        console.log(`Send message ${str} to ${this.wss.clients.length} clients.`);
    }

    bindWss(wss) {
        this.wss = wss;
    }

};
