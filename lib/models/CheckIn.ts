import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICheckIn extends Document {
  eventGuestId: mongoose.Types.ObjectId
  eventId: mongoose.Types.ObjectId
  companyId: mongoose.Types.ObjectId
  checkedInBy: mongoose.Types.ObjectId
  checkedInAt: Date
  ipAddress?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const checkInSchema = new Schema<ICheckIn>(
  {
    eventGuestId: {
      type: Schema.Types.ObjectId,
      ref: 'EventGuest',
      required: true,
      unique: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkedInAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for event check-in statistics
checkInSchema.index({ eventId: 1, checkedInAt: -1 })

export const CheckIn: Model<ICheckIn> = 
  mongoose.models.CheckIn || mongoose.model<ICheckIn>('CheckIn', checkInSchema)
