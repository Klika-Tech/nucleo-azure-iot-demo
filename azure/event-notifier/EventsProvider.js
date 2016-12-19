const EventHubClient = require('azure-event-hubs').Client;

module.exports = class AzureEventsProvider {

    constructor({connectionString, hubName}) {
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
            });
    }

    broadcast(message) {
        this.wss.clients.forEach(function each(client) {
            client.send(JSON.stringify(message));
        });
    }

    bindWss(wss) {
        this.wss = wss;
    }

};
