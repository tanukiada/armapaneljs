<template>
    <form @submit.prevent="login">
        <label for="username">Username</label>
        <input v-model="username" required/>
        <br>
        <label for="password">Password</label>
        <input v-model="password" type="password" required/>
	<br>
        <button type="submit">Submit</button>
        <br>
        <p v-if="error" style="color:red;">{{  error  }}</p>
    </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')

const router = useRouter()

async function login() {
    error.value = ''
    try {
        const response = await fetch('https://tanuki.gay/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.message || 'Login failed')
        }

        localStorage.setItem('token', data.token)

        router.push('/')
    } catch (err) {
        error.value = err.message
    }
}

</script>
