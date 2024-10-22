const multer = require('multer'); // Multer (Multipart Form Processing)
const cloudinary = require("cloudinary").v2;

/* ******************** configure multer and cloudinary ******************** */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });


/**
 * Middleware that takes a single file from the request, stores it in memory and adds its information to the request in the file property.
 */
const uploadSetHero = upload.single("hero");

/**
 * Middleware that takes a single file from the request, stores it in memory and adds its information to the request in the file property.
 */
const uploadProductImage = upload.single("image");


/**
 * cloudinary file uploader function. Returns details about the file uploaded (public ID) 
 * @param {{ fieldname: string, originalname: string, encoding: string, mimetype: string, size: number, buffer: string }} file 
 */
const cloudinaryFileUploader = async (file) => {
  try {
    if (file.size >= 1024 * 1024) {
      throw new Error("file to big");
    }
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`; // "data:" + file.mimetype + ";base64," + b64;
    const cldRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      public_id: file.originalname.substring(0, file.originalname.lastIndexOf(".")),
      asset_folder: `mtg-store/${file.fieldname}/`,
      // use_asset_folder_as_public_id_prefix: true,
    });
    return cldRes;
  } catch (err) {
    throw new Error(`Error trying to upload file to Cloudinary: ${err}`);
  }
};

const deleteImage = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id, { invalidate: true });
  }
  catch (err) {
    throw new Error(`Error deleting image id:[${public_id}]:${err}`);
  }
};

const fileUploadUtils = {
  uploadSetHero,
  uploadProductImage,
  cloudinaryFileUploader,
  deleteImage,
};

module.exports = fileUploadUtils;


// Multer Disk Storage Configuration (old)
// const productStorage = multer.diskStorage({
//   destination: "./img/",
//   filename: function (req, file, cb) { cb(null, file.originalname); }
// });
// const uploadProduct = multer({ storage: productStorage });

// const heroStorage = multer.diskStorage({
//   destination: "./img/hero/",
//   filename: function (req, file, cb) { cb(null, file.originalname); }
// });
// const uploadHero = multer({ storage: heroStorage });