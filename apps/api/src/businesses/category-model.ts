import mongoose, { type Document } from 'mongoose';

/**
 * Category document interface — predefined business categories.
 */
export interface CategoryDocument extends Document {
  name: string;
  icon: string;
}

const categorySchema = new mongoose.Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      required: [true, 'Category icon is required'],
      trim: true,
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

export const Category = mongoose.model<CategoryDocument>('Category', categorySchema);