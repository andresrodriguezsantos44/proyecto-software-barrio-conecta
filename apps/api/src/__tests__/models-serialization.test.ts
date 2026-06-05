// ============================================================================
// Unit: Mongoose toJSON transforms
// Each model exposes a virtual `id`, hides `_id`/`__v`, and (for User) never
// leaks the password hash. These transforms run on serialization, so we
// exercise them directly — no DB connection required to build a document.
// ============================================================================

import { describe, it, expect } from 'bun:test';
import mongoose from 'mongoose';
import { User } from '../auth/model';
import { Business } from '../businesses/model';
import { Category } from '../businesses/category-model';
import { Review } from '../reviews/model';
import { Report } from '../admin/model';

const oid = () => new mongoose.Types.ObjectId();

describe('Model serialization — toJSON transforms', () => {
  it('User.toJSON exposes id and strips _id, __v and password', () => {
    const user = new User({ email: 'a@barrio.com', password: 'secret-hash', name: 'Ana', role: 'neighbor' });
    const json = user.toJSON() as Record<string, unknown>;

    expect(json.id).toBe(user._id.toString());
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
    expect(json.password).toBeUndefined();
    expect(json.email).toBe('a@barrio.com');
  });

  it('Business.toJSON exposes id and strips _id/__v', () => {
    const biz = new Business({
      name: 'Panadería',
      category: oid(),
      owner: oid(),
      location: { type: 'Point', coordinates: [-74.08, 4.6] },
      schedule: {
        mon: { open: '08:00', close: '18:00' },
        tue: { open: '08:00', close: '18:00' },
        wed: { open: '08:00', close: '18:00' },
        thu: { open: '08:00', close: '18:00' },
        fri: { open: '08:00', close: '18:00' },
        sat: { open: '09:00', close: '13:00' },
        sun: { open: '09:00', close: '13:00' },
      },
    });
    const json = biz.toJSON() as Record<string, unknown>;
    expect(json.id).toBe(biz._id.toString());
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });

  it('Category.toJSON exposes id and strips _id/__v', () => {
    const cat = new Category({ name: 'Ferretería', icon: '🔧' });
    const json = cat.toJSON() as Record<string, unknown>;
    expect(json.id).toBe(cat._id.toString());
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });

  it('Review.toJSON exposes id and strips _id/__v', () => {
    const review = new Review({ business: oid(), user: oid(), rating: 5, comment: 'Genial' });
    const json = review.toJSON() as Record<string, unknown>;
    expect(json.id).toBe(review._id.toString());
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });

  it('Report.toJSON exposes id and strips _id/__v', () => {
    const report = new Report({
      reporter: oid(),
      targetType: 'business',
      targetId: oid(),
      reason: 'spam',
      status: 'NEW',
    });
    const json = report.toJSON() as Record<string, unknown>;
    expect(json.id).toBe(report._id.toString());
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });
});
