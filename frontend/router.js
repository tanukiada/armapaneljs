import { createRouter, createWebHistory } from 'vue-router'

import index from "./index.vue"
import login from "./login.vue"

const routes = [
    {
        path: '/',
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

const isAuthorized = async() => {
    const response = await fetch('https://tanuki.gay/api/v1/auth/user', {
        method: 'GET',
        credentials: 'include'
    })
    const data = await response.json()
    if (!response.ok) {
        return false
    }
    return !!data.user
}

router.beforeEach(async (to, from) => {
    const authorized = await isAuthorized();
    if (!authorized && to.name !== 'login') {
        return { name: 'login' }
    }
})

export default router
