<script setup lang="ts">
// ============================================================================
// BarrioConecta — Landing View
// Public landing page with hero, category grid, and search entry point.
// ============================================================================
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCategoriesStore } from '@/stores';

const router = useRouter();
const route = useRoute();
const categoriesStore = useCategoriesStore();

onMounted(() => {
  // Fetch categories for the grid if not already loaded
  if (categoriesStore.categories.length === 0) {
    categoriesStore.fetchCategories();
  }
});

// Handle redirect after login
if (route.query.redirect) {
  // User was redirected here after auth requirement
}

function goToExplore(categoryId?: string): void {
  const query: Record<string, string> = {};
  if (categoryId) query.category = categoryId;
  router.push({ name: 'explore', query });
}

function goToAuth(): void {
  router.push({ name: 'auth' });
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-gradient pt-16 pb-24 px-6">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div class="space-y-8">
          <h1 class="font-display-xl text-display-xl text-on-surface leading-tight">
            Encuentra negocios de tu barrio <span class="text-primary">en segundos</span>
          </h1>
          <p class="text-body-lg text-on-surface-variant max-w-xl">
            Conectamos a vecinos con los mejores comercios locales. Descubre joyas ocultas, apoya a tus emprendedores cercanos y fortalece tu comunidad.
          </p>
          
          <!-- Search Bar -->
          <div class="bg-white p-2 rounded-3xl shadow-xl border border-outline-variant flex flex-col md:flex-row gap-2 max-w-2xl">
            <div class="flex-1 flex items-center px-4 gap-3">
              <span class="material-symbols-outlined text-primary">search</span>
              <input 
                class="w-full border-none focus:ring-0 text-body-md bg-transparent" 
                placeholder="¿Qué estás buscando hoy?" 
                type="text"
                @keyup.enter="goToExplore()"
              />
            </div>
            <div class="flex gap-2 p-1">
              <button 
                class="flex items-center gap-2 bg-surface-container-high text-on-surface px-4 py-3 rounded-2xl font-label-sm hover:bg-surface-container-highest transition-colors"
                @click="goToExplore()"
              >
                <span class="material-symbols-outlined text-sm">my_location</span>
                Buscar cerca
              </button>
              <button 
                class="bg-primary text-on-primary px-8 py-3 rounded-2xl font-label-sm shadow-lg hover:shadow-primary-container/20 active:scale-95 transition-all"
                @click="goToExplore()"
              >
                Explorar
              </button>
            </div>
          </div>

          <!-- Popular Categories Tags -->
          <div class="flex items-center gap-4 pt-4">
            <span class="text-label-sm text-on-surface-variant font-semibold">Popular:</span>
            <div class="flex gap-2 overflow-x-auto no-scrollbar">
              <span 
                v-for="cat in categoriesStore.categories.slice(0, 3)" 
                :key="cat.id"
                class="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-sm cursor-pointer hover:bg-primary/20 transition-colors whitespace-nowrap"
                @click="goToExplore(cat.id)"
              >
                {{ cat.name }}
              </span>
              <span v-if="categoriesStore.categories.length === 0" class="flex gap-2">
                <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-sm cursor-pointer hover:bg-primary/20 transition-colors" @click="goToExplore()">Panaderías</span>
                <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-sm cursor-pointer hover:bg-primary/20 transition-colors" @click="goToExplore()">Veterinarias</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Hero Image & Decorative Elements -->
        <div class="relative">
          <div class="aspect-square rounded-[4rem] overflow-hidden shadow-2xl relative z-10">
            <img 
              alt="Comunidad local activa" 
              class="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
            />
          </div>
          <div class="absolute -top-6 -right-6 w-32 h-32 bg-primary-fixed rounded-full -z-10 blur-2xl opacity-50"></div>
          <div class="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary-fixed-dim rounded-full -z-10 blur-3xl opacity-30"></div>
          
          <div class="absolute -right-8 top-1/4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 z-20 border border-emerald-50 hidden md:flex">
            <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span class="material-symbols-outlined text-emerald-600" style="font-variation-settings: 'FILL' 1">verified</span>
            </div>
            <div>
              <p class="text-[12px] font-bold text-on-surface">Negocio Verificado</p>
              <p class="text-[10px] text-on-surface-variant">Confianza garantizada</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-24 px-6 bg-surface-container-lowest">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16 space-y-4">
          <h2 class="font-headline-lg text-headline-lg text-on-surface">¿Por qué usar BarrioConecta?</h2>
          <p class="text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Hacemos que la experiencia de comprar local sea tan sencilla como un clic, pero con la calidez de tu barrio.
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Card 1 -->
          <div class="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <span class="material-symbols-outlined text-primary group-hover:text-on-primary text-3xl">location_on</span>
            </div>
            <h3 class="font-headline-md text-headline-md mb-3">Busca cerca de ti</h3>
            <p class="text-body-md text-on-surface-variant">
              Encuentra exactamente lo que necesitas a solo unas cuadras de distancia usando nuestro mapa inteligente.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <span class="material-symbols-outlined text-primary group-hover:text-on-primary text-3xl">favorite</span>
            </div>
            <h3 class="font-headline-md text-headline-md mb-3">Apoya lo local</h3>
            <p class="text-body-md text-on-surface-variant">
              Fortalece la economía de tu comunidad comprando en negocios familiares y emprendimientos locales.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <span class="material-symbols-outlined text-primary group-hover:text-on-primary text-3xl">thumb_up</span>
            </div>
            <h3 class="font-headline-md text-headline-md mb-3">Decide con confianza</h3>
            <p class="text-body-md text-on-surface-variant">
              Lee reseñas reales de tus propios vecinos y elige los servicios mejor calificados del sector.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div class="space-y-4">
            <h2 class="font-headline-lg text-headline-lg text-on-surface">Explora por categorías</h2>
            <p class="text-body-md text-on-surface-variant max-w-xl">Todo lo que tu hogar y familia necesitan, organizado para tu comodidad.</p>
          </div>
          <button 
            @click="goToExplore()"
            class="text-primary font-label-sm flex items-center gap-2 hover:gap-3 transition-all"
          >
            Ver todas las categorías <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        <div v-if="categoriesStore.loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <template v-if="categoriesStore.categories.length > 0">
            <div 
              v-for="cat in categoriesStore.categories" 
              :key="cat.id"
              class="group bg-white p-6 rounded-3xl border border-outline-variant hover:border-primary hover:shadow-lg transition-all text-center cursor-pointer"
              @click="goToExplore(cat.id)"
            >
              <div class="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1">{{ cat.icon }}</span>
              </div>
              <p class="font-semibold text-on-surface">{{ cat.name }}</p>
            </div>
          </template>
          
          <!-- Fallback Categories -->
          <template v-else>
            <div 
              v-for="cat in [
                { name: 'Gastronomía', icon: 'restaurant', color: 'orange' },
                { name: 'Salud', icon: 'medical_services', color: 'blue' },
                { name: 'Hogar', icon: 'home', color: 'emerald' },
                { name: 'Tecnología', icon: 'devices', color: 'purple' },
                { name: 'Educación', icon: 'school', color: 'yellow' },
                { name: 'Otros', icon: 'more_horiz', color: 'slate' }
              ]" 
              :key="cat.name"
              class="group bg-white p-6 rounded-3xl border border-outline-variant hover:border-primary hover:shadow-lg transition-all text-center cursor-pointer"
              @click="goToExplore()"
            >
              <div class="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1">{{ cat.icon }}</span>
              </div>
              <p class="font-semibold text-on-surface">{{ cat.name }}</p>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- CTA Section for Merchants -->
    <section class="py-24 px-6 mb-12">
      <div class="max-w-7xl mx-auto">
        <div class="bg-primary rounded-[3rem] p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
          <!-- Background Decoration -->
          <div class="absolute top-0 right-0 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-primary-fixed/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
          
          <div class="relative z-10 lg:w-1/2 space-y-6 text-center lg:text-left">
            <h2 class="text-on-primary font-display-xl text-display-xl leading-tight">¿Tienes un negocio de barrio?</h2>
            <p class="text-primary-fixed/80 text-body-lg">
              Aumenta tu visibilidad, conecta con nuevos vecinos y gestiona tu presencia digital de forma sencilla y gratuita.
            </p>
            <div class="pt-4">
              <button 
                class="bg-white text-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-surface-container transition-all active:scale-95"
                @click="goToAuth()"
              >
                Registrar mi negocio
              </button>
            </div>
          </div>
          
          <div class="lg:w-1/2 relative z-10">
            <div class="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl">
              <img 
                alt="Dueño de negocio local" 
                class="rounded-2xl w-full object-cover aspect-video" 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>