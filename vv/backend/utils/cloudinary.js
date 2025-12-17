const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (fileBuffer, folder = 'vanitha-vikas/chat-images') => {
    try {
        console.log('Starting Cloudinary upload to folder:', folder);
        console.log('File buffer size:', fileBuffer.length);
        
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'image',
                    transformation: [
                        { quality: 'auto:good' },
                        { fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error('Image upload failed: ' + error.message));
                    } else {
                        console.log('Cloudinary upload successful:', result.secure_url);
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id
                        });
                    }
                }
            ).end(fileBuffer);
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Image upload failed: ' + error.message);
    }
};

const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
    }
};

module.exports = {
    uploadImage,
    deleteImage
};