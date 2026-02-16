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

async function authorized() {
    const response = await fetch('https://tanuki.gay/api/v1/auth/user', {
        method: 'GET',
        credentials: 'include'
    })
    const data = response.json()
    console.log(data)
}

router.beforeEach(async (to, from) => {
    if (to.meta.requiresAuth && !authorized()) {
        console.log(authorized())
        return { name: 'login' }
    }
})

export default router
