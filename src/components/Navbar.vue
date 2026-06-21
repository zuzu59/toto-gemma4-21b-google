<template>
  <nav class="navbar">
    <div class="nav-left">
      <h1 class="brand" @click="goHome" style="cursor: pointer;">Z-Services</h1>
    </div>
    <div class="nav-right">
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Rechercher..." 
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>
      <div class="status-indicator">
        <span class="status-dot" :class="{ 'online': isOnline, 'offline': !isOnline }"></span>
        <span class="status-text">{{ isOnline ? 'Connecté' : 'Hors ligne' }}</span>
      </div>
      <button @click="toggleDrawer" class="hamburger">
        <span v-if="!isDrawerOpen">☰</span>
        <span v-else>✕</span>
      </button>
    </div>
  </nav>
  
  <div v-show="isDrawerOpen" class="drawer" @click.self="toggleDrawer">
    <div class="drawer-content">
      <button @click="$router.push('/tags')">Tags</button>
      <button @click="$router.push('/tools')">Outils</button>
      <button @click="$router.push('/help')">Aide</button>
      <button @click="$router.push('/about')">À propos</button>
      <button class="danger" @click="handleResetFactory">⚠ Réinitialisation usine</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDrawerOpen = ref(false)
const searchQuery = ref('')
const isOnline = ref(navigator.onLine)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const goHome = () => {
  router.push('/')
}

const handleSearch = () => {
  // To be implemented: global search logic
}

const handleOnline = () => { isOnline.value = true }
const handleOffline = () => { isOnline.value = false }

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

const handleResetFactory = () => {
  if (confirm('⚠ ATTENTION : toutes les données seront supprimées définitivement (services, tags, outils, mots de passe). Continuer ?')) {
    // Wipe in-memory key
    window.__MASTER_KEY__ = undefined
    
    // Clear all localStorage
    localStorage.clear()
    
    // Clear Dexie DB
    if (window.__DB__) {
      window.__DB__?.delete().catch(() => {})
    }
    
    // Navigate to login
    window.location.href = '/'
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 2px solid var(--border-color);
  height: 60px;
  background-color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.brand {
  margin: 0;
  font-size: 1.3rem;
  white-space: nowrap;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  background: #2a2a2a;
  border: 2px solid #666;
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: #4caf50;
  box-shadow: 0 0 8px #4caf50;
}

.status-dot.offline {
  background: #f44336;
  box-shadow: 0 0 8px #f44336;
}

.status-text {
  white-space: nowrap;
}

.search-container {
  flex-grow: 1;
  max-width: 350px;
}

.search-container input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #666;
  border-radius: 8px;
  background: #2a2a2a;
  color: #ffffff;
  font-size: 14px;
}

.search-container input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
}

.hamburger {
  padding: 0 10px;
  background: #2a2a2a;
  border: 2px solid #666;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hamburger:hover {
  background: #333;
  border-color: #888;
}

.drawer {
  position: fixed;
  top: 60px;
  right: 0;
  width: 280px;
  height: calc(100vh - 60px);
  background-color: #2a2a2a;
  border-left: 2px solid var(--border-color);
  z-index: 1000;
  padding: 1rem;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.drawer-content button {
  text-align: left;
  width: 100%;
  height: 44px;
  background: #333;
  border: 2px solid #666;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
}

.drawer-content button:hover {
  background: #444;
  border-color: #888;
}

.drawer-content button.danger {
  background: #c62828;
  color: #fff;
  font-weight: bold;
  margin-top: 0.5rem;
  border-color: #e53935;
}

.drawer-content button.danger:hover {
  background: #d32f2f;
  border-color: #ff5252;
}

@media (max-width: 600px) {
  .navbar {
    padding: 0.5rem 1rem;
  }
  .brand {
    font-size: 1.1rem;
  }
  .search-container {
    max-width: 120px;
  }
  .status-text {
    display: none;
  }
  .status-indicator {
    padding: 0.25rem 0.5rem;
  }
}
</style>
