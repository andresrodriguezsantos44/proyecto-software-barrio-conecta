<script setup lang="ts">
// ============================================================================
// BarrioConecta — Merchant Dashboard View
// My business CRUD with Vuelidate-validated forms and review reply management.
// Full MVP implementation per spec BM-01 through BM-03 and RV-03.
// ============================================================================
import { ref, onMounted, reactive, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength } from '@vuelidate/validators';
import { useBusinessStore, useReviewsStore, useCategoriesStore } from '@/stores';
import StarRating from '@/components/StarRating.vue';
import type { BusinessScheduleWeek, CreateBusinessRequest, UpdateBusinessRequest } from '@barrio-conecta/contracts';

const businessStore = useBusinessStore();
const reviewsStore = useReviewsStore();
const categoriesStore = useCategoriesStore();

// --- View State ---
const showCreateForm = ref(false);
const editingBusinessId = ref<string | null>(null);
const replyingToReviewId = ref<string | null>(null);
const replyContent = ref('');

// --- Default schedule ---
function defaultSchedule(): BusinessScheduleWeek {
  return {
    mon: { open: '08:00', close: '18:00' },
    tue: { open: '08:00', close: '18:00' },
    wed: { open: '08:00', close: '18:00' },
    thu: { open: '08:00', close: '18:00' },
    fri: { open: '08:00', close: '18:00' },
    sat: { open: '09:00', close: '14:00' },
    sun: { open: '00:00', close: '00:00' },
  };
}

// --- Create/Edit Form ---
const formName = ref('');
const formDescription = ref('');
const formCategoryId = ref('');
const formLat = ref(4.60);
const formLng = ref(-74.08);
const formSchedule = reactive<BusinessScheduleWeek>(defaultSchedule());
const formPhotos = ref<string[]>([]);
const newPhotoUrl = ref('');

const dayLabels: Record<string, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
};

// Vuelidate rules for business form
const businessRules = computed(() => ({
  formName: { required, minLength: minLength(3), maxLength: maxLength(100) },
  formDescription: { maxLength: maxLength(500) },
  formCategoryId: { required },
  formLat: { required },
  formLng: { required },
}));

const businessV$ = useVuelidate(businessRules, { formName, formDescription, formCategoryId, formLat, formLng });

// --- Reply Vuelidate ---
const replyV$ = useVuelidate(
  { replyContent: { required, maxLength: maxLength(300) } },
  { replyContent },
);

// --- Business CRUD ---
function openCreateForm(): void {
  formName.value = '';
  formDescription.value = '';
  formCategoryId.value = '';
  formLat.value = 4.60;
  formLng.value = -74.08;
  Object.assign(formSchedule, defaultSchedule());
  formPhotos.value = [];
  newPhotoUrl.value = '';
  editingBusinessId.value = null;
  showCreateForm.value = true;
  businessV$.value.$reset();
}

function openEditForm(biz: { id: string; name: string; description?: string; categoryId: string; location: { lat: number; lng: number }; photos: string[]; schedule: BusinessScheduleWeek }): void {
  formName.value = biz.name;
  formDescription.value = biz.description ?? '';
  formCategoryId.value = biz.categoryId;
  formLat.value = biz.location.lat;
  formLng.value = biz.location.lng;
  Object.assign(formSchedule, biz.schedule);
  formPhotos.value = [...biz.photos];
  newPhotoUrl.value = '';
  editingBusinessId.value = biz.id;
  showCreateForm.value = true;
  businessV$.value.$reset();
}

async function submitBusinessForm(): Promise<void> {
  businessV$.value.$touch();
  if (businessV$.value.$invalid) return;

  const payload: CreateBusinessRequest | UpdateBusinessRequest = {
    name: formName.value,
    description: formDescription.value || undefined,
    categoryId: formCategoryId.value,
    location: {
      type: 'Point',
      coordinates: [formLng.value, formLat.value],
    },
    schedule: { ...formSchedule },
    photos: formPhotos.value.length > 0 ? formPhotos.value : undefined,
  };

  try {
    if (editingBusinessId.value) {
      // Update existing business
      const updatePayload: UpdateBusinessRequest = {
        name: formName.value,
        description: formDescription.value || undefined,
        categoryId: formCategoryId.value,
        location: {
          type: 'Point',
          coordinates: [formLng.value, formLat.value],
        },
        schedule: { ...formSchedule },
        photos: formPhotos.value.length > 0 ? formPhotos.value : undefined,
      };
      await businessStore.updateBusiness(editingBusinessId.value, updatePayload);
    } else {
      await businessStore.createBusiness(payload as CreateBusinessRequest);
    }
    showCreateForm.value = false;
    await businessStore.fetchMyBusinesses();
  } catch {
    // Error is in businessStore.error
  }
}

async function handleDeactivate(id: string): Promise<void> {
  if (!confirm('¿Estás seguro de que quieres desactivar este negocio? Esta acción no se puede deshacer.')) return;
  try {
    await businessStore.deactivateBusiness(id);
  } catch {
    // Error is in businessStore.error
  }
}

// --- Photo management ---
function addPhoto(): void {
  if (newPhotoUrl.value.trim() && formPhotos.value.length < 3) {
    formPhotos.value.push(newPhotoUrl.value.trim());
    newPhotoUrl.value = '';
  }
}

function removePhoto(index: number): void {
  formPhotos.value.splice(index, 1);
}

// --- Review replies ---
async function submitReply(reviewId: string): Promise<void> {
  replyV$.value.$touch();
  if (replyV$.value.$invalid) return;

  try {
    await reviewsStore.replyToReview(reviewId, replyContent.value);
    replyingToReviewId.value = null;
    replyContent.value = '';
    replyV$.value.$reset();
  } catch {
    // Error is in reviewsStore.error
  }
}

async function loadReviews(businessId: string): Promise<void> {
  await reviewsStore.fetchBusinessReviews(businessId);
}

// --- Init ---
onMounted(async () => {
  await businessStore.fetchMyBusinesses();
  if (categoriesStore.categories.length === 0) {
    await categoriesStore.fetchCategories();
  }
});
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Mi Negocio</h1>
      <button
        v-if="!showCreateForm && businessStore.myBusinesses.length === 0"
        class="btn-primary"
        @click="openCreateForm"
      >
        + Registrar Negocio
      </button>
    </div>

    <!-- Error display -->
    <div v-if="businessStore.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ businessStore.error }}
    </div>

    <!-- Loading State -->
    <div v-if="businessStore.loading && businessStore.myBusinesses.length === 0" class="text-center py-12 text-gray-500">
      <span class="text-4xl block mb-4">⏳</span>
      Cargando...
    </div>

    <!-- Create/Edit Business Form -->
    <div v-if="showCreateForm" class="card mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        {{ editingBusinessId ? 'Editar Negocio' : 'Registrar Nuevo Negocio' }}
      </h2>

      <form @submit.prevent="submitBusinessForm" class="space-y-4">
        <!-- Name -->
        <div>
          <label for="biz-name" class="block text-sm font-medium text-gray-700 mb-1">
            Nombre del negocio <span class="text-red-500">*</span>
          </label>
          <input
            id="biz-name"
            v-model="formName"
            type="text"
            class="input-field"
            placeholder="Mínimo 3 caracteres"
          />
          <p v-if="businessV$.formName.$error" class="mt-1 text-sm text-red-600">
            <span v-if="businessV$.formName.required?.$invalid">El nombre es requerido</span>
            <span v-else-if="businessV$.formName.minLength?.$invalid">Mínimo 3 caracteres</span>
          </p>
        </div>

        <!-- Description -->
        <div>
          <label for="biz-desc" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            id="biz-desc"
            v-model="formDescription"
            class="input-field"
            rows="3"
            maxlength="500"
            placeholder="Describe tu negocio..."
          />
          <p class="text-xs text-gray-400 text-right">{{ formDescription.length }}/500</p>
        </div>

        <!-- Category -->
        <div>
          <label for="biz-category" class="block text-sm font-medium text-gray-700 mb-1">
            Categoría <span class="text-red-500">*</span>
          </label>
          <select
            id="biz-category"
            v-model="formCategoryId"
            class="input-field"
          >
            <option value="" disabled>Selecciona una categoría</option>
            <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
          <p v-if="businessV$.formCategoryId.$error" class="mt-1 text-sm text-red-600">
            Selecciona una categoría
          </p>
        </div>

        <!-- Location -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="biz-lat" class="block text-sm font-medium text-gray-700 mb-1">
              Latitud <span class="text-red-500">*</span>
            </label>
            <input
              id="biz-lat"
              v-model.number="formLat"
              type="number"
              step="any"
              class="input-field"
              placeholder="4.60"
            />
          </div>
          <div>
            <label for="biz-lng" class="block text-sm font-medium text-gray-700 mb-1">
              Longitud <span class="text-red-500">*</span>
            </label>
            <input
              id="biz-lng"
              v-model.number="formLng"
              type="number"
              step="any"
              class="input-field"
              placeholder="-74.08"
            />
          </div>
        </div>

        <!-- Schedule -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Horario de atención</label>
          <div class="space-y-2">
            <div
              v-for="(label, key) in dayLabels"
              :key="key"
              class="grid grid-cols-3 gap-3 items-center"
            >
              <span class="text-sm font-medium text-gray-700">{{ label }}</span>
              <input
                v-model="formSchedule[key as keyof BusinessScheduleWeek].open"
                type="text"
                class="input-field text-sm py-1"
                placeholder="08:00"
              />
              <input
                v-model="formSchedule[key as keyof BusinessScheduleWeek].close"
                type="text"
                class="input-field text-sm py-1"
                placeholder="18:00"
              />
            </div>
          </div>
        </div>

        <!-- Photos -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fotos (máximo 3 URLs)</label>
          <div class="space-y-2">
            <div
              v-for="(photo, idx) in formPhotos"
              :key="idx"
              class="flex items-center gap-2"
            >
              <span class="text-sm text-gray-600 truncate flex-1">{{ photo }}</span>
              <button
                type="button"
                class="text-red-500 hover:text-red-700 text-sm"
                @click="removePhoto(idx)"
              >
                ✕
              </button>
            </div>
            <div v-if="formPhotos.length < 3" class="flex gap-2">
              <input
                v-model="newPhotoUrl"
                type="url"
                class="input-field flex-1"
                placeholder="https://ejemplo.com/foto.jpg"
                @keyup.enter="addPhoto"
              />
              <button
                type="button"
                class="btn-secondary text-sm"
                :disabled="!newPhotoUrl.trim() || formPhotos.length >= 3"
                @click="addPhoto"
              >
                + Agregar
              </button>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex gap-3 pt-2">
          <button type="submit" class="btn-primary" :disabled="businessStore.loading">
            {{ businessStore.loading ? 'Guardando...' : (editingBusinessId ? 'Guardar Cambios' : 'Crear Negocio') }}
          </button>
          <button
            type="button"
            class="btn-secondary"
            @click="showCreateForm = false; businessV$.$reset()"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Empty State -->
    <div v-else-if="businessStore.myBusinesses.length === 0" class="text-center py-12">
      <p class="text-4xl mb-4">🏪</p>
      <p class="text-gray-500 mb-4">Aún no tienes un negocio registrado.</p>
      <button class="btn-primary" @click="openCreateForm">Registrar Negocio</button>
    </div>

    <!-- Business List -->
    <div v-else class="space-y-6">
      <div v-for="biz in businessStore.myBusinesses" :key="biz.id" class="card">
        <!-- Business Header -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold text-gray-900">{{ biz.name }}</h2>
              <span v-if="biz.isActive" class="badge bg-green-100 text-green-800">Activo</span>
              <span v-else class="badge bg-red-100 text-red-800">Inactivo</span>
            </div>
            <div class="mt-1 flex items-center gap-2">
              <StarRating :rating="biz.avgRating" size="sm" />
              <span class="text-sm text-gray-500">({{ biz.avgRating.toFixed(1) }})</span>
            </div>
            <p v-if="biz.description" class="mt-2 text-sm text-gray-600">{{ biz.description }}</p>
          </div>
          <div class="flex gap-2 ml-4">
            <button class="btn-secondary text-sm" @click="openEditForm(biz)">Editar</button>
            <button class="btn-danger text-sm" @click="handleDeactivate(biz.id)">Desactivar</button>
          </div>
        </div>

        <!-- Reviews Section for this business -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-700">Reseñas</h3>
            <button
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              @click="loadReviews(biz.id)"
            >
              Ver reseñas
            </button>
          </div>

          <!-- Show reviews if this business's reviews are loaded -->
          <div v-if="reviewsStore.businessReviews.length > 0 && reviewsStore.businessReviews[0]?.businessId === biz.id">
            <div class="space-y-3">
              <div
                v-for="review in reviewsStore.businessReviews"
                :key="review.id"
                class="p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <StarRating :rating="review.rating" size="sm" />
                    <span class="text-xs text-gray-400">
                      {{ new Date(review.createdAt).toLocaleDateString('es-CO') }}
                    </span>
                  </div>
                </div>
                <p v-if="review.comment" class="mt-1 text-sm text-gray-700">{{ review.comment }}</p>

                <!-- Reply display -->
                <div v-if="review.reply" class="mt-2 ml-3 p-2 bg-primary-50 rounded text-sm">
                  <span class="font-medium text-primary-700">Tu respuesta:</span>
                  {{ review.reply }}
                </div>

                <!-- Reply form (only if no reply yet) -->
                <div v-else class="mt-2">
                  <div v-if="replyingToReviewId === review.id" class="ml-3">
                    <textarea
                      v-model="replyContent"
                      class="input-field text-sm"
                      rows="2"
                      maxlength="300"
                      placeholder="Escribe tu respuesta..."
                    />
                    <p v-if="replyV$.replyContent?.$error" class="text-xs text-red-600 mt-1">
                      Máximo 300 caracteres
                    </p>
                    <div class="flex gap-2 mt-2">
                      <button
                        class="btn-primary text-xs py-1 px-3"
                        :disabled="reviewsStore.loading"
                        @click="submitReply(review.id)"
                      >
                        {{ reviewsStore.loading ? '...' : 'Responder' }}
                      </button>
                      <button
                        class="btn-secondary text-xs py-1 px-3"
                        @click="replyingToReviewId = null; replyContent = ''; replyV$.$reset()"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                  <button
                    v-else
                    class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    @click="replyingToReviewId = review.id; replyContent = ''"
                  >
                    💬 Responder
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-400">
            Haz clic en "Ver reseñas" para cargar las reseñas de este negocio.
          </div>
        </div>
      </div>

      <!-- Add new business button (if has no active business) -->
      <div v-if="businessStore.myBusinesses.filter(b => b.isActive).length === 0" class="text-center">
        <button class="btn-primary" @click="openCreateForm">+ Registrar otro Negocio</button>
      </div>
    </div>
  </main>
</template>