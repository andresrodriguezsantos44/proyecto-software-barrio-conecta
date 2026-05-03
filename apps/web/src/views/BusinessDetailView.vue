<script setup lang="ts">
// ============================================================================
// BarrioConecta — Business Detail View
// Shows business info, photos, schedule, reviews with Vuelidate-validated
// review form, report modal, and merchant reply display.
// ============================================================================
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, minValue, maxValue } from '@vuelidate/validators';
import { useBusinessStore, useReviewsStore, useAuthStore, useAdminStore } from '@/stores';
import StarRating from '@/components/StarRating.vue';
import type { ReportTargetType, ReportReason } from '@barrio-conecta/contracts';

const route = useRoute();
const router = useRouter();
const businessStore = useBusinessStore();
const reviewsStore = useReviewsStore();
const authStore = useAuthStore();
const adminStore = useAdminStore();
const businessId = route.params.id as string;

// --- Day labels for schedule display ---
const dayLabels: Record<string, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
};

const dayKeys: Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// --- Review Form ---
const showReviewForm = ref(false);
const reviewRating = ref(0);
const reviewComment = ref('');

const reviewRules = {
  reviewRating: { required, minValue: minValue(1), maxValue: maxValue(5) },
  reviewComment: { maxLength: maxLength(300) },
};

const reviewV$ = useVuelidate(reviewRules, { reviewRating, reviewComment });

async function submitReview(): Promise<void> {
  reviewV$.value.$touch();
  if (reviewV$.value.$invalid || reviewRating.value < 1) return;

  try {
    await reviewsStore.createReview({
      businessId,
      rating: reviewRating.value,
      comment: reviewComment.value || undefined,
    });
    showReviewForm.value = false;
    reviewRating.value = 0;
    reviewComment.value = '';
    reviewV$.value.$reset();
  } catch {
    // Error is in reviewsStore.error
  }
}

function setRating(value: number): void {
  reviewRating.value = value;
}

// --- Report Modal ---
const showReportModal = ref(false);
const reportTargetType = ref<ReportTargetType>('business');
const reportTargetId = ref('');
const reportReason = ref<ReportReason>('spam');
const reportDescription = ref('');

const reportReasons: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'false_info', label: 'Información Falsa' },
  { value: 'inappropriate', label: 'Contenido Inapropiado' },
  { value: 'other', label: 'Otro' },
];

function openReportModal(targetType: ReportTargetType, targetId: string): void {
  reportTargetType.value = targetType;
  reportTargetId.value = targetId;
  reportReason.value = 'spam';
  reportDescription.value = '';
  showReportModal.value = true;
}

async function submitReport(): Promise<void> {
  try {
    await adminStore.createReport({
      targetType: reportTargetType.value,
      targetId: reportTargetId.value,
      reason: reportReason.value,
      description: reportDescription.value || undefined,
    });
    showReportModal.value = false;
  } catch {
    // Error is in adminStore.error
  }
}

// --- Merchant Reply ---
const replyingTo = ref<string | null>(null);
const replyContent = ref('');
const replyRules = {
  replyContent: { required, minLength: minLength(1), maxLength: maxLength(300) },
};
const replyV$ = useVuelidate(replyRules, { replyContent });

async function submitReply(reviewId: string): Promise<void> {
  replyV$.value.$touch();
  if (replyV$.value.$invalid) return;

  try {
    await reviewsStore.replyToReview(reviewId, replyContent.value);
    replyingTo.value = null;
    replyContent.value = '';
    replyV$.value.$reset();
  } catch {
    // Error is in reviewsStore.error
  }
}

// --- Load Data ---
onMounted(async () => {
  await businessStore.fetchBusiness(businessId);
  await reviewsStore.fetchBusinessReviews(businessId);
});

const isMerchant = () => authStore.isMerchant;
const isOwner = () => {
  if (!authStore.user || !businessStore.currentBusiness) return false;
  return authStore.user.id === businessStore.currentBusiness.ownerId;
};
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="businessStore.loading && !businessStore.currentBusiness" class="text-center py-12 text-gray-500">
      <span class="text-4xl block mb-4">⏳</span>
      Cargando negocio...
    </div>

    <!-- Error State -->
    <div v-else-if="businessStore.error" class="text-center py-12 text-red-600">
      <p class="text-lg mb-4">{{ businessStore.error }}</p>
      <button class="btn-primary" @click="router.push({ name: 'explore' })">
        Volver a Explorar
      </button>
    </div>

    <!-- Business Detail -->
    <div v-else-if="businessStore.currentBusiness" class="space-y-6">
      <!-- Header -->
      <div class="card">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900">{{ businessStore.currentBusiness.name }}</h1>
            <div class="mt-2 flex items-center gap-3">
              <StarRating :rating="businessStore.currentBusiness.avgRating" />
              <span v-if="businessStore.currentBusiness.isActive" class="badge bg-green-100 text-green-800">
                Activo
              </span>
              <span v-else class="badge bg-red-100 text-red-800">Inactivo</span>
            </div>
            <p v-if="businessStore.currentBusiness.description" class="mt-3 text-gray-600">
              {{ businessStore.currentBusiness.description }}
            </p>
          </div>

          <!-- Report Button -->
          <button
            v-if="authStore.isAuthenticated"
            class="text-sm text-gray-400 hover:text-red-500 transition-colors"
            title="Reportar negocio"
            @click="openReportModal('business', businessId)"
          >
            🚩 Reportar
          </button>
        </div>
      </div>

      <!-- Photos -->
      <div v-if="businessStore.currentBusiness.photos.length > 0" class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Fotos</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <img
            v-for="(photo, idx) in businessStore.currentBusiness.photos"
            :key="idx"
            :src="photo"
            :alt="`Foto ${idx + 1} de ${businessStore.currentBusiness.name}`"
            class="w-full h-48 object-cover rounded-lg"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
        </div>
      </div>

      <!-- Location -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">📍 Ubicación</h2>
        <p class="text-gray-600">
          Latitud: {{ businessStore.currentBusiness.location.lat.toFixed(4) }},
          Longitud: {{ businessStore.currentBusiness.location.lng.toFixed(4) }}
        </p>
      </div>

      <!-- Schedule -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">🕐 Horario</h2>
        <div class="space-y-2">
          <div
            v-for="key in dayKeys"
            :key="key"
            class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
          >
            <span class="font-medium text-gray-700">{{ dayLabels[key] }}</span>
            <span v-if="businessStore.currentBusiness.schedule[key]" class="text-gray-600">
              {{ businessStore.currentBusiness.schedule[key].open }}
              —
              {{ businessStore.currentBusiness.schedule[key].close }}
            </span>
            <span v-else class="text-gray-400">No disponible</span>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">
            Reseñas ({{ reviewsStore.businessReviews.length }})
          </h2>
          <button
            v-if="authStore.isAuthenticated && !showReviewForm"
            class="btn-secondary text-sm"
            @click="showReviewForm = true"
          >
            ✍️ Escribir Reseña
          </button>
        </div>

        <!-- Review Form -->
        <div v-if="showReviewForm" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-900 mb-3">Tu reseña</h3>

          <div v-if="reviewsStore.error" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ reviewsStore.error }}
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
            <div class="flex gap-1">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                :class="[
                  'w-8 h-8 rounded flex items-center justify-center transition-colors',
                  reviewRating >= star ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300',
                ]"
                @click="setRating(star)"
              >
                ★
              </button>
            </div>
            <p v-if="reviewV$.reviewRating.$error" class="mt-1 text-sm text-red-600">
              Selecciona una calificación entre 1 y 5
            </p>
          </div>

          <div class="mb-4">
            <label for="review-comment" class="block text-sm font-medium text-gray-700 mb-1">
              Comentario (opcional)
            </label>
            <textarea
              id="review-comment"
              v-model="reviewComment"
              class="input-field"
              rows="3"
              maxlength="300"
              placeholder="Cuéntale a otros sobre tu experiencia..."
            />
            <div class="flex justify-between">
              <p v-if="reviewV$.reviewComment.$error" class="text-sm text-red-600">
                Máximo 300 caracteres
              </p>
              <p class="text-xs text-gray-400 ml-auto">{{ reviewComment.length }}/300</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              class="btn-primary"
              :disabled="reviewsStore.loading"
              @click="submitReview"
            >
              {{ reviewsStore.loading ? 'Enviando...' : 'Publicar Reseña' }}
            </button>
            <button
              class="btn-secondary"
              @click="showReviewForm = false; reviewRating = 0; reviewComment = ''; reviewV$.$reset()"
            >
              Cancelar
            </button>
          </div>
        </div>

        <!-- Reviews List -->
        <div v-if="reviewsStore.loading && reviewsStore.businessReviews.length === 0" class="text-gray-500 py-4">
          Cargando reseñas...
        </div>

        <div v-else-if="reviewsStore.businessReviews.length === 0" class="text-gray-400 py-4 text-center">
          Aún no hay reseñas. ¡Sé el primero en dejar una!
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="review in reviewsStore.businessReviews"
            :key="review.id"
            class="border-b border-gray-100 pb-4 last:border-b-0"
          >
            <!-- Review Content -->
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <StarRating :rating="review.rating" size="sm" />
                  <span class="text-xs text-gray-400">
                    {{ new Date(review.createdAt).toLocaleDateString('es-CO') }}
                  </span>
                </div>
                <p v-if="review.comment" class="text-gray-700">{{ review.comment }}</p>
              </div>

              <!-- Report Review Button -->
              <button
                v-if="authStore.isAuthenticated && !isOwner()"
                class="text-xs text-gray-400 hover:text-red-500 ml-2"
                title="Reportar reseña"
                @click="openReportModal('review', review.id)"
              >
                🚩
              </button>
            </div>

            <!-- Merchant Reply -->
            <div v-if="review.reply" class="mt-2 ml-4 p-3 bg-primary-50 rounded-lg">
              <p class="text-sm font-medium text-primary-700">Respuesta del negocio:</p>
              <p class="text-sm text-gray-700">{{ review.reply }}</p>
            </div>

            <!-- Reply Button (merchant only) -->
            <div v-else-if="isMerchant() && isOwner()" class="mt-2 ml-4">
              <button
                v-if="replyingTo !== review.id"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
                @click="replyingTo = review.id; replyContent = ''"
              >
                💬 Responder
              </button>

              <!-- Reply Form -->
              <div v-if="replyingTo === review.id" class="mt-2 p-3 bg-gray-50 rounded-lg">
                <textarea
                  v-model="replyContent"
                  class="input-field"
                  rows="2"
                  maxlength="300"
                  placeholder="Escribe tu respuesta..."
                />
                <p v-if="replyV$.replyContent.$error" class="mt-1 text-sm text-red-600">
                  La respuesta es requerida (máximo 300 caracteres)
                </p>
                <div class="flex gap-2 mt-2">
                  <button
                    class="btn-primary text-sm py-1"
                    :disabled="reviewsStore.loading"
                    @click="submitReply(review.id)"
                  >
                    {{ reviewsStore.loading ? '...' : 'Enviar' }}
                  </button>
                  <button
                    class="btn-secondary text-sm py-1"
                    @click="replyingTo = null; replyV$.$reset()"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-12">
      <p class="text-4xl mb-4">🔍</p>
      <p class="text-gray-600 mb-4">Negocio no encontrado</p>
      <button class="btn-primary" @click="router.push({ name: 'explore' })">
        Volver a Explorar
      </button>
    </div>

    <!-- Report Modal -->
    <div
      v-if="showReportModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showReportModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Reportar {{ reportTargetType === 'business' ? 'Negocio' : 'Reseña' }}</h3>

        <div v-if="adminStore.error" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ adminStore.error }}
        </div>

        <form @submit.prevent="submitReport" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Razón</label>
            <select v-model="reportReason" class="input-field">
              <option v-for="r in reportReasons" :key="r.value" :value="r.value">
                {{ r.label }}
              </option>
            </select>
          </div>

          <div>
            <label for="report-desc" class="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              id="report-desc"
              v-model="reportDescription"
              class="input-field"
              rows="3"
              maxlength="500"
              placeholder="Describe el problema..."
            />
          </div>

          <div class="flex gap-3">
            <button type="submit" class="btn-danger" :disabled="adminStore.loading">
              {{ adminStore.loading ? 'Enviando...' : 'Enviar Reporte' }}
            </button>
            <button type="button" class="btn-secondary" @click="showReportModal = false">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>