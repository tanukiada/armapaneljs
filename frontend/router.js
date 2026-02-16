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

router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth) {
        return next();
    }

    try {
        const res = await fetch('/v1/auth/user', {
            credentials: 'include'
        });

        if (res.ok) {
            next();
        } else {
            next('/login');
        }
    } catch {
        next('/login');
    }
});

export default router
