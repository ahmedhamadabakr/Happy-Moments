import mongoose, { Schema, Document, Model } from 'mongoose'

export type RSVPResponse = 'confirmed' | 'declined' | 'maybe'

export interface IRSVP extends Document {
  eventGuestId: mongoose.Types.ObjectId
  eventId: mongoose.Types.ObjectId
  companyId: mongoose.Types.ObjectId
  response: RSVPResponse
  notes?: string
  ipAddress?: string
  userAgent?: string
  respondedAt: Date
  createdAt: Date
  updatedAt: Date
}

const rsvpSchema = new Schema<IRSVP>(
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
    response: {
      type: String,
      enum: ['confirmed', 'declined', 'maybe'],
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'الملاحظات يجب أن لا تتجاوز 500 حرف'],
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    respondedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Index for response statistics
rsvpSchema.index({ eventId: 1, response: 1 })

export const RSVP: Model<IRSVP> = 
  mongoose.models.RSVP || mongoose.model<IRSVP>('RSVP', rsvpSchema)
