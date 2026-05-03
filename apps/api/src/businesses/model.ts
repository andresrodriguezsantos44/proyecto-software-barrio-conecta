import mongoose, { type Document, type Types } from 'mongoose';

/**
 * Business document interface — Mongoose ODM boundary.
 */
export interface BusinessDocument extends Document {
  name: string;
  description: string;
  category: Types.ObjectId;
  owner: Types.ObjectId;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  photos: string[];
  schedule: Record<string, { open: string; close: string }>;
  isActive: boolean;
  avgRating: number;
  createdAt: Date;
  updatedAt: Date;
}

const daySchema = new mongoose.Schema(
  {
    open: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    close: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  },
  { _id: false },
);

const scheduleWeekSchema = new mongoose.Schema(
  {
    mon: { type: daySchema, required: true },
    tue: { type: daySchema, required: true },
    wed: { type: daySchema, required: true },
    thu: { type: daySchema, required: true },
    fri: { type: daySchema, required: true },
    sat: { type: daySchema, required: true },
    sun: { type: daySchema, required: true },
  },
  { _id: false },
);

const businessSchema = new mongoose.Schema<BusinessDocument>(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      minlength: [3, 'Business name must be at least 3 characters'],
      maxlength: [100, 'Business name must be 100 characters or fewer'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description must be 500 characters or fewer'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: 'Coordinates must contain exactly 2 numbers [lng, lat]',
        },
      },
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 3,
        message: 'Maximum 3 photos allowed',
      },
    },
    schedule: {
      type: scheduleWeekSchema,
      required: [true, 'Business schedule is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
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
        return obj;
      },
    },
  },
);

// Geospatial index for $near queries (GS-02)
businessSchema.index({ location: '2dsphere' });

export const Business = mongoose.model<BusinessDocument>('Business', businessSchema);