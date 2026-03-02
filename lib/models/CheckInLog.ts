import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckInLog extends Document {
  event: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId;
  scannedBy: mongoose.Types.ObjectId;
  scannedAt: Date;
  scanType: 'first' | 'repeated';
  scanMethod: 'qr' | 'manual';
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo?: string;
  createdAt: Date;
}

const CheckInLogSchema = new Schema<ICheckInLog>(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventGuest',
      required: true,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    scanType: {
      type: String,
      enum: ['first', 'repeated'],
      required: true,
    },
    scanMethod: {
      type: String,
      enum: ['qr', 'manual'],
      default: 'qr',
    },
    location: {
      latitude: Number,
      longitude: Number,
    },
    deviceInfo: String,
  },
  { timestamps: true }
);

// Indexes for efficient queries
CheckInLogSchema.index({ event: 1, guest: 1 });
CheckInLogSchema.index({ event: 1, scannedAt: -1 });
CheckInLogSchema.index({ scannedBy: 1, scannedAt: -1 });

export const CheckInLog =
  mongoose.models.CheckInLog || mongoose.model<ICheckInLog>('CheckInLog', CheckInLogSchema);
