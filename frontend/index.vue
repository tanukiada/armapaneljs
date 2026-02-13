<template>
    <h1>TACG Server Panel</h1>
    <hr>
    <h2>status: {{ sdata.status }}</h2>
    <button v-on:click="changeServerState('Online')">Start Server</button>
    <button v-on:click="changeServerState('Offline')">Stop Server</button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute();

const sdata = ref({ status: 'unknown'})
let intervalId = null

async function fetchData() {
    const token = localStorage.getItem('token')
    try {
        const response = await fetch('/api/v1/service/status', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!response.ok) {
            if (response.status === 503) {
                sdata.value.status = "offline"
                return
            }
            throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        sdata.value.status = data.Status
    } catch (err) {
        console.warn('Fetch error:', err.message)
        sdata.value.status = 'offline'
    }
}

async function changeServerState(newStatus) {
    const token = localStorage.getItem('token')
    try {
        const response = await fetch('/api/v1/service/status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: newStatus
            })
        })

        if (!response.ok) {
            if (response.status === 503) {
                sdata.value.status = 'offline'
                return
            }
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to update status')
        }

        const data = await response.json()
        sdata.value.status = data.Status
    } catch (err) {
        console.warn('Change server state error:', err.message)
        sdata.value.status = "Failed to load data. Contact your local server tanuki"
    }
}

onMounted(() => {
    fetchData()

    intervalId  = setInterval(() => {
        fetchData()
    }, 5000)
})

onUnmounted(() => {
    clearInterval(intervalId)
})
</script>