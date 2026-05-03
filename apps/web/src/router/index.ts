// ============================================================================
// BarrioConecta — Router Configuration
// Vue Router with route definitions and navigation guards.
// ============================================================================

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { getStoredToken, getStoredUser } from '@/api/client';

// --- Route Definitions ---

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingView.vue'),
    meta: { public: true },
  },
  {
    path: '/explore',
    name: 'explore',
    component: () => import('@/views/ExploreView.vue'),
    meta: { public: true },
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/AuthView.vue'),
    meta: { public: true, guestOnly: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/AuthView.vue'),
    meta: { public: true, guestOnly: true, authMode: 'login' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/AuthView.vue'),
    meta: { public: true, guestOnly: true, authMode: 'register' },
  },
  {
    path: '/business/:id',
    name: 'business-detail',
    component: () => import('@/views/BusinessDetailView.vue'),
    meta: { public: true },
    props: true,
  },
  {
    path: '/dashboard',
    name: 'merchant-dashboard',
    component: () => import('@/views/MerchantDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['merchant'] },
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/AdminDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { public: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 };
  },
});

// --- Navigation Guards ---

router.beforeEach((to, _from, next) => {
  const token = getStoredToken();
  const user = getStoredUser();

  // Route requires authentication
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  // Route requires specific role
  if (to.meta.roles && user?.role && !(to.meta.roles as string[]).includes(user.role)) {
    // Wrong role — redirect based on their actual role
    if (user.role === 'admin') return next({ name: 'admin-dashboard' });
    if (user.role === 'merchant') return next({ name: 'merchant-dashboard' });
    return next({ name: 'landing' });
  }

  // Guest-only route (e.g., /auth) — redirect away if already logged in
  if (to.meta.guestOnly && token) {
    if (user?.role === 'admin') return next({ name: 'admin-dashboard' });
    if (user?.role === 'merchant') return next({ name: 'merchant-dashboard' });
    return next({ name: 'landing' });
  }

  next();
});

export default router;
