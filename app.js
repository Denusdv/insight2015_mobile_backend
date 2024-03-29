var express   = require('express'),
  app         = express(),
  ibmbluemix  = require('ibmbluemix'),
 
  config   = {
    // change to real application route assigned for your application
    applicationRoute : "<applicationRoute>",
    // change to real application ID generated by Bluemix for your application
    applicationId : "<applicationId>",
    // change to real applicationSecret  generated by Bluemix for your application
    applicationSecret : "<applicationSecret>"
  };

	// init core sdk
ibmbluemix.initialize(config);
var logger = ibmbluemix.getLogger();

// init service sdks 
app.use(function(req, res, next) {  
    req.logger = logger;
    next();
});

// init basics for an express app
app.use(require('./lib/setup'));

/*
  Initialize push notification listener process. 
  The process runs as separate node process periodically
  checks if there are available push event ready for broadcasting. 
  The process leverages icn_api class to communicate with IBM Navigator server.
*/
var exec = require('child_process').exec;
setInterval(function(){
    exec('node ./lib/icn_events_listner.js', function(error, stdout, stderr) {
      console.log('stdout: ', stdout);
      console.log('stderr: ', stderr);
      if (error !== null) {
          console.log('exec error: ', error);
      }
    });
},5000);



var ibmconfig = ibmbluemix.getConfig();

/* Start node js server */
app.listen(ibmconfig.getPort());
logger.info('Server started at port: '+ibmconfig.getPort());
console.log('Server started at port: '+ibmconfig.getPort());