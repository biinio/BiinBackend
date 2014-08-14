
var path = require("path"), uuid=require('node-uuid'),fs = require('fs'), JSFtp = require("jsftp");;
module.exports = function(){
	var functions={};
    
    //Get a random UIID
    functions.getGUID = function(){
     return uuid.v4();
    }

    //Get the extension of a file
    functions.getExtension= function(filename) {
       var ext = path.extname(filename||'').split('.');
       return ext[ext.length - 1];
    }
    
    //Return a new name for an image
    functions.getImageName=function(filename,toPath){
      var extension= this.getExtension(filename);
      var newName = this.getGUID()+"."+extension;
      newName = newName.replace("-","");
       //Verify if the image all ready exists       
       /*fs.exists(path.join(filename,filename),function(exists){
         if(!exists){
            return  newName;
         }else{
         	//Call again to try get a new image name
         	return this.getImageName(filename,toPath);
         }
       });*/
      return newName;
    }
    
    //Uploads File to FTP
    functions.FTPUpload= function(localPath,remotePath,callback){
        //FTP Instance
        ftp = new JSFtp({ host: process.env.FTP_HOST,
                port: process.env.FTP_PORT,
                user:process.env.FTP_USER,
                pass:process.env.FTP_PASS,
                debugMode: true
        });

        ftp.on('jsftp_debug', function(eventType, data) {
           console.log('DEBUG: ', eventType);
           console.log(JSON.stringify(data, null, 2));
        });     

        ftp.put(localPath,remotePath,callback);
    }

    //Misselanious Properties
    functions.get ={};

    functions.get.majorIncrement =function(){
      return 10;
    }

    functions.get.minorIncrement =function(){
      return 10;
    }

    return functions;	
}