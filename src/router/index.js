import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/watch/:id',
    name: 'Watch',
    component: () => import('@/views/Watch.vue')
  },
  {
    path: '/match/:id',
    name: 'MatchPage',
    component: () => import('@/views/MatchPage.vue')
  },
  {
    path: '/channels',
    name: 'AllChannels',
    component: () => import('@/views/AllChannels.vue')
  },
  {
    path: '/channel/:id',
    name: 'ChannelWatch',
    component: () => import('@/views/ChannelWatch.vue')
  },
  {
    path: '/sports',
    name: 'AllSports',
    component: () => import('@/views/AllSports.vue')
  },
  {
    path: '/leagues',
    name: 'Leagues',
    component: () => import('@/views/Leagues.vue')
  },
  {
    path: '/category/:category',
    name: 'CategoryPage',
    component: () => import('@/views/CategoryPage.vue')
  },
  {
    path: '/search',
    name: 'SearchPage',
    component: () => import('@/views/SearchPage.vue')
  },
  {
    path: '/favorites',
    name: 'FavoritesPage',
    component: () => import('@/views/FavoritesPage.vue')
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLogin.vue'),
    meta: { public: true }
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Navigation guard for admin routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  
  if (to.meta.requiresAuth && !token) {
    console.log('No token found, redirecting to login')
    next('/admin/login')
  } else if (to.path === '/admin/login' && token) {
    console.log('Token found, redirecting to dashboard')
    next('/admin/dashboard')
  } else {
    next()
  }
})

export default router
