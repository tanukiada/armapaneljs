import { createRouter, createWebHistory } from 'vue-router'

import index from "./index.vue"
import login from "./login.vue"

const routes = [
    {
        path: '/',
        name: 'index',
        component: index,
        meta: { requiresAuth: true }
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

router.beforeEach(async (to, from) => {
    if (to.meta.requiresAuth && to.name !== 'login') {
        return { name: 'login' }
    }
});

export default router
