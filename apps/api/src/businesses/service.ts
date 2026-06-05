import { Business, type BusinessDocument } from './model';
import { Category } from './category-model';
import { AppError } from '../shared/error';
import type { CreateBusinessInput, UpdateBusinessInput } from './schemas';


/**
 * Crea un negocio para un comerciante.
 *
 * Aplica la regla **BM-02**: cada comerciante puede tener un único negocio
 * activo. Verifica además que la categoría exista antes de crear.
 *
 * @param ownerId - Id del comerciante dueño.
 * @param input - Datos del negocio (nombre, categoría, ubicación, horario, fotos).
 * @returns El documento del negocio creado.
 * @throws {AppError} 409 si el comerciante ya tiene un negocio activo (BM-02).
 * @throws {AppError} 400 si la categoría indicada no existe.
 */
export async function createBusiness(
  ownerId: string,
  input: CreateBusinessInput,
): Promise<BusinessDocument> {
  // BM-02: Each merchant MAY own only 1 active business
  const existing = await Business.findOne({ owner: ownerId, isActive: true });
  if (existing) {
    throw new AppError(409, 'You already have an active business. Deactivate it before creating a new one.');
  }

  // Verify category exists
  const category = await Category.findById(input.categoryId);
  if (!category) {
    throw new AppError(400, 'Category not found');
  }

  const business = await Business.create({
    name: input.name,
    description: input.description ?? '',
    category: input.categoryId,
    owner: ownerId,
    location: input.location,
    schedule: input.schedule,
    photos: input.photos ?? [],
    isActive: true,
    avgRating: 0,
  });

  return business;
}

/**
 * Update a business by ID (partial update).
 * Only the owner or an admin can update.
 */
export async function updateBusiness(
  businessId: string,
  userId: string,
  userRole: string,
  input: UpdateBusinessInput,
): Promise<BusinessDocument> {
  const business = await Business.findById(businessId);
  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  // Owner or admin check
  if (userRole !== 'admin' && business.owner.toString() !== userId) {
    throw new AppError(403, 'You can only update your own business');
  }

  // If categoryId provided, verify it exists
  if (input.categoryId) {
    const category = await Category.findById(input.categoryId);
    if (!category) {
      throw new AppError(400, 'Category not found');
    }
  }

  const updated = await Business.findByIdAndUpdate(
    businessId,
    { $set: input },
    { new: true, runValidators: true },
  );

  if (!updated) {
    throw new AppError(404, 'Business not found');
  }

  return updated;
}

/**
 * Find all active businesses owned by a specific merchant.
 */
export async function findByOwner(ownerId: string): Promise<BusinessDocument[]> {
  return Business.find({ owner: ownerId, isActive: true });
}

/**
 * Logical deletion: set isActive to false (BM-03).
 * Preserves review history.
 */
export async function deactivateBusiness(
  businessId: string,
  userId: string,
  userRole: string,
): Promise<BusinessDocument> {
  const business = await Business.findById(businessId);
  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  // Owner or admin check
  if (userRole !== 'admin' && business.owner.toString() !== userId) {
    throw new AppError(403, 'You can only deactivate your own business');
  }

  if (!business.isActive) {
    throw new AppError(400, 'Business is already deactivated');
  }

  business.isActive = false;
  await business.save();
  return business;
}

/**
 * Get a single business by ID (must be active).
 */
export async function getBusinessById(businessId: string): Promise<BusinessDocument> {
  const business = await Business.findById(businessId);
  if (!business) {
    throw new AppError(404, 'Business not found');
  }
  if (!business.isActive) {
    throw new AppError(404, 'Business not found');
  }
  return business;
}

/**
 * Map a BusinessDocument to a plain object for response.
 * Converts GeoJSON coordinates to {lat, lng} for API consumers.
 */
export function toBusinessResponse(doc: BusinessDocument) {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    categoryId: doc.category.toString(),
    ownerId: doc.owner.toString(),
    location: {
      lat: doc.location.coordinates[1],
      lng: doc.location.coordinates[0],
    },
    photos: doc.photos,
    schedule: doc.schedule,
    isActive: doc.isActive,
    avgRating: doc.avgRating,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}