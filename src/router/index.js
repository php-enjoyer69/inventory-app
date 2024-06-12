import { createRouter, createWebHistory } from 'vue-router'

// view components
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import UserManagement from '../views/UserManagement.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  { path: '/admin/user-management',
    name: 'UserManagement',
    component: UserManagement
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
