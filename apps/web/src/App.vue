<script setup lang="ts">
// ============================================================================
// BarrioConecta — Root App Component
// Shell layout with navigation header and footer wrapping router view.
// ============================================================================
import AppLayout from '@/layouts/AppLayout.vue';
</script>

<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>