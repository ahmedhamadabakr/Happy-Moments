import mongoose, { Schema, Document, Model } from 'mongoose'

export type InvitationStatus = 'pending' | 'sent' | 'failed'
export type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe'
export type CheckInStatus = 'pending' | 'checked_in' | 'no_show'

export interface IEventGuest extends Document {
  eventId: mongoose.Types.ObjectId
  contactId: mongoose.Types.ObjectId
  companyId: mongoose.Types.ObjectId
  snapshotName: string
  snapshotPhone: string
  snapshotEmail?: string
  invitationStatus: InvitationStatus
  invitationSentAt?: Date | null
  rsvpStatus: RSVPStatus
  rsvpConfirmedAt?: Date | null
  checkInStatus: CheckInStatus
  checkedInAt?: Date | null
  invitationToken: string
  qrCodeUrl?: string
  createdAt: Date
  updatedAt: Date
}

const eventGuestSchema = new Schema<IEventGuest>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    snapshotName: {
      type: String,
      required: true,
      trim: true,
    },
    snapshotPhone: {
      type: String,
      required: true,
      trim: true,
    },
    snapshotEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    invitationStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    invitationSentAt: {
      type: Date,
      default: null,
    },
    rsvpStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'declined', 'maybe'],
      default: 'pending',
    },
    rsvpConfirmedAt: {
      type: Date,
      default: null,
    },
    checkInStatus: {
      type: String,
      enum: ['pending', 'checked_in', 'no_show'],
      default: 'pending',
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    invitationToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCodeUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Unique compound index to prevent duplicates
eventGuestSchema.index({ eventId: 1, contactId: 1 }, { unique: true })

// Index for invitation lookup by token
eventGuestSchema.index({ invitationToken: 1 })

// Index for event guest statistics
eventGuestSchema.index({ eventId: 1, rsvpStatus: 1 })
eventGuestSchema.index({ eventId: 1, checkInStatus: 1 })

export const EventGuest: Model<IEventGuest> = 
  mongoose.models.EventGuest || mongoose.model<IEventGuest>('EventGuest', eventGuestSchema)
