const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({ 
        cloud_name: process.env.cloud,
        api_key: process.env.api, 
        api_secret: process.env.secret 
    });

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Campy  ',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}