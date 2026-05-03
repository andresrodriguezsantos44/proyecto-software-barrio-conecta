import type { Request, Response, NextFunction } from 'express';
import { Category } from '../businesses/category-model';

/**
 * GET /categories
 * Public endpoint — returns all categories for the frontend dropdown.
 */
export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await Category.find().lean();

    const data = categories.map((cat) => ({
      id: (cat as unknown as { _id: { toString(): string } })._id.toString(),
      name: cat.name,
      icon: cat.icon,
    }));

    res.json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
}