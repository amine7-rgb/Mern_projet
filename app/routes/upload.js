// const router = require('express').Router()
// const cloudinary = require('cloudinary').v2
// const fs = require('fs')



// // we will upload image on cloudinary
// cloudinary.config({
//     cloud_name: 'dxyyb2kph',
//     api_key: '588823867959635',
//     api_secret: 'mFslzpRuvBdwX0P6lDYRj8CHuZQ'
// })

// // Upload image only admin can use
// router.post('/upload',async (req, res) =>{
//     try {
//         if(!req.files || Object.keys(req.files).length === 0)
//             return res.status(400).json({msg: 'No files were uploaded.'})
        
//         const file = req.files.file;
//         if(file.size > 1024*1024) {
//             removeTmp(file.tempFilePath)
//             return res.status(400).json({msg: "Size too large"})
//         }

//         if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png'){
//             removeTmp(file.tempFilePath)
//             return res.status(400).json({msg: "File format is incorrect."})
//         }

//         console.log('file is uploading...');

//         cloudinary.uploader.upload(file.tempFilePath, {folder: "test2"}, async(err, result)=>{
//             console.log('result:');
//             console.log(result);

//             if(err){
//                 console.log("error");
//                 console.log(err);
//                 throw err};

//             removeTmp(file.tempFilePath)

//             res.json({public_id: result.public_id, url: result.secure_url})
//         })


//     } catch (err) {
//         console.log(err);
//         console.error(err)
//         return res.status(500).json({msg: err.message})
//     }
// })

// const removeTmp = (path) =>{
//     fs.unlink(path, err=>{
//         if(err) throw err;
//     })
// }

// module.exports = router
const router = require('express').Router()
const cloudinary = require('cloudinary').v2
const fs = require('fs')

const fileUpload = require('express-fileupload')

// we will upload image on cloudinary
cloudinary.config({
    cloud_name: 'dxyyb2kph',
    api_key: '588823867959635',
    api_secret: 'mFslzpRuvBdwX0P6lDYRj8CHuZQ'
})

// Upload image only admin can use
router.post('/upload', fileUpload({
      useTempFiles: true   
    }) ,   
    async (req, res) =>{
    try {
        if(!req.files || Object.keys(req.files).length === 0)
            return res.status(400).json({msg: 'No files were uploaded.'})
        
        const file = req.files.file;
        if(file.size > 1024*1024) {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "Size too large"})
        }

        if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png'){
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "File format is incorrect."})
        }

        console.log('file is uploading...');

        cloudinary.uploader.upload(file.tempFilePath, {folder: "test2"}, async(err, result)=>{
            console.log('result:');
            console.log(result);

            if(err){
                console.log("error");
                console.log(err);
                throw err};

            removeTmp(file.tempFilePath)

            res.json({public_id: result.public_id, url: result.secure_url})
        })


    } catch (err) {
        console.log(err);
        console.error(err)
        return res.status(500).json({msg: err.message})
    }
})

const removeTmp = (path) =>{
    fs.unlink(path, err=>{
        if(err) throw err;
    })
}

module.exports = router