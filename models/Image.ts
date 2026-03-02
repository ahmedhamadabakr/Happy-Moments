import mongoose, { Schema } from 'mongoose';

export interface ImageDocument extends mongoose.Document {
  title: string;
  category: string;
  imageUrl: string;
  publicId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<ImageDocument>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);

const ImageModel = mongoose.models.Image || mongoose.model<ImageDocument>('Image', ImageSchema);

export default ImageModel;
