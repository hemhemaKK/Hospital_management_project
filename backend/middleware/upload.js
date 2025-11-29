const multer = require("multer");

// we don’t need multer-storage-cloudinary anymore
// cloudinary upload will happen in controller

const storage = multer.diskStorage({});

const upload = multer({ storage });

module.exports = upload;
