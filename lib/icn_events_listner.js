var express 	= require('express'),
	app     	  = express(),
	ibmbluemix 	= require('ibmbluemix'),
	
	config   = {
    // change to real application route assigned for your application
    applicationRoute : "<applicationRoute>",
    // change to real application ID generated by Bluemix for your application
    applicationId : "<applicationId>",
    // change to real applicationSecret  generated by Bluemix for your application
    applicationSecret : "<applicationSecret>"
  };


//IBM Navigator on prem access configuration
var context = {
  icn_server_host : 'cap-sg-prd-3.integration.ibmcloud.com',
  icn_server_port : 15276,
  icn_repository  : 'SLB',
  icn_desktop     : 'testDesktop',
  icn_folder_id   : '/Push',
  icn_user        : 'p8admin',
  icn_password    : 'Aa654321'
}


//load icn data model classes
var icnModelData   = require('./icn_data_model.js');

//loca ICN API data access object 
var icnApi         = require('./icn_api.js')

//load push notofication lib
var ibmpush        = require('ibmpush');

//init instance of ICN API data access object
var IcnApiInstance = new icnApi.IcnAPI();


// init core sdk
ibmbluemix.initialize(config);
var logger = ibmbluemix.getLogger();
var push = ibmpush.initializeService();	


broadcastNotification(function(pushMessage){
    // Push Notification content
  console.log(pushMessage);  
	var message = {
	    alert : "{'title':'"+pushMessage.title+"','message':'"+pushMessage.message+"','time':'"+pushMessage.time+"'}",
	    url : "https://www.bluemix.net"
	};

	//Custom payload is passed on the options parameter
	var settings = {
	    gcm : {
	        //Custom Payload to deliver to Android devices
	        payload : { message :  "Hello to Android devices" }
	    }
	}
	// Send the notification to devices based on platforms. Allowed values are "A" for iOS device and "G" for Android devices
	push.sendNotificationByPlatform(message, ["G"], settings).then(function(response){
	     console.log('The message was sent');
	},function(err){
	    console.log('Error:'+err);
	});
 });


function broadcastNotification(callback){	
   execute(function(pushMessage){
   	    console.log('Back to broadcastNotification callback'); 
   	    console.log(pushMessage)
     	callback(JSON.parse(pushMessage));
   });
}


function execute(callback){

    IcnApiInstance.login(context,context.icn_user,context.icn_password,function(response){
      fetchPushEvents(callback);
    });
}


function fetchPushEvents(callback){
    IcnApiInstance.openFolder(context,context.icn_folder_id,function(data){
      var folder = new icnModelData.Folder(data);
       if(folder.getItems().length>0){
	      console.log(folder.getItems()[0].getId());
	      retrievePushEventContent(folder.getItems()[0],function(data){
	           callback(data);
	      });
       }else{
       	 console.log('There is not push events.');
       }
    });
}


function retrievePushEventContent(item,callback) {

    IcnApiInstance.retrieveItemContent(context,item.getId(),item.getName(),'Document',function(data){    
         callback(data);
         console.log('Try to deleted item');
         IcnApiInstance.deleteItem(context,item.getId(),function(){
         	 console.log('Item'+item.getId()+' was deleted');
         });     
    });
};






