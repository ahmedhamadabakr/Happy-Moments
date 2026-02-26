import mongoose, { Schema, Document, Model } from 'mongoose'

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface IWhatsAppMessage extends Document {
  invitationId: mongoose.Types.ObjectId
  eventGuestId: mongoose.Types.ObjectId
  eventId: mongoose.Types.ObjectId
  companyId: mongoose.Types.ObjectId
  phoneNumber: string
  messageText: string
  externalMessageId?: string
  status: MessageStatus
  statusHistory: {
    status: MessageStatus
    timestamp: Date
  }[]
  sentAt?: Date | null
  deliveredAt?: Date | null
  readAt?: Date | null
  failureReason?: string
  createdAt: Date
  updatedAt: Date
}

const whatsappMessageSchema = new Schema<IWhatsAppMessage>(
  {
    invitationId: {
      type: Schema.Types.ObjectId,
      ref: 'Invitation',
      required: true,
      index: true,
    },
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
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    messageText: {
      type: String,
      required: true,
    },
    externalMessageId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
          required: true,
        },
        timestamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
    sentAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Index for finding messages by status
whatsappMessageSchema.index({ companyId: 1, status: 1 })
whatsappMessageSchema.index({ eventId: 1, status: 1 })

export const WhatsAppMessage: Model<IWhatsAppMessage> = 
  mongoose.models.WhatsAppMessage || mongoose.model<IWhatsAppMessage>('WhatsAppMessage', whatsappMessageSchema)
