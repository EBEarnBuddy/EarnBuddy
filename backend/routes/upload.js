import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';
import { asyncHandler } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// TODO: Get user ID from authentication middleware

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// Upload profile photo
router.post('/profile-photo', upload.single('photo'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  try {
    // Process image with Sharp
    const processedImageBuffer = await sharp(req.file.path)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        {
          folder: 'earnbuddy/profiles',
          public_id: `profile_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(processedImageBuffer);
    });

    // Delete local file
    const fs = await import('fs');
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        photoURL: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    // Clean up local file if it exists
    if (req.file && req.file.path) {
      const fs = await import('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    throw error;
  }
}));

// Upload multiple images (for posts, etc.)
router.post('/images', upload.array('images', 5), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const uploadedImages = [];

  try {
    for (const file of req.files) {
      // Process image with Sharp
      const processedImageBuffer = await sharp(file.path)
        .resize(800, 600, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          {
            folder: 'earnbuddy/posts',
            public_id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(processedImageBuffer);
      });

      // Delete local file
      const fs = await import('fs');
      fs.unlinkSync(file.path);

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.originalname
      });
    }

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: uploadedImages
      }
    });
  } catch (error) {
    // Clean up any remaining local files
    const fs = await import('fs');
    for (const file of req.files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    throw error;
  }
}));

// Delete image from Cloudinary
router.delete('/image/:publicId', asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
}));

// Get upload signature for direct uploads
router.get('/signature', asyncHandler(async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.v2.utils.api_sign_request(
    {
      timestamp,
      folder: 'earnbuddy/uploads'
    },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    success: true,
    data: {
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    }
  });
}));

export default router;