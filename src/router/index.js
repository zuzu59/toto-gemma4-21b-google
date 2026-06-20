import { createRouter, createWebHistory } from 'vue-router'
import Records from '../views/Records.vue'
import Tags from '../views/Tags.vue'
import Tools from '../views/Tools.vue'
import Help from '../views/Help.vue'
import About from '../views/About.vue'
import RecordDetail from '../views/RecordDetail.vue'
import Login from '../views/Login.vue'
import { AuthService } from '../services/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Login,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/records',
    name: 'Records',
    component: Records,
    meta: { requiresAuth: true },
  },
  {
    path: '/record/:id',
    name: 'RecordDetail',
    component: RecordDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/tags',
    name: 'Tags',
    component: Tags,
    meta: { requiresAuth: true },
  },
  {
    path: '/tools',
    name: 'Tools',
    component: Tools,
    meta: { requiresAuth: true },
  },
  {
    path: '/help',
    name: 'Help',
    component: Help,
    meta: { requiresAuth: true },
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !AuthService.isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

router.afterEach((to, from) => {})

router.onError((error) => {})

export default router
