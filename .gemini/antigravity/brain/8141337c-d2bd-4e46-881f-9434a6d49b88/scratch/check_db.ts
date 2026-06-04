import mongoose from 'mongoose';
import { config } from '../apps/api/src/shared/config';
import { Business } from '../apps/api/src/businesses/model';

async function checkBusinesses() {
  await mongoose.connect(config.mongoUri);
  const businesses = await Business.find({}).populate('categoryId');
  console.log(`Found ${businesses.length} businesses:`);
  businesses.forEach(b => {
    console.log(`- ${b.name} (${b.categoryId.name}): [${b.location.coordinates}]`);
  });
  await mongoose.disconnect();
}

checkBusinesses();
