<template>
  <nav class="navbar">
    <div class="nav-left">
      <h1 class="brand">Z-Services</h1>
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
import { ref } from 'vue'

const isDrawerOpen = ref(false)
const searchQuery = ref('')

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const handleSearch = () => {
  // To be implemented: global search logic
}

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
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  height: 60px;
  background-color: #1a1a1a;
}

.brand {
  margin: 0;
  font-size: 1.2rem;
  white-space: nowrap;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container {
  flex-grow: 1;
  max-width: 300px;
}

.search-container input {
  width: 100%;
}

.hamburger {
  padding: 0 10px;
}

.drawer {
  position: fixed;
  top: 60px;
  right: 0;
  width: 250px;
  height: calc(100vh - 60px);
  background-color: #1e1e1e;
  border-left: 1px solid var(--border-color);
  z-index: 1000;
  padding: 1rem;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.drawer-content button {
  text-align: left;
  width: 100%;
  height: 40px;
}

.drawer-content button.danger {
  background: #b71c1c;
  color: #fff;
  font-weight: bold;
  margin-top: 0.5rem;
}

.drawer-content button.danger:hover {
  background: #d32f2f;
}

@media (max-width: 600px) {
  .search-container {
    max-width: 150px;
  }
}
</style>
