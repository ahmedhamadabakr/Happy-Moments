import mongoose, { Schema, Document, Model } from 'mongoose'

export type ActivityType = 
  | 'contact_upload'
  | 'contact_delete'
  | 'event_create'
  | 'event_update'
  | 'event_delete'
  | 'invitation_send'
  | 'rsvp_response'
  | 'check_in'
  | 'export'

export interface IActivityLog extends Document {
  companyId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  activityType: ActivityType
  resourceType: string
  resourceId: mongoose.Types.ObjectId
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: [
        'contact_upload',
        'contact_delete',
        'event_create',
        'event_update',
        'event_delete',
        'invitation_send',
        'rsvp_response',
        'check_in',
        'export',
      ],
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Index for audit trail queries
activityLogSchema.index({ companyId: 1, createdAt: -1 })
activityLogSchema.index({ userId: 1, createdAt: -1 })
activityLogSchema.index({ activityType: 1, createdAt: -1 })

export const ActivityLog: Model<IActivityLog> = 
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema)
