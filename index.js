const AWS = require('aws-sdk'); 
const express = require('express')
const fileUpload = require('express-fileupload'); 
const { createBrotliCompress } = require('zlib');
const app = express(); 
app.use(fileUpload()); 
AWS.config.loadFromPath('./credentials.json'); 
AWS.config.update({region: 'us-east-2'});
var rekognition = new AWS.Rekognition();


function searchByImage(image, cb){

  var params = {
    CollectionId: "youtubers", 
    Image: {
     Bytes: image.data.buffer
    }
   };
   rekognition.searchFacesByImage(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); 

      cb([]) // an error occurred
     } else    {
        console.log(data);           // successful response
    const imageMatches = data.FaceMatches.filter(function(match) {return match.Face.ExternalImageId !== undefined })
    .map(function(image) {return image.Face.ExternalImageId})
    .map(function(s3ObjectKey) {return "https://darrylpics.s3.us-east-2.amazonaws.com/" + s3ObjectKey})
     cb(imageMatches)
  }
  }); 
  

}
app.use(express.static('public')); 
 
app.post('/upload', function(req, res) {

  console.log("Uploading File")
    if (!req.files)
        return res.status(400).send('No files were uploaded!'); 

        const uploadedImage = req.files.facetosearch; 

       

        searchByImage(uploadedImage, function(images){
          var html = "<html><body>"
          images.forEach(function(imageSrc) {
            html = html + "<img src='" + imageSrc + "' />"

          })

          res.send(html)
        }); 

      console.log("uploaded")
       
    
  });

  app.listen(3001)