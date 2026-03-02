import mongoose, { Schema, Document, Model } from 'mongoose'

export type EventStatus = 'draft' | 'active' | 'closed'

export interface IEvent extends Document {
  companyId: mongoose.Types.ObjectId
  clientId?: mongoose.Types.ObjectId
  title: string
  description?: string
  eventDate: Date
  eventTime?: string
  location?: string
  locationUrl?: string
  maxGuests?: number
  invitationImage?: string
  qrCoordinates?: {
    x: number
    y: number
    width: number
    height: number
  }
  clientViewToken: string // Token للعرض العام بدون تسجيل دخول
  status: EventStatus
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

const eventSchema = new Schema<IEvent>(
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
    },
    title: {
      type: String,
      required: [true, 'عنوان الفعالية مطلوب'],
      trim: true,
      maxlength: [255, 'العنوان يجب أن لا يتجاوز 255 حرف'],
    },
    description: {
      type: String,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'تاريخ الفعالية مطلوب'],
    },
    eventTime: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [255, 'الموقع يجب أن لا يتجاوز 255 حرف'],
    },
    locationUrl: {
      type: String,
      trim: true,
    },
    maxGuests: {
      type: Number,
      min: [1, 'الحد الأقصى للضيوف يجب أن يكون أكثر من 1'],
    },
    invitationImage: {
      type: String,
    },
    qrCoordinates: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
      width: { type: Number, default: 150 },
      height: { type: Number, default: 150 },
    },
    clientViewToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Indexes for common queries
eventSchema.index({ companyId: 1, status: 1 })
eventSchema.index({ companyId: 1, createdAt: -1 })
eventSchema.index({ deletedAt: 1 })

// Query helper to exclude soft-deleted documents
eventSchema.query.active = function () {
  return this.where({ deletedAt: null })
}

export const Event: Model<IEvent> = 
  mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema)
