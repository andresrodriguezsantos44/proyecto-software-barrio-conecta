import mongoose, { type Document, type Types } from 'mongoose';
import type { ReportTargetType, ReportReason, ReportStatus } from '@barrio-conecta/contracts';

/**
 * Report document interface — Mongoose ODM boundary.
 */
export interface ReportDocument extends Document {
  reporter: Types.ObjectId;
  targetType: ReportTargetType;
  targetId: Types.ObjectId;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new mongoose.Schema<ReportDocument>(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    targetType: {
      type: String,
      enum: {
        values: ['business', 'review'] as ReportTargetType[],
        message: 'Target type must be one of: business, review',
      },
      required: [true, 'Target type is required'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
    },
    reason: {
      type: String,
      enum: {
        values: ['spam', 'false_info', 'inappropriate', 'other'] as ReportReason[],
        message: 'Reason must be one of: spam, false_info, inappropriate, other',
      },
      required: [true, 'Reason is required'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description must be 500 characters or fewer'],
    },
    status: {
      type: String,
      enum: {
        values: ['NEW', 'IN_REVIEW', 'RESOLVED'] as ReportStatus[],
        message: 'Status must be one of: NEW, IN_REVIEW, RESOLVED',
      },
      default: 'NEW',
      index: true,
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

// Index for fetching reports by status (admin filtering)
reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model<ReportDocument>('Report', reportSchema);