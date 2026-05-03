<script setup lang="ts">
// ============================================================================
// BarrioConecta — 404 Not Found View
// ============================================================================
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <main class="max-w-md mx-auto px-4 py-20 text-center">
    <h1 class="text-6xl font-bold text-gray-200 mb-4">404</h1>
    <p class="text-xl text-gray-600 mb-8">Página no encontrada</p>
    <button class="btn-primary" @click="router.push({ name: 'landing' })">
      Volver al inicio
    </button>
  </main>
</template>