import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IContact extends Document {
  companyId: mongoose.Types.ObjectId
  clientId?: mongoose.Types.ObjectId
  firstName: string
  lastName: string
  suffix?: string
  phone: string
  companion?: number
  email?: string
  fullName?: string // للتوافق مع الكود القديم
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
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
      default: null,
    },
    firstName: {
      type: String,
      required: [true, 'الاسم الأول مطلوب'],
      trim: true,
      maxlength: [100, 'الاسم الأول يجب أن لا يتجاوز 100 حرف'],
    },
    lastName: {
      type: String,
      required: [true, 'اسم العائلة مطلوب'],
      trim: true,
      maxlength: [100, 'اسم العائلة يجب أن لا يتجاوز 100 حرف'],
    },
    suffix: {
      type: String,
      trim: true,
      maxlength: [50, 'اللقب يجب أن لا يتجاوز 50 حرف'],
    },
    phone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      trim: true,
      maxlength: [20, 'رقم الهاتف يجب أن لا يتجاوز 20 رقم'],
    },
    companion: {
      type: Number,
      min: [0, 'عدد المرافقين يجب أن يكون 0 أو أكثر'],
      default: 0,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Virtual field to generate fullName from firstName and lastName
contactSchema.virtual('computedFullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Pre-save hook to set fullName
contactSchema.pre('save', function(next) {
  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
  }
  next();
});

// Compound unique index on companyId, clientId, and phone for deduplication per client
contactSchema.index({ companyId: 1, clientId: 1, phone: 1 }, { unique: true, sparse: true })

// Index for listing contacts per client
contactSchema.index({ companyId: 1, clientId: 1 })

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
