import mongoose, { type Document, type Types } from 'mongoose';

/**
 * Review document interface — Mongoose ODM boundary.
 */
export interface ReviewDocument extends Document {
  business: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema<ReviewDocument>(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      default: '',
      maxlength: [300, 'Comment must be 300 characters or fewer'],
    },
    reply: {
      type: String,
      maxlength: [300, 'Reply must be 300 characters or fewer'],
      default: null,
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

// Index for fetching reviews by business (most common query)
reviewSchema.index({ business: 1, createdAt: -1 });

export const Review = mongoose.model<ReviewDocument>('Review', reviewSchema);