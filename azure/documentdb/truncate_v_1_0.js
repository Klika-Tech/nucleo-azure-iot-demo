// DOCUMENTDB CUSTOM STORED PROCEDURE
// TRUNCATE data in collection
function truncate(prefix) {
    var collection = getContext().getCollection();

    // Query documents and take 1st item.
    var isAccepted = collection.queryDocuments(
        collection.getSelfLink(),
        'SELECT TOP 10000 * FROM root r',
        function (err, feed, options) {
            if (err) throw err;

            // Check the feed and if empty, set the body to 'no docs found',
            // else take 1st element from feed
            if (!feed || !feed.length) getContext().getResponse().setBody('no docs found');
            else {
                //getContext().getResponse().setBody(prefix + JSON.stringify(feed[0]));
                var promises = feed.map(function(document){
                    return collection.deleteDocument(document._self);
                });
                Promise.all(promises).then(function(res){
                    getContext().getResponse().setBody('deleted:' + res.length);
                }, function(err) {
                    getContext().getResponse().setBody(JSON.stringify(err));
                })
            }
        });

    if (!isAccepted) throw new Error('The query was not accepted by the server.');
}
