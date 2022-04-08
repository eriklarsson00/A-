import { createRequire } from "module";
import S3 from "aws-sdk/clients/s3.js";

const require = createRequire(import.meta.url);

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

const handleError = (err, res) => {
  res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
};

const uploadImageOnS3 = async (file, bucketPath) => {
  console.log("Inne i uppload image to S3\n");
  const s3bucket = new S3({
    accessKeyId: process.env.AWS_accessID,
    secretAccessKey: process.env.AWS_secretKEY,
    Bucket: "matsamverkan",
    signatureVersion: "v4",
  });
  let contentType = "image/jpeg";
  let contentDeposition = 'inline;filename="' + file.filename + '"';
  const base64 = await fs.readFileSync(file.path, "base64");
  const arrayBuffer = new Buffer.from(base64, "base64");
  console.log("bucketPath = " + bucketPath);
  s3bucket.createBucket(() => {
    const params = {
      Bucket: "matsamverkan",
      Key: bucketPath,
      Body: arrayBuffer,
      ContentDisposition: contentDeposition,
      ContentType: contentType,
      ContentEncoding: file.encoding,
    };
    s3bucket.upload(params, (err, data) => {
      if (err) {
        throw err;
      }
    });
  });
};

export { upload, uploadImageOnS3 };
