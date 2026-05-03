import type { Request, Response, NextFunction } from 'express';
import { validate, createBusinessSchema, updateBusinessSchema, type CreateBusinessInput, type UpdateBusinessInput } from './schemas';
import { createBusiness, updateBusiness, findByOwner, deactivateBusiness, getBusinessById, toBusinessResponse } from './service';
import { AuthenticatedRequest } from '../auth/middleware';

/**
 * POST /businesses
 * Create a new business (merchant only).
 * BM-01: Validates name≥3, category, location, schedule, photos≤3.
 * BM-02: Only one active business per merchant.
 */
export async function createBusinessHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = validate<CreateBusinessInput>(createBusinessSchema, req.body);
    const business = await createBusiness(req.user!.userId, input);
    const response = toBusinessResponse(business);

    res.status(201).json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /businesses/my
 * Return the authenticated merchant's active businesses.
 */
export async function getMyBusinesses(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const businesses = await findByOwner(req.user!.userId);
    const data = businesses.map(toBusinessResponse);

    res.json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /businesses/:id
 * Return a single active business by ID.
 */
export async function getBusiness(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const business = await getBusinessById(id);
    const response = toBusinessResponse(business);

    res.json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /businesses/:id
 * Update a business (owner or admin only).
 */
export async function updateBusinessHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const input = validate<UpdateBusinessInput>(updateBusinessSchema, req.body);
    const business = await updateBusiness(id, req.user!.userId, req.user!.role, input);
    const response = toBusinessResponse(business);

    res.json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /businesses/:id
 * Logical deletion — sets isActive=false (BM-03).
 */
export async function deactivateBusinessHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const business = await deactivateBusiness(id, req.user!.userId, req.user!.role);

    res.json({
      status: 'success',
      data: { id: business.id, isActive: business.isActive },
    });
  } catch (err) {
    next(err);
  }
}