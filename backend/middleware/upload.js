const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Maximum number of files per upload
const MAX_FILES = 10;

// Sanitize filename to prevent directory traversal attacks
const sanitizeFilename = (filename) => {
  // Remove any path components
  const basename = path.basename(filename);
  
  // Remove special characters except alphanumeric, dash, underscore, and dot
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Prevent double extensions (e.g., file.php.jpg)
  const ext = path.extname(sanitized);
  const name = path.basename(sanitized, ext);
  
  // Limit filename length
  const maxNameLength = 100;
  const truncatedName = name.length > maxNameLength 
    ? name.substring(0, maxNameLength) 
    : name;
  
  return truncatedName + ext;
};

// Generate secure random filename
const generateSecureFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const sanitizedOriginal = sanitizeFilename(path.basename(originalname, ext));
  const randomHash = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  
  return `${sanitizedOriginal}-${timestamp}-${randomHash}${ext}`;
};

// Validate file content (magic number check)
const validateFileContent = (buffer, mimetype) => {
  // Check file signatures (magic numbers)
  const signatures = {
    'image/jpeg': [
      [0xFF, 0xD8, 0xFF]
    ],
    'image/png': [
      [0x89, 0x50, 0x4E, 0x47]
    ],
    'image/gif': [
      [0x47, 0x49, 0x46, 0x38]
    ],
    'image/webp': [
      [0x52, 0x49, 0x46, 0x46] // RIFF
    ],
    'image/svg+xml': [
      [0x3C, 0x3F, 0x78, 0x6D], // <?xml
      [0x3C, 0x73, 0x76, 0x67]  // <svg
    ]
  };

  const fileSignatures = signatures[mimetype];
  if (!fileSignatures) return false;

  // Check if buffer starts with any of the valid signatures
  return fileSignatures.some(signature => {
    return signature.every((byte, index) => buffer[index] === byte);
  });
};

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    try {
      const secureFilename = generateSecureFilename(file.originalname);
      cb(null, secureFilename);
    } catch (error) {
      cb(error);
    }
  }
});

// Enhanced file filter with security checks
const fileFilter = (req, file, cb) => {
  try {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP, SVG).`), false);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
    }

    // Check for double extensions
    const nameWithoutExt = path.basename(file.originalname, ext);
    if (path.extname(nameWithoutExt)) {
      return cb(new Error('Files with double extensions are not allowed.'), false);
    }

    // Check filename length
    if (file.originalname.length > 255) {
      return cb(new Error('Filename is too long. Maximum 255 characters.'), false);
    }

    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Configure multer with enhanced security
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    fields: 10,
    fieldNameSize: 100,
    fieldSize: 1024 * 1024 // 1MB for text fields
  },
  fileFilter: fileFilter
});

// Middleware for multiple file upload
const uploadProductImages = upload.array('images', MAX_FILES);

// Enhanced error handling middleware
const handleUploadError = (err, req, res, next) => {
  // Clean up uploaded files on error
  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    });
  }

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB per image.`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: `Too many files. Maximum ${MAX_FILES} images allowed.`
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field name. Use "images" for file uploads.'
      });
    }
    if (err.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many fields in the request.'
      });
    }
    
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  }
  
  // Handle custom validation errors
  if (err.message) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // Pass other errors to next middleware
  next(err);
};

// Middleware to validate uploaded file content
const validateUploadedFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    // Validate each uploaded file
    for (const file of req.files) {
      // Read first few bytes to check file signature
      const buffer = fs.readFileSync(file.path);
      const header = buffer.slice(0, 8);

      // Validate file content matches MIME type
      if (!validateFileContent(header, file.mimetype)) {
        // Delete invalid file
        fs.unlinkSync(file.path);
        
        return res.status(400).json({
          success: false,
          error: `File "${file.originalname}" appears to be corrupted or is not a valid image.`
        });
      }

      // Additional check: ensure file is not empty
      if (buffer.length === 0) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          error: `File "${file.originalname}" is empty.`
        });
      }
    }

    next();
  } catch (error) {
    console.error('File validation error:', error);
    
    // Clean up files on validation error
    if (req.files) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error validating uploaded files.'
    });
  }
};

module.exports = {
  uploadProductImages,
  handleUploadError,
  validateUploadedFiles,
  sanitizeFilename,
  MAX_FILE_SIZE,
  MAX_FILES,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS
};