import mongoose from 'mongoose';
import { config } from './config';
import { Category } from '../businesses/category-model';
import { User } from '../auth/model';
import { hashPassword } from '../auth/service';
import { Business } from '../businesses/model';

/**
 * Seed script: insert predefined categories, admin user, and initial businesses.
 * Safe to run multiple times — uses upsert.
 */
export async function seed(): Promise<void> {
  console.log('🌱 Seeding database...');

  // 1. Seed categories
  const categoriesData = [
    { name: 'Gastronomía', icon: 'restaurant' },
    { name: 'Salud', icon: 'health' },
    { name: 'Hogar', icon: 'home' },
    { name: 'Tecnología', icon: 'computer' },
    { name: 'Educación', icon: 'school' },
    { name: 'Otros', icon: 'category' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const doc = await Category.findOneAndUpdate(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true, new: true },
    );
    categories.push(doc);
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  // 2. Seed admin user (to act as business owner)
  const adminEmail = 'admin@barrioconecta.com';
  const adminPassword = 'admin12345';
  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    const hashedPassword = await hashPassword(adminPassword);
    admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    });
    console.log('✅ Seeded admin user');
  } else {
    console.log('ℹ️  Admin user already exists, skipping');
  }

  // 3. Seed businesses (near Sabaneta/Itagüí border)
  // User testing point approx: [lng: -75.608, lat: 6.188]
  const businesses = [
    {
      name: 'La Tienda de Doña Rosa',
      description: 'Las mejores arepas del barrio.',
      categoryName: 'Gastronomía',
      lng: -75.6085,
      lat: 6.1882,
      photos: ['https://lanotaeconomica.com.co/wp-content/uploads/elementor/thumbs/PLAZA_EGAnA-2-q063v7hm05vy04oje7fgo3d9aq354wtznecyneky2k.jpg'],
    },
    {
      name: 'Farmacia El Alivio',
      description: 'Atención 24 horas y domicilios rápidos.',
      categoryName: 'Salud',
      lng: -75.6078,
      lat: 6.1895,
      photos: ['https://extendeal.com/hubfs/young-hispanic-woman-pharmacist-smiling-confident-standing-with-arms-crossed-gesture-pharmacy.jpg'],
    },
    {
      name: 'Ferretería El Tornillo',
      description: 'Todo para el hogar y la construcción.',
      categoryName: 'Hogar',
      lng: -75.6095,
      lat: 6.1875,
      photos: ['https://www.shutterstock.com/image-photo/positive-friendly-store-girl-employee-600w-2447745875.jpg'],
    },
    {
      name: 'Tech Solutions Sabaneta',
      description: 'Reparación de celulares y computadores.',
      categoryName: 'Tecnología',
      lng: -75.6065,
      lat: 6.1908,
      photos: ['https://www.shutterstock.com/image-photo/positive-friendly-store-girl-employee-600w-2447745875.jpg'],
    },
    {
      name: 'Academia Saber',
      description: 'Clases de refuerzo y nivelación escolar.',
      categoryName: 'Educación',
      lng: -75.6102,
      lat: 6.1865,
      photos: ['https://lanotaeconomica.com.co/wp-content/uploads/elementor/thumbs/PLAZA_EGAnA-2-q063v7hm05vy04oje7fgo3d9aq354wtznecyneky2k.jpg'],
    },
  ];

  const defaultSchedule = {
    mon: { open: '08:00', close: '18:00' },
    tue: { open: '08:00', close: '18:00' },
    wed: { open: '08:00', close: '18:00' },
    thu: { open: '08:00', close: '18:00' },
    fri: { open: '08:00', close: '18:00' },
    sat: { open: '09:00', close: '14:00' },
    sun: { open: '00:00', close: '00:00' },
  };

  for (const b of businesses) {
    const category = categories.find((c) => c.name === b.categoryName);
    if (!category) continue;

    await Business.findOneAndUpdate(
      { name: b.name },
      {
        $set: {
          name: b.name,
          description: b.description,
          category: category._id,
          owner: admin._id,
          location: {
            type: 'Point',
            coordinates: [b.lng, b.lat],
          },
          photos: b.photos,
          schedule: defaultSchedule,
          isActive: true,
        },
        $setOnInsert: {
          avgRating: 4.5,
        },
      },
      { upsert: true },
    );
  }

  console.log(`✅ Seeded ${businesses.length} businesses near Sabaneta`);
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