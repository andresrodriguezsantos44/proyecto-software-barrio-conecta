import mongoose from 'mongoose';
import { config } from './config';
import { Category } from '../businesses/category-model';
import { User } from '../auth/model';
import { hashPassword } from '../auth/service';

/**
 * Seed script: insert predefined categories and one admin user.
 * Safe to run multiple times — uses upsert.
 */
export async function seed(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Seed categories
  const categories = [
    { name: 'Gastronomía', icon: 'restaurant' },
    { name: 'Salud', icon: 'health' },
    { name: 'Hogar', icon: 'home' },
    { name: 'Tecnología', icon: 'computer' },
    { name: 'Educación', icon: 'school' },
    { name: 'Otros', icon: 'category' },
  ];

  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true, new: true },
    );
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  // Seed admin user
  const adminEmail = 'admin@barrioconecta.com';
  const adminPassword = 'admin12345'; // ≥8 chars, will be hashed
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    });
    console.log('✅ Seeded admin user');
  } else {
    console.log('ℹ️  Admin user already exists, skipping');
  }

  console.log('🎉 Seeding complete!');
}

/**
 * Run the seed script when executed directly.
 */
async function runSeed(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    await seed();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Allow direct execution: bun run src/shared/seed.ts
if (import.meta.main) {
  runSeed();
}