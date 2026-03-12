import mongoose, { Schema, Document, Model } from 'mongoose'

// تعريف الأنواع لضمان سلامة البيانات
export type InvitationStatus = 'pending' | 'sent' | 'failed'
export type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe'
export type CheckInStatus = 'pending' | 'checked_in' | 'no_show'

export interface IEventGuest extends Document {
  eventId: mongoose.Types.ObjectId
  contactId?: mongoose.Types.ObjectId // اختياري لدعم الإضافة اليدوية
  companyId: mongoose.Types.ObjectId
  firstName?: string
  lastName?: string
  companion: number
  snapshotName: string
  snapshotPhone: string
  snapshotEmail?: string
  invitationStatus: InvitationStatus
  invitationSentAt?: Date | null
  rsvpStatus: RSVPStatus
  rsvpConfirmedAt?: Date | null
  rsvpMessage?: string
  checkInStatus: CheckInStatus
  checkedInAt?: Date | null
  invitationToken: string
  qrToken: string
  finalInvitationUrl?: string
  scanCount: number
  firstCheckInAt?: Date | null
  lastCheckInAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const eventGuestSchema = new Schema<IEventGuest>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: false, default: null }, 
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    companion: { type: Number, default: 0, min: 0 },
    snapshotName: { type: String, required: true, trim: true },
    snapshotPhone: { type: String, required: true, trim: true },
    snapshotEmail: { type: String, trim: true, lowercase: true },
    invitationStatus: { 
      type: String, 
      enum: ['pending', 'sent', 'failed'], 
      default: 'pending' 
    },
    invitationSentAt: { type: Date, default: null },
    rsvpStatus: { 
      type: String, 
      enum: ['pending', 'confirmed', 'declined', 'maybe'], 
      default: 'pending' 
    },
    rsvpConfirmedAt: { type: Date, default: null },
    rsvpMessage: { type: String, trim: true },
    checkInStatus: { 
      type: String, 
      enum: ['pending', 'checked_in', 'no_show'], 
      default: 'pending' 
    },
    checkedInAt: { type: Date, default: null },
    invitationToken: { type: String, required: true, unique: true, index: true },
    qrToken: { type: String, required: true, unique: true, index: true },
    finalInvitationUrl: { type: String },
    scanCount: { type: Number, default: 0, min: 0 },
    firstCheckInAt: { type: Date, default: null },
    lastCheckInAt: { type: Date, default: null },
  },
  { 
    timestamps: true,
    // تمكين الـ Virtuals عند تحويل الوثيقة إلى JSON أو Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

/**
 * الفهرس الجزئي (Partial Unique Index)
 * يضمن عدم تكرار نفس جهة الاتصال في نفس الفعالية، 
 * لكنه يسمح بتكرار القيمة null في حقل contactId للإضافات اليدوية.
 */
eventGuestSchema.index(
  { eventId: 1, contactId: 1 },
  {
    unique: true,
    partialFilterExpression: { contactId: { $exists: true, $gt: null } },
  }
)

// فهارس إضافية للتقارير والبحث السريع
eventGuestSchema.index({ eventId: 1, rsvpStatus: 1 })
eventGuestSchema.index({ eventId: 1, checkInStatus: 1 })
eventGuestSchema.index({ companyId: 1, checkInStatus: 1 })

// الحقول الافتراضية (Virtuals) للتوافق مع الكود القديم
eventGuestSchema.virtual('name').get(function() { return this.snapshotName; });
eventGuestSchema.virtual('phone').get(function() { return this.snapshotPhone; });
eventGuestSchema.virtual('email').get(function() { return this.snapshotEmail; });

export const EventGuest: Model<IEventGuest> = 
  mongoose.models.EventGuest || mongoose.model<IEventGuest>('EventGuest', eventGuestSchema)