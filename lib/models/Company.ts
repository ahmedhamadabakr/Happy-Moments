import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  email: string;
  phone?: string;
  logo?: string;
  website?: string;
  industry?: string;
  employees?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [100, 'Company name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Company email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    website: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    employees: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Company =
  mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
