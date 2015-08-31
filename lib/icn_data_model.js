// Constructor
function Folder(jsonData) {
  this.json =  (typeof(jsonData) == 'string')?parseICNJson(jsonData):jsonData;
};


// class methods
Folder.prototype.getItems = function() {
   var itemsArrayJson = this.json['rows'];
   
   if(itemsArrayJson){
       var items = [];
       itemsArrayJson.forEach(function(entry) {
         items.push(new Item(entry));
       });
       
       return items;
   }
   return [];
};


Folder.prototype.getId = function() {
  return this.json['docid'];
};


Folder.prototype.getName = function() {
  return this.json['name'];
};


// Constructor
function Item(jsonData) {
  this.json = (typeof(jsonData) == 'string')?parseICNJson(jsonData):jsonData;
};


// class methods
Item.prototype.getId = function() {
  return this.json['id'];
};


Item.prototype.getName = function() {
 return this.json['name'];
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
}


// export the classes
module.exports.Folder = Folder;
module.exports.Item   = Item;


