import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'user';
  company: mongoose.Types.ObjectId;
  isActive: boolean;
  refreshTokens: {
    token: string;
    createdAt: Date;
    expiresAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient queries
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ company: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
