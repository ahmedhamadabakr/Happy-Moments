import mongoose, { Schema, Document, Model } from 'mongoose'

export type InvitationChannelType = 'whatsapp' | 'email' | 'sms'
export type InvitationDeliveryStatus = 'pending' | 'sent' | 'failed' | 'bounced'

export interface IInvitation extends Document {
  eventGuestId: mongoose.Types.ObjectId
  eventId: mongoose.Types.ObjectId
  companyId: mongoose.Types.ObjectId
  channel: InvitationChannelType
  recipientPhone?: string
  recipientEmail?: string
  deliveryStatus: InvitationDeliveryStatus
  externalMessageId?: string
  sentAt?: Date | null
  failureReason?: string
  retryCount: number
  lastRetryAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const invitationSchema = new Schema<IInvitation>(
  {
    eventGuestId: {
      type: Schema.Types.ObjectId,
      ref: 'EventGuest',
      required: true,
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
    channel: {
      type: String,
      enum: ['whatsapp', 'email', 'sms'],
      default: 'whatsapp',
    },
    recipientPhone: {
      type: String,
      trim: true,
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'bounced'],
      default: 'pending',
    },
    externalMessageId: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRetryAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Unique per guest per channel
invitationSchema.index({ eventGuestId: 1, channel: 1 }, { unique: true })

// For finding pending invitations to retry
invitationSchema.index({ deliveryStatus: 1, lastRetryAt: 1 })

export const Invitation: Model<IInvitation> = 
  mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', invitationSchema)
