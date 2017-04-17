const execFunction = require('./index');

const localContext = {
    modeDev: true,
    log: console.log,
    done: () => {
        console.log('Function done!');
        process.exit();
    }
};

// Run local
// -------------------- //

execFunction(localContext);

