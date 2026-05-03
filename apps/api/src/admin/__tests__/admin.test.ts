import { describe, it, expect } from 'bun:test';
import { validate, updateReportSchema, createReportSchema, type UpdateReportInput, type CreateReportInput } from '../schemas';
import { toReportResponse } from '../service';
import { AppError } from '../../shared/error';
import type { ReportDocument } from '../model';

// ---------------------------------------------------------------------------
// Unit: Joi validation — updateReportSchema
// ---------------------------------------------------------------------------
describe('Admin Schemas — updateReportSchema', () => {
  it('should validate IN_REVIEW status', () => {
    const result = validate<UpdateReportInput>(updateReportSchema, { status: 'IN_REVIEW' });
    expect(result.status).toBe('IN_REVIEW');
  });

  it('should validate RESOLVED status', () => {
    const result = validate<UpdateReportInput>(updateReportSchema, { status: 'RESOLVED' });
    expect(result.status).toBe('RESOLVED');
  });

  it('should reject NEW status (not allowed in update)', () => {
    expect(() =>
      validate(updateReportSchema, { status: 'NEW' }),
    ).toThrow(/IN_REVIEW.*RESOLVED/i);
  });

  it('should reject invalid status value', () => {
    expect(() =>
      validate(updateReportSchema, { status: 'INVALID' }),
    ).toThrow();
  });

  it('should reject missing status', () => {
    expect(() =>
      validate(updateReportSchema, {}),
    ).toThrow(/required/i);
  });
});

// ---------------------------------------------------------------------------
// Unit: Joi validation — createReportSchema
// ---------------------------------------------------------------------------
describe('Admin Schemas — createReportSchema', () => {
  const validInput: CreateReportInput = {
    targetType: 'business',
    targetId: '507f1f77bcf86cd799439011',
    reason: 'spam',
  };

  it('should validate a correct report creation payload', () => {
    const result = validate<CreateReportInput>(createReportSchema, validInput);
    expect(result.targetType).toBe('business');
    expect(result.targetId).toBe('507f1f77bcf86cd799439011');
    expect(result.reason).toBe('spam');
  });

  it('should validate all target types', () => {
    const businessResult = validate<CreateReportInput>(createReportSchema, {
      ...validInput,
      targetType: 'business',
    });
    expect(businessResult.targetType).toBe('business');

    const reviewResult = validate<CreateReportInput>(createReportSchema, {
      ...validInput,
      targetType: 'review',
    });
    expect(reviewResult.targetType).toBe('review');
  });

  it('should validate all reason options', () => {
    for (const reason of ['spam', 'false_info', 'inappropriate', 'other'] as const) {
      const result = validate<CreateReportInput>(createReportSchema, {
        ...validInput,
        reason,
      });
      expect(result.reason).toBe(reason);
    }
  });

  it('should validate with optional description', () => {
    const input = { ...validInput, description: 'This is a spam report' };
    const result = validate<CreateReportInput>(createReportSchema, input);
    expect(result.description).toBe('This is a spam report');
  });

  it('should reject invalid targetType', () => {
    expect(() =>
      validate(createReportSchema, { ...validInput, targetType: 'user' }),
    ).toThrow(/business.*review/i);
  });

  it('should reject invalid reason', () => {
    expect(() =>
      validate(createReportSchema, { ...validInput, reason: 'harassment' }),
    ).toThrow(/spam.*false_info.*inappropriate.*other/i);
  });

  it('should reject missing targetType', () => {
    expect(() =>
      validate(createReportSchema, { targetId: '507f1f77bcf86cd799439011', reason: 'spam' }),
    ).toThrow(/required/i);
  });

  it('should reject missing targetId', () => {
    expect(() =>
      validate(createReportSchema, { targetType: 'business', reason: 'spam' }),
    ).toThrow(/required/i);
  });

  it('should reject invalid targetId format', () => {
    expect(() =>
      validate(createReportSchema, { ...validInput, targetId: 'not-a-hex' }),
    ).toThrow();
  });

  it('should reject description longer than 500 chars', () => {
    expect(() =>
      validate(createReportSchema, { ...validInput, description: 'x'.repeat(501) }),
    ).toThrow(/500 characters/i);
  });
});

// ---------------------------------------------------------------------------
// Unit: toReportResponse mapper
// ---------------------------------------------------------------------------
describe('Admin Service — toReportResponse', () => {
  it('should map a report document to response format', () => {
    const mockDoc = {
      id: 'report123',
      reporter: { toString: () => 'user456' },
      targetType: 'business' as const,
      targetId: { toString: () => 'biz789' },
      reason: 'spam' as const,
      status: 'NEW' as const,
      createdAt: new Date('2026-03-01T10:00:00Z'),
    } as unknown as ReportDocument;

    const result = toReportResponse(mockDoc);

    expect(result.id).toBe('report123');
    expect(result.reporterId).toBe('user456');
    expect(result.targetType).toBe('business');
    expect(result.targetId).toBe('biz789');
    expect(result.reason).toBe('spam');
    expect(result.status).toBe('NEW');
  });

  it('should map a resolved review report', () => {
    const mockDoc = {
      id: 'report456',
      reporter: { toString: () => 'neighbor001' },
      targetType: 'review' as const,
      targetId: { toString: () => 'review999' },
      reason: 'inappropriate' as const,
      status: 'RESOLVED' as const,
      createdAt: new Date('2026-03-15T08:30:00Z'),
    } as unknown as ReportDocument;

    const result = toReportResponse(mockDoc);

    expect(result.targetType).toBe('review');
    expect(result.reason).toBe('inappropriate');
    expect(result.status).toBe('RESOLVED');
  });
});

// ---------------------------------------------------------------------------
// Unit: Admin service error types
// ---------------------------------------------------------------------------
describe('Admin Service — error construction', () => {
  it('should create AppError(404) for report not found', () => {
    const err = new AppError(404, 'Report not found');
    expect(err.statusCode).toBe(404);
  });

  it('should create AppError(404) for business not found in deactivation', () => {
    const err = new AppError(404, 'Business not found');
    expect(err.statusCode).toBe(404);
  });

  it('should create AppError(400) for already deactivated business', () => {
    const err = new AppError(400, 'Business is already deactivated');
    expect(err.statusCode).toBe(400);
  });

  it('should create AppError(403) for non-admin access', () => {
    const err = new AppError(403, 'Insufficient permissions');
    expect(err.statusCode).toBe(403);
  });

  it('should create AppError(404) for reported target not found', () => {
    const err = new AppError(404, 'Reported business not found');
    expect(err.statusCode).toBe(404);
  });
});