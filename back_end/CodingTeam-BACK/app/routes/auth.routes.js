const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { fileUpload } = require('../middleware/multer');
const authJwt = require("../middleware/authJwt");
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
const db = require("../models");
const User = db.user;

const user = new User()

module.exports = function(app) {

  app.use(bodyParser.json());
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",fileUpload,
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);
app.post("/api/auth/reset", controller.resetPassword);
 app.get("/verify-email/:id", controller.verifyEmail)
  app.get("/reset-password/:token", controller.gettoken);
  app.post("/reset-password/:token",controller.posttoken);
  app.put('/api/auth/update/:id',
  
    fileUpload,
    controller.updateUserById,
  );
  app.get('/api/auth/users', controller.getAllUsers);
  app.delete('/api/auth/delete/:id', controller.deleteUser);
  app.get('/api/auth/getID/:id', controller.getUserById);
  app.get('/api/auth/bannedUser/:id', controller.bannedUser);
  app.get('/api/auth/unbannedUser/:id', controller.unbanUser);
  const match=""
///////////////////////////////////
// Configure the AWS SDK and create a new Rekognition instance
 AWS.config.update({ region: 'us-east-1' });
 const rekognition = new AWS.Rekognition({ apiVersion: '2016-06-27' });

// Endpoint to handle the compareFaces request
// app.post('/compareFaces', upload.single('faceData'), (req, res) => {
//   // Get the face data from the request body
//   const fileData = req.file.buffer;
//   const user = null
//   // Convert the file data to a base64 encoded string
//   const faceData = fileData.toString('base64');
//   if (!faceData) {
//     res.status(400).json({ error: 'faceData is required' });
//     return;
//   }

//   // Load the directory of images
//   const imageDir = "./uploads";
//   const files = fs.readdirSync(imageDir);

//   // Loop through each image file and compare with the faces in the collection
//   let matches = [];
//   files.forEach(file => {
//     const filePath = `${imageDir}/${file}`;
//     const imageFile = fs.readFileSync(filePath);
//     const imageBuffer = Buffer.from(imageFile, 'binary');

//     const compareParams = {
//       SourceImage: {
//         Bytes: Buffer.from(faceData, 'base64')
//       },
//       TargetImage: {
//         Bytes: imageBuffer
//       },
//       //FaceMatchThreshold: 70
//     };

//     rekognition.compareFaces(compareParams, function(err, data) {
//       if (err) {
//         console.log(`Error comparing ${filePath}:`, err);
//         res.status(500).json({ error: `Error comparing ${filePath}: ${err}` });
//         return;
//       }

//       if (data.FaceMatches.length > 0) {
//         console.log(`Match found for ${filePath}:`, data.FaceMatches[0].Face);
//         matches.push({
//           file: filePath,
//          // match: true,
//          // face: data.FaceMatches[0].Face
//         });
//       }
//       // } else {
//       //   console.log(`No match found for ${filePath}`);
//       //   matches.push({
//       //     file: filePath,
//       //     match: false
//       //   });
//       // }

//       else {

//         User.findOne({
//           photo: matches[0].file.replace('./', ''),
//         }).then(d=>{
//           res.json(d);
//           console.log(d)
//         })
//         console.log(matches[0].file.replace('./', ''))
        
       

//       }
//     });
//   });
// });
// app.post('/compareFaces', upload.single('faceData'), (req, res) => {
//   // Get the face data from the request body
//   const fileData = req.file.buffer;
//   const user = null;
//   // Convert the file data to a base64 encoded string
//   const faceData = fileData.toString('base64');
//   if (!faceData) {
//     res.status(400).json({ error: 'faceData is required' });
//     return;
//   }

//   // Load the directory of images
//   const imageDir = './uploads';
//   const files = fs.readdirSync(imageDir);

//   // Loop through each image file and compare with the faces in the collection
//   let matches = [];
//   files.forEach((file) => {
//     const filePath = `${imageDir}/${file}`;
//     const imageFile = fs.readFileSync(filePath);
//     const imageBuffer = Buffer.from(imageFile, 'binary');

//     const compareParams = {
//       SourceImage: {
//         Bytes: Buffer.from(faceData, 'base64'),
//       },
//       TargetImage: {
//         Bytes: imageBuffer,
//       },
//       //FaceMatchThreshold: 70.0,
//     };

//     rekognition.compareFaces(compareParams, function (err, data) {
//       if (err) {
//         console.log(`Error comparing ${filePath}:`, err);
//         res
//           .status(500)
//           .json({ error: `Error comparing ${filePath}: ${err}` });
//         return;
//       }

//       if (data.FaceMatches.length > 0) {
//         console.log(`Match found for ${filePath}:`, data.FaceMatches[0].Face);
//         User.findOne({
//              photo: matches[0].file.replace('./', ''),
//             })
//              .then((d) => {
//                res.json(d);
//                 console.log(d);
//               })
//         matches.push({
//           file: filePath,
//           // match: true,
//           // face: data.FaceMatches[0].Face
//         })
        
//       } else {
//         console.log(`No match found for ${filePath}`);
//         // matches.push({
//         //   file: filePath,
//         //   match: false
//         // });
//       }
//     });    
//   });
  
//   // Check if there are any matches and call User.findOne() method
//   // if (matches.length > 0) {
//   //   User.findOne({
//   //     photo: matches[0].file.replace('./', ''),
//   //   })
//   //     .then((d) => {
//   //       res.json(d);
//   //       console.log(d);
//   //     })
//   //     .catch((err) => {
//   //       console.log('Error finding user:', err);
//   //       res.status(500).json({ error: 'Error finding user' });
//   //     });
//   // } else {
//   //   console.log('No match found');
//   //   res.json({ message: 'No match found' });
//   // }

// });
// app.post('/compareFaces', upload.single('faceData'), (req, res) => {
//   // Get the face data from the request body
//   const fileData = req.file.buffer;
  
//   // Convert the file data to a base64 encoded string
//   const faceData = fileData.toString('base64');
//   if (!faceData) {
//     res.status(400).json({ error: 'faceData is required' });
//     return;
//   }

//   // Load the directory of images
//   const imageDir = './uploads';
//   const files = fs.readdirSync(imageDir);

//   // Loop through each image file and compare with the faces in the collection
//   let matches = [];
//   files.forEach((file) => {
//     const filePath = `${imageDir}/${file}`;
//     const imageFile = fs.readFileSync(filePath);
//     const imageBuffer = Buffer.from(imageFile, 'binary');

//     const compareParams = {
//       SourceImage: {
//         Bytes: Buffer.from(faceData, 'base64'),
//       },
//       TargetImage: {
//         Bytes: imageBuffer,
//       },
//     };

//     rekognition.compareFaces(compareParams, function (err, data) {
//       if (err) {
//         console.log(`Error comparing ${filePath}:`, err);
//         res
//           .status(500)
//           .json({ error: `Error comparing ${filePath}: ${err}` });
//         return;
//       }

//       if (data.FaceMatches.length > 0) {
//         console.log(`Match found for ${filePath}:`, data.FaceMatches[0].Face);
//         console.log(filePath)
//         User.findOne({
//           photo: "uploads/"+file.replace('./', ''),
//         })
//           .then((d) => {
//             matches.push({ file: file, user: d });
//             console.log("aaaaa",d);
//             this.user=d
//           })
//           .catch((err) => {
//             console.log('Error finding user:', err);
//             res.status(500).json({ error: 'Error finding user' });
//           });
//       } else {
//         console.log(`No match found for ${filePath}`);
//       }

//       // Once all comparisons are finished, send the response
//       if (matches.length === files.length) {
//         if (matches.length > 0) {
//           res.json(matches);
//         } else {
//           res.json({ message: 'No match found' });
//         }
//       }
//     });
//   });
//   console.log(this.user)
// });
app.post('/compareFaces', upload.single('faceData'), (req, res) => {
  // Get the face data from the request body
  const fileData = req.file.buffer;
  
  // Convert the file data to a base64 encoded string
  const faceData = fileData.toString('base64');
  if (!faceData) {
    res.status(400).json({ error: 'faceData is required' });
    return;
  }

  // Load the directory of images
  const imageDir = './uploads';
  const files = fs.readdirSync(imageDir);

  // Loop through each image file and compare with the faces in the collection
  let matches = [];
  files.forEach((file) => {
    const filePath = `${imageDir}/${file}`;
    const imageFile = fs.readFileSync(filePath);
    const imageBuffer = Buffer.from(imageFile, 'binary');

    const compareParams = {
      SourceImage: {
        Bytes: Buffer.from(faceData, 'base64'),
      },
      TargetImage: {
        Bytes: imageBuffer,
      },
    };

    rekognition.compareFaces(compareParams, function (err, data) {
      if (err) {
        console.log(`Error comparing ${filePath}:`, err);
        res
          .status(500)
          .json({ error: `Error comparing ${filePath}: ${err}` });
        return;
      }

      if (data.FaceMatches.length > 0) {
        console.log(`Match found for ${filePath}:`, data.FaceMatches[0].Face);
        User.findOne({
          photo: "uploads/"+file.replace('./', ''),
        })
          .then((d) => {
            matches.push({ file: file, user: d });
            res.json(d);
            console.log("aaa",d)
            // Once all comparisons are finished, send the response
            if (matches.length === files.length) {
             
                res.json(d);
                console.log("aaa",d)
               
            }
          })
          .catch((err) => {
            console.log('Error finding user:', err);
            res.status(500).json({ error: 'Error finding user' });
          });
      } else {
        console.log(`No match found for ${filePath}`);
        
        // Once all comparisons are finished, send the response
        if (matches.length === files.length) {
          if (matches.length > 0) {
            res.json(matches);
          } else {
            res.json({ message: 'No match found' });
          }
        }
      }
    });
  });
});




 }