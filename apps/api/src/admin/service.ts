import { Report, type ReportDocument } from './model';
import { Business } from '../businesses/model';
import { User } from '../auth/model';
import { Review } from '../reviews/model';
import { AppError } from '../shared/error';
import type { UpdateReportInput, CreateReportInput } from './schemas';
import type { AdminStats, Report as ReportContract } from '@barrio-conecta/contracts';

/**
 * Get all reports, optionally filtered by status.
 * AD-01: Admins MUST view all reports with reason, reporter, and target.
 */
export async function getReports(status?: string): Promise<ReportDocument[]> {
  const filter: Record<string, string> = {};
  if (status) {
    filter.status = status;
  }
  return Report.find(filter).sort({ createdAt: -1 });
}

/**
 * Create a new report (any authenticated user can report).
 */
export async function createReport(
  reporterId: string,
  input: CreateReportInput,
): Promise<ReportDocument> {
  // Verify target exists
  if (input.targetType === 'business') {
    const business = await Business.findById(input.targetId);
    if (!business) {
      throw new AppError(404, 'Reported business not found');
    }
  } else if (input.targetType === 'review') {
    const review = await Review.findById(input.targetId);
    if (!review) {
      throw new AppError(404, 'Reported review not found');
    }
  }

  const report = await Report.create({
    reporter: reporterId,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    description: input.description ?? '',
    status: 'NEW',
  });

  return report;
}

/**
 * Update a report's status.
 * AD-01: Admin can transition status to IN_REVIEW or RESOLVED.
 */
export async function updateReportStatus(
  reportId: string,
  input: UpdateReportInput,
): Promise<ReportDocument> {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError(404, 'Report not found');
  }

  report.status = input.status;
  await report.save();

  // AD-02: If report is resolved and target is a business, deactivate it
  if (input.status === 'RESOLVED' && report.targetType === 'business') {
    await deactivateBusinessByAdmin(report.targetId.toString());
  }

  return report;
}

/**
 * Deactivate a business (admin action).
 * AD-02: Sets isActive=false. Business disappears from search.
 * Also marks any associated NEW reports as RESOLVED.
 */
export async function deactivateBusinessByAdmin(businessId: string): Promise<void> {
  const business = await Business.findById(businessId);
  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  if (!business.isActive) {
    throw new AppError(400, 'Business is already deactivated');
  }

  business.isActive = false;
  await business.save();

  // Mark any NEW/IN_REVIEW reports targeting this business as RESOLVED
  await Report.updateMany(
    { targetType: 'business', targetId: businessId, status: { $in: ['NEW', 'IN_REVIEW'] } },
    { $set: { status: 'RESOLVED' } },
  );
}

/**
 * Get admin dashboard statistics.
 * AD-03: Total users by role, businesses active/inactive, total reviews,
 *         global avg rating, pending reports count.
 */
export async function getStats(): Promise<AdminStats> {
  const [
    totalMerchants,
    totalAdmins,
    totalNeighbors,
    activeBusinesses,
    inactiveBusinesses,
    totalReviews,
    ratingResult,
    pendingReports,
  ] = await Promise.all([
    User.countDocuments({ role: 'merchant' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'neighbor' }),
    Business.countDocuments({ isActive: true }),
    Business.countDocuments({ isActive: false }),
    Review.countDocuments(),
    Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]),
    Report.countDocuments({ status: { $in: ['NEW', 'IN_REVIEW'] } }),
  ]);

  const globalAvgRating = ratingResult.length > 0
    ? Math.round(ratingResult[0].avgRating * 10) / 10
    : 0;

  return {
    totalUsers: totalMerchants + totalAdmins + totalNeighbors,
    usersByRole: {
      merchant: totalMerchants,
      admin: totalAdmins,
      neighbor: totalNeighbors,
    },
    totalBusinesses: {
      active: activeBusinesses,
      inactive: inactiveBusinesses,
    },
    totalReviews,
    globalAvgRating,
    pendingReports,
  };
}

/**
 * Map a ReportDocument to the Report contract shape.
 */
export function toReportResponse(doc: ReportDocument): ReportContract {
  return {
    id: doc.id,
    reporterId: doc.reporter.toString(),
    targetType: doc.targetType,
    targetId: doc.targetId.toString(),
    reason: doc.reason,
    description: doc.description || undefined,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  };
}