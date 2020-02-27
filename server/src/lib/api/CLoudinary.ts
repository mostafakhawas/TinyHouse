import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

export const Cloudinary = {
  upload: async (image: string): Promise<string> => {
    const res = await cloudinary.v2.uploader.upload(image, {
      folder: "TH_ASSETS/"
    });

    return res.secure_url;
  }
};
