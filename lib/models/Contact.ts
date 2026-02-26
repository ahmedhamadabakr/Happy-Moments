import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IContact extends Document {
  companyId: mongoose.Types.ObjectId
  fullName: string
  phone: string
  email?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

const contactSchema = new Schema<IContact>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'الاسم كامل مطلوب'],
      trim: true,
      maxlength: [255, 'الاسم يجب أن لا يتجاوز 255 حرف'],
    },
    phone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      trim: true,
      maxlength: [20, 'رقم الهاتف يجب أن لا يتجاوز 20 رقم'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound unique index on companyId and phone for deduplication
contactSchema.index({ companyId: 1, phone: 1 }, { unique: true, sparse: true })

// Text index for search functionality
contactSchema.index({ fullName: 'text', phone: 'text', email: 'text' })

// Index for soft deletes
contactSchema.index({ deletedAt: 1 })

// Query helper to exclude soft-deleted documents
contactSchema.query.active = function () {
  return this.where({ deletedAt: null })
}

export const Contact: Model<IContact> = 
  mongoose.models.Contact || mongoose.model<IContact>('Contact', contactSchema)
