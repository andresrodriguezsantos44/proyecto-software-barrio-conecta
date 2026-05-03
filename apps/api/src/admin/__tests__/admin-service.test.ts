import { describe, it, expect } from 'bun:test';
import { toReportResponse } from '../service';
import type { ReportDocument } from '../model';

// ---------------------------------------------------------------------------
// Unit: toReportResponse — comprehensive coverage
// ---------------------------------------------------------------------------
describe('Admin Service — toReportResponse (comprehensive)', () => {
  it('should map report with all fields including description', () => {
    const mockDoc = {
      id: 'rpt001',
      reporter: { toString: () => 'user001' },
      targetType: 'business' as const,
      targetId: { toString: () => 'biz001' },
      reason: 'spam' as const,
      description: 'This business is spamming',
      status: 'NEW' as const,
      createdAt: new Date('2026-04-01T10:00:00Z'),
    } as unknown as ReportDocument;

    const result = toReportResponse(mockDoc);

    expect(result.id).toBe('rpt001');
    expect(result.reporterId).toBe('user001');
    expect(result.targetType).toBe('business');
    expect(result.targetId).toBe('biz001');
    expect(result.reason).toBe('spam');
    expect(result.description).toBe('This business is spamming');
    expect(result.status).toBe('NEW');
  });

  it('should map report with empty description as undefined', () => {
    const mockDoc = {
      id: 'rpt002',
      reporter: { toString: () => 'user002' },
      targetType: 'review' as const,
      targetId: { toString: () => 'review500' },
      reason: 'inappropriate' as const,
      description: '',
      status: 'IN_REVIEW' as const,
      createdAt: new Date('2026-04-02T12:00:00Z'),
    } as unknown as ReportDocument;

    const result = toReportResponse(mockDoc);

    expect(result.description).toBeUndefined();
    expect(result.status).toBe('IN_REVIEW');
    expect(result.targetType).toBe('review');
  });

  it('should map report with RESOLVED status', () => {
    const mockDoc = {
      id: 'rpt003',
      reporter: { toString: () => 'admin1' },
      targetType: 'business' as const,
      targetId: { toString: () => 'biz999' },
      reason: 'false_info' as const,
      description: 'False advertising',
      status: 'RESOLVED' as const,
      createdAt: new Date('2026-04-03T15:00:00Z'),
    } as unknown as ReportDocument;

    const result = toReportResponse(mockDoc);

    expect(result.status).toBe('RESOLVED');
    expect(result.reason).toBe('false_info');
    expect(result.description).toBe('False advertising');
  });

  it('should map report with reason "other"', () => {
    const mockDoc = {
      id: 'rpt004',
      reporter: { toString: () => 'neighbor1' },
      targetType: 'review' as const,
      targetId: { toString: () => 'rev100' },
      reason: 'other' as const,
      description: 'Some other issue',
      status: 'NEW' as const,
      createdAt: new Date('2026-04-04T08:00:00Z'),
    } as unknown as ReportDocument;

    const result = toReportResponse(mockDoc);

    expect(result.reason).toBe('other');
    expect(result.reporterId).toBe('neighbor1');
  });
});

// ---------------------------------------------------------------------------
// Unit: Admin error types (comprehensive)
// ---------------------------------------------------------------------------
describe('Admin Service — error types (comprehensive)', () => {
  it('should create AppError(404) for report not found', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(404, 'Report not found');
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  it('should create AppError(404) for business not found (deactivation)', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(404, 'Business not found');
    expect(err.statusCode).toBe(404);
  });

  it('should create AppError(400) for already deactivated business', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(400, 'Business is already deactivated');
    expect(err.statusCode).toBe(400);
  });

  it('should create AppError(403) for non-admin access', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(403, 'Insufficient permissions');
    expect(err.statusCode).toBe(403);
  });

  it('should create AppError(404) for reported target not found', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(404, 'Reported business not found');
    expect(err.statusCode).toBe(404);
  });
});