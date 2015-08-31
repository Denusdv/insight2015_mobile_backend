/*
* IcnAPI class exposes partial ICN rest API functionality as Node JS lib. 
*/

/* 
*  Dependencies 
*/
var http        = require('http');
var request     = require('request');
var fs          = require('fs');  
var querystring = require('querystring');  


// Base Constructor
function IcnAPI() {
};


IcnAPI.prototype.createPostBaseRequestHeaders = function(context){
  return  {'cookie':context.cookies,'security_token':context.security_token,'Content-Type':
    'application/x-www-form-urlencoded; charset=UTF-8','User-Agent':'IBM Bluemix agent'};
};


IcnAPI.prototype.createGetBaseRequestHeaders = function(context){
  return {'User-Agent':'IBM Bluemix agent'};
};

//class methods

/*
* The method performs login with the given context.
*/
IcnAPI.prototype.login = function(context,user,password,callback) {

  var options = {
    host: context.icn_server_host,
    port: context.icn_server_port,
    path: '/navigator/jaxrs/logon?desktop=denis&userid='+user+'&password='+password,
  };

  login_callback = function(response) {
    var responseData = '';
    //another chunk of data has been recieved, so append it to `responseData`
    response.on('data', function (chunk) {
      responseData += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      if(responseData){
        var security_token = parseICNJson(responseData)['security_token'];
        var cookiesList = response.headers['set-cookie'];
        context.security_token = security_token;
        context.cookies = cookiesList;
        callback(responseData,context)
      }
    });
  }

  http.request(options, login_callback).end();
};


/*
* The method retrieves folder content according to the context and folder id.
*/
IcnAPI.prototype.openFolder = function(context,folderId,callback) {

  var options = {
    host: context.icn_server_host,
    port: context.icn_server_port, 
    path: '/navigator/jaxrs/p8/openFolder',
    headers: this.createPostBaseRequestHeaders(context),
    method:'POST'
  };

  var postData = querystring.stringify({
      desktop: context.icn_desktop,
      repositoryId: context.icn_repository,
      docid: folderId,
  });
 
   
  openFolderCallback = function(response) {
    var responseData = '';
    
       
    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      responseData += chunk;
      //console.log('data'+data);
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
       callback(responseData,context)
    });
  }

  var openFolderReq = http.request(options, openFolderCallback);
  openFolderReq.write(postData);
  openFolderReq.end();
};



/*
* The method creates new document.
*/
IcnAPI.prototype.createItemWithContent = function(context,folderId,docClass,criterias,filePath,fileName,contentType,callback) {

  var headers = this.createPostBaseRequestHeaders(context);
  headers['Content-Type'] = "multipart/form-data"; 

  var options = {
    url: 'http://'+context.icn_server_host+':'+context.icn_server_port+'/navigator/jaxrs/p8/addItem', 
    headers: headers,
    method:'POST'
  };

  var formData = {
    desktop: context.icn_desktop,
    repositoryId: context.icn_repository,
    criterias: criterias,
    childComponentValues:'[]',
    parm_content_source_type:docClass,
    docid:folderId,
    template_name:docClass,
    parm_part_filename:fileName,
    asMinorVersion:'false',
    autoClassify:'false',
    compoundDocument:'false',
    allowDuplicateFileNames:'true',
    set_security_parent:'false',
    file: {
      value: fs.createReadStream(filePath),
      options: {
        filename: fileName,
        contentType: contentType
      }
    }
  };
  
  options.formData = formData;

  createItemCallback = function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
      }else{
        console.log(error)
      }
  };

  request.post(options,createItemCallback);
};

IcnAPI.prototype.retrieveItemContent = function(context,itemId,itemName,docClass,callback) {
  
  var options = {
    host: context.icn_server_host,
    port: context.icn_server_port, 
    path: '/navigator/jaxrs/p8/getDocument',
    headers: this.createPostBaseRequestHeaders(context),
    method:'POST'
  };

  var postData = querystring.stringify({
      repositoryId: context.icn_repository,
      docid: itemId,
      desktop: context.icn_desktop,
      template_name:docClass,
      transform:'native',
      part_number:'0',
      parm_part_filename:itemName,
      disposition:'attachment',
      security_token:context.security_token
  });

  
  retrieveItemContentCallback = function(response) {
    var responseData = '';
      
       
    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      responseData += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
        callback(responseData,context)
    });
  }

  var retrieveItemContentReq = http.request(options, retrieveItemContentCallback);
  retrieveItemContentReq.write(postData);
  retrieveItemContentReq.end();
};


IcnAPI.prototype.deleteItem = function(context,itemId,callback) {
 
  var options = {
    host: context.icn_server_host,
    port: context.icn_server_port, 
    path: '/navigator/jaxrs/p8/deleteItem',
    headers: this.createPostBaseRequestHeaders(context),
    method:'POST'
  };

  var postData = querystring.stringify({
      repositoryId: context.icn_repository,
      docid: itemId,
      desktop: context.icn_desktop,
      include_all_versions:true,
  });

    
  deleteItemCallback = function(response) {
    var responseData = '';
       
    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      responseData += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
         callback(responseData);
    });
  }

  var deleteItemReq = http.request(options, deleteItemCallback);
  deleteItemReq.write(postData);
  deleteItemReq.end();
};


IcnAPI.prototype.favorites = function(context,user,callback) {
 
  var options = {
    host: context.icn_server_host,
    port: context.icn_server_port, 
    path: '/navigator/jaxrs/listFavorites',
    headers: this.createPostBaseRequestHeaders(context),
    method:'POST'
  };

  var postData = querystring.stringify({
      application: 'navigator',
      userid: context.icn_desktop+'.'+context.icn_repository+'.'+user,
      desktop: context.icn_desktop
  });

    
  deleteItemCallback = function(response) {
    var responseData = '';
       
    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      responseData += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
         callback(responseData);
    });
  }

  var deleteItemReq = http.request(options, deleteItemCallback);
  deleteItemReq.write(postData);
  deleteItemReq.end();
};

function parseICNJson(jsonString){

  //define startwith method 
  if(!String.prototype.startsWith){
    String.prototype.startsWith = function (str) {
        return !this.indexOf(str);
    }
  }

  var json = null;
  if(jsonString.startsWith('{}&&')) 
      json = JSON.parse(jsonString.substring(4,jsonString.length));
  else
    json = JSON.parse(jsonString);

  return json;
};


// export the classes
module.exports.IcnAPI = IcnAPI;
