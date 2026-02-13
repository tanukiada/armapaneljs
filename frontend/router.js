import { createRouter, createWebHistory } from 'vue-router'

import index from "./index.vue"
import login from "./login.vue"

const routes = [
    {
        path: '/index',
        name: 'index',
        component: index
    },
    {
        path: '/login',
        name: 'login',
        component: login
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if (to.name === 'Home' && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router