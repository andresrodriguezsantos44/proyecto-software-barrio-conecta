<script setup lang="ts">
// ============================================================================
// BarrioConecta — Auth View
// Login and register forms with Vuelidate validation and error handling.
// Full MVP implementation per spec AUTH-01 through AUTH-03.
// ============================================================================
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';
import type { UserRole } from '@barrio-conecta/contracts';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoginMode = ref(true);
const formEmail = ref('');
const formPassword = ref('');
const formName = ref('');
const formRole = ref<UserRole>('neighbor');
const showPassword = ref(false);

function syncModeFromRoute(): void {
  const authMode = route.meta.authMode as 'login' | 'register' | undefined;
  isLoginMode.value = authMode !== 'register';

  const requestedRole = route.query.role;
  if (!isLoginMode.value && (requestedRole === 'merchant' || requestedRole === 'neighbor')) {
    formRole.value = requestedRole;
    return;
  }

  if (!isLoginMode.value && formRole.value !== 'merchant' && formRole.value !== 'neighbor') {
    formRole.value = 'neighbor';
  }
}

syncModeFromRoute();

// --- Vuelidate rules ---
// Computed rules switch based on mode (login vs register)
const rules = computed(() => {
  if (isLoginMode.value) {
    return {
      formEmail: { required, email },
      formPassword: { required },
    };
  }
  return {
    formEmail: { required, email },
    formPassword: { required, minLength: minLength(8) },
    formName: { required, minLength: minLength(2) },
  };
});

const v$ = useVuelidate(rules, { formEmail, formPassword, formName });

async function handleSubmit(): Promise<void> {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  try {
    if (isLoginMode.value) {
      await authStore.login({ email: formEmail.value, password: formPassword.value });
    } else {
      await authStore.register({
        email: formEmail.value,
        password: formPassword.value,
        name: formName.value,
        role: formRole.value,
      });
    }
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch {
    // Error is displayed from authStore.error
  }
}

function toggleMode(): void {
  authStore.clearError();
  v$.value.$reset();
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined;

  if (isLoginMode.value) {
    router.push({ name: 'register', query: { ...(redirect ? { redirect } : {}), role: formRole.value } });
    return;
  }

  router.push({ name: 'login', query: redirect ? { redirect } : undefined });
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { value: 'neighbor', label: 'Vecino', description: 'Buscar y calificar negocios' },
  { value: 'merchant', label: 'Comercio', description: 'Publicar y gestionar tu negocio' },
];

// Clear validation errors when switching modes
watch(isLoginMode, () => {
  v$.value.$reset();
});

watch(
  () => [route.name, route.query.role],
  () => {
    syncModeFromRoute();
    authStore.clearError();
    v$.value.$reset();
  },
);
</script>

<template>
  <main class="max-w-md mx-auto px-4 py-12">
    <div class="card">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
        {{ isLoginMode ? 'Ingresar' : 'Crear Cuenta' }}
      </h1>

      <p class="mb-6 text-center text-sm text-gray-500">
        {{ isLoginMode ? 'Entrá para gestionar tu cuenta y tus negocios.' : 'Creá tu cuenta para explorar o publicar tu comercio.' }}
      </p>

      <div v-if="authStore.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            v-model="formEmail"
            type="email"
            class="input-field"
            placeholder="tu@email.com"
            autocomplete="email"
          />
          <p v-if="v$.formEmail.$error" class="mt-1 text-sm text-red-600">
            <span v-if="v$.formEmail.email?.$invalid">Ingresa un email válido</span>
            <span v-else>El email es requerido</span>
          </p>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div class="relative">
            <input
              id="password"
              v-model="formPassword"
              :type="showPassword ? 'text' : 'password'"
              class="input-field pr-10"
              placeholder="Mínimo 8 caracteres"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <p v-if="v$.formPassword.$error" class="mt-1 text-sm text-red-600">
            <span v-if="v$.formPassword.minLength?.$invalid">
              La contraseña debe tener al menos 8 caracteres
            </span>
            <span v-else>La contraseña es requerida</span>
          </p>
        </div>

        <!-- Name (register only) -->
        <div v-if="!isLoginMode">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            id="name"
            v-model="formName"
            type="text"
            class="input-field"
            placeholder="Tu nombre"
          />
          <p v-if="v$.formName?.$error" class="mt-1 text-sm text-red-600">
            <span v-if="v$.formName.minLength?.$invalid">
              El nombre debe tener al menos 2 caracteres
            </span>
            <span v-else>El nombre es requerido</span>
          </p>

          <!-- Role selector -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de cuenta</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="role in roleOptions"
                :key="role.value"
                type="button"
                :class="[
                  'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                  formRole === role.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300',
                ]"
                @click="formRole = role.value"
              >
                <span class="font-medium text-sm">{{ role.label }}</span>
                <span class="text-xs">{{ role.description }}</span>
              </button>
            </div>
            <p class="mt-2 text-xs text-gray-500">
              Si querés registrar un comercio, elegí <strong>Comercio</strong>.
            </p>
          </div>
        </div>

        <button
          type="submit"
          class="btn-primary w-full"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Procesando...' : (isLoginMode ? 'Ingresar' : 'Crear Cuenta') }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-500">
        {{ isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
        <button
          type="button"
          class="text-primary-600 hover:text-primary-700 font-medium"
          @click="toggleMode"
        >
          {{ isLoginMode ? 'Regístrate' : 'Inicia sesión' }}
        </button>
      </p>
    </div>
  </main>
</template>
