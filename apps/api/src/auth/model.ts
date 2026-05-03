import mongoose, { type Document } from 'mongoose';
import type { UserRole } from '@barrio-conecta/contracts';

/**
 * User document interface — Mongoose ODM boundary.
 */
export interface UserDocument extends Document {
  email: string;
  password: string; // bcrypt hash
  name: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name must be 100 characters or fewer'],
    },
    role: {
      type: String,
      enum: {
        values: ['merchant', 'admin', 'neighbor'] as UserRole[],
        message: 'Role must be one of: merchant, admin, neighbor',
      },
      default: 'neighbor',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        const obj = ret as Record<string, unknown>;
        obj.id = (obj._id as { toString(): string }).toString();
        delete obj._id;
        delete obj.__v;
        delete obj.password; // Never expose password hash in JSON
        return obj;
      },
    },
  },
);

export const User = mongoose.model<UserDocument>('User', userSchema);