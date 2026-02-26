import mongoose, { Schema, Document, Model } from 'mongoose';

export type ScanType = 'first' | 'repeated';

/**
 * سجل كل عملية مسح QR
 * يسمح بتسجيل المسح المتكرر
 */
export interface ICheckInLog extends Document {
  eventGuestId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  scannedBy: mongoose.Types.ObjectId; // الموظف الذي قام بالمسح
  scannedAt: Date;
  scanType: ScanType; // first أو repeated
  scanNumber: number; // رقم المسح (1, 2, 3, ...)
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
  createdAt: Date;
}

const checkInLogSchema = new Schema<ICheckInLog>(
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
    scannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scannedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    scanType: {
      type: String,
      enum: ['first', 'repeated'],
      required: true,
    },
    scanNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index للاستعلامات السريعة
checkInLogSchema.index({ eventId: 1, scannedAt: -1 });
checkInLogSchema.index({ eventGuestId: 1, scannedAt: -1 });
checkInLogSchema.index({ companyId: 1, scannedAt: -1 });

export const CheckInLog: Model<ICheckInLog> =
  mongoose.models.CheckInLog || mongoose.model<ICheckInLog>('CheckInLog', checkInLogSchema);
