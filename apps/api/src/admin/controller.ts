import type { Response, NextFunction } from 'express';
import { validate, updateReportSchema, createReportSchema, type UpdateReportInput, type CreateReportInput } from './schemas';
import { getReports, updateReportStatus, deactivateBusinessByAdmin, getStats, toReportResponse, createReport } from './service';
import { AuthenticatedRequest } from '../auth/middleware';

/**
 * GET /admin/reports
 * AD-01: Admins view all reports. Optional ?status= filter.
 */
export async function getReportsHandler(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status = _req.query.status as string | undefined;
    const reports = await getReports(status);
    const data = reports.map(toReportResponse);

    res.json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/reports
 * Create a report (any authenticated user).
 */
export async function createReportHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = validate<CreateReportInput>(createReportSchema, req.body);
    const report = await createReport(req.user!.userId, input);
    const response = toReportResponse(report);

    res.status(201).json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /admin/reports/:reportId
 * AD-01: Admin updates report status (IN_REVIEW or RESOLVED).
 */
export async function updateReportHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reportId = req.params.reportId as string;
    const input = validate<UpdateReportInput>(updateReportSchema, req.body);
    const report = await updateReportStatus(reportId, input);
    const response = toReportResponse(report);

    res.json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /admin/business/:id/deactivate
 * AD-02: Admin deactivates a business. Report becomes RESOLVED.
 */
export async function deactivateBusinessHandler(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const businessId = _req.params.id as string;
    await deactivateBusinessByAdmin(businessId);

    res.json({
      status: 'success',
      data: { id: businessId, isActive: false },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /admin/stats
 * AD-03: Dashboard stats — users by role, businesses, reviews, avg rating, pending reports.
 */
export async function getStatsHandler(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await getStats();

    res.json({
      status: 'success',
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}