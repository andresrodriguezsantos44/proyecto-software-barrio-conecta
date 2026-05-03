<script setup lang="ts">
// ============================================================================
// BarrioConecta — AppLayout
// Shared layout with responsive navigation header and slot for page content.
// ============================================================================
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isMerchant = computed(() => authStore.isMerchant);
const isAdmin = computed(() => authStore.isAdmin);
const userName = computed(() => authStore.user?.name ?? '');

function handleLogout(): void {
  authStore.logout();
  router.push({ name: 'landing' });
}
</script>

<template>
  <div class="min-h-screen flex flex-col font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
    <!-- Navigation Header -->
    <header class="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant/60 shadow-sm">
      <nav class="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto w-full">
        <div class="flex items-center gap-8">
          <router-link :to="{ name: 'landing' }" class="text-xl font-extrabold tracking-tight text-primary font-display-xl">
            BarrioConecta
          </router-link>
          
          <div class="hidden md:flex items-center gap-6">
            <router-link 
              :to="{ name: 'explore' }" 
              class="font-headline-md text-sm font-medium transition-colors hover:text-primary"
              :class="[route.name === 'explore' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant']"
            >
              Explorar
            </router-link>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <template v-if="isAuthenticated">
            <span class="hidden lg:block text-on-surface-variant font-semibold px-2">Hola, {{ userName }}</span>
            <button 
              @click="handleLogout"
              class="hidden lg:block text-on-surface-variant font-semibold px-4 py-2 active:scale-95 transition-transform duration-200"
            >
              Salir
            </button>
          </template>
          <template v-else>
            <router-link 
              :to="{ name: 'auth' }" 
              class="hidden lg:block text-on-surface-variant font-semibold px-4 py-2 active:scale-95 transition-transform duration-200"
            >
              Iniciar Sesión
            </router-link>
          </template>
          
          <router-link 
            :to="{ name: 'auth' }"
            class="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-sm shadow-md hover:bg-primary-container active:scale-95 transition-all duration-200"
          >
            {{ isMerchant ? 'Panel de Control' : 'Publicar mi negocio' }}
          </router-link>
        </div>
      </nav>
    </header>

    <!-- Page Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-surface-container-high py-16 px-6 border-t border-outline-variant mt-auto">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-4 gap-12 mb-12">
          <div class="space-y-6">
            <span class="text-2xl font-extrabold tracking-tight text-primary">BarrioConecta</span>
            <p class="text-on-surface-variant text-body-md">Empoderando a las comunidades locales a través de la proximidad digital y el apoyo mutuo.</p>
            <div class="flex gap-4">
              <a href="#" class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm hover:shadow-md transition-shadow">
                <span class="material-symbols-outlined text-xl">social_leaderboard</span>
              </a>
              <a href="#" class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm hover:shadow-md transition-shadow">
                <span class="material-symbols-outlined text-xl">photo_camera</span>
              </a>
              <a href="#" class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm hover:shadow-md transition-shadow">
                <span class="material-symbols-outlined text-xl">alternate_email</span>
              </a>
            </div>
          </div>
          <div>
            <h4 class="font-bold mb-6 text-on-surface">Plataforma</h4>
            <ul class="space-y-4 text-on-surface-variant">
              <li><a href="#" class="hover:text-primary transition-colors">Acerca de nosotros</a></li>
              <li><a href="#" class="hover:text-primary transition-colors">Cómo funciona</a></li>
              <li><a href="#" class="hover:text-primary transition-colors">Explorar barrios</a></li>
              <li><a href="#" class="hover:text-primary transition-colors">Blog de comunidad</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-6 text-on-surface">Para Negocios</h4>
            <ul class="space-y-4 text-on-surface-variant">
              <li><a href="#" class="hover:text-primary transition-colors">Registrar comercio</a></li>
              <li><a href="#" class="hover:text-primary transition-colors">Planes y precios</a></li>
              <li><a href="#" class="hover:text-primary transition-colors">Guía para dueños</a></li>
              <li><a href="#" class="hover:text-primary transition-colors">Publicidad local</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-6 text-on-surface">Soporte</h4>
            <ul class="space-y-4 text-on-surface-variant">
              <li><a href="#" class="hover:text-primary transition-colors">Centro de ayuda</a></li>
              <li><a href="#" class="hover:text-primary transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" class="hover:text-primary transition-colors">Privacidad</a></li>
              <li><a href="#" class="hover:text-primary transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div class="pt-12 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
          <p class="text-sm text-on-surface-variant">© {{ new Date().getFullYear() }} BarrioConecta. Hecho con amor para los barrios del mundo.</p>
          <div class="flex items-center gap-2 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-sm">language</span>
            <span>Español (Latinoamérica)</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Mobile Bottom Navigation -->
    <div class="md:hidden fixed bottom-0 w-full flex justify-around items-center px-2 py-3 bg-white border-t border-outline-variant shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-2xl z-50">
      <router-link :to="{ name: 'landing' }" class="flex flex-col items-center justify-center rounded-xl px-4 py-1 text-[10px] font-semibold transition-all duration-150" :class="[route.name === 'landing' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant']">
        <span class="material-symbols-outlined">home</span>
        <span>Home</span>
      </router-link>
      <router-link :to="{ name: 'explore' }" class="flex flex-col items-center justify-center rounded-xl px-4 py-1 text-[10px] font-semibold transition-all duration-150" :class="[route.name === 'explore' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant']">
        <span class="material-symbols-outlined">search</span>
        <span>Explorar</span>
      </router-link>
      <router-link :to="{ name: 'auth' }" class="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 text-[10px] font-semibold hover:bg-surface-container transition-all duration-150">
        <span class="material-symbols-outlined">person</span>
        <span>Perfil</span>
      </router-link>
    </div>
  </div>
</template>