import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * العميل - الشخص الذي يتم إنشاء الفعالية له
 * ليس لديه حساب في النظام، فقط رابط خاص للعرض
 */
export interface IClient extends Document {
  companyId: mongoose.Types.ObjectId;
  fullName: string;
  email?: string;
  phone?: string;
  accessToken: string; // Token فريد للوصول إلى صفحة العرض
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'اسم العميل مطلوب'],
      trim: true,
      maxlength: [255, 'الاسم يجب أن لا يتجاوز 255 حرف'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    accessToken: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index للبحث السريع
clientSchema.index({ companyId: 1, fullName: 1 });

export const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema);
