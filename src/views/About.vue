<template>
  <div class="page">
    <h1 class="page-title">À propos</h1>
    <div class="about-content">
      <p>GitHub: <a href="https://github.com/zuzu59" target="_blank">GitHub.com/zuzu59</a></p>
      <p>Dépôt: <a href="https://github.com/zuzu59/z-services" target="_blank">GitHub repository</a></p>
      
      <div class="version-info">
        <p>Version actuelle : <strong v-if="appVersion">{{ appVersion }}</strong></p>
        <div v-if="loadingRelease" class="loading">Vérification de la dernière version...</div>
        <div v-else-if="newVersionAvailable" class="alert">
          Une nouvelle version est disponible ! 
          <a :href="changelogUrl">Consulter le changelog</a>
        </div>
        <div v-else>
          Application à jour.
        </div>
      </div>

      <p><a :href="changelogUrl">Changelog</a></p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { APP_VERSION } from './version.js'

const appVersion = ref(APP_VERSION)
const changelogUrl = 'https://github.com/zuzu59/z-services/blob/main/CHANGELOG.md'
const newVersionAvailable = ref(false)
const loadingRelease = ref(true)

onMounted(async () => {
  try {
    const response = await fetch('https://api.github.com/repos/zuzu59/z-services/releases/latest')
    if (response.ok) {
      const data = await response.json()
      if (data.tag_name !== appVersion.value) {
        newVersionAvailable.value = true
      }
    }
  } catch (e) {
    console.error('Erreur lors de la vérification de la version.', e)
  } finally {
    loadingRelease.value = false
  }
})
</script>

<style scoped>
.page {
  padding: 2rem;
}
.about-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.version-info {
  margin: 1rem 0;
  padding: 1rem;
  background: #1e1e1e;
  border-radius: 8px;
}
.alert {
  color: #ff9800;
  font-weight: bold;
}
.loading {
  color: #aaa;
  font-style: italic;
}
.page-title {
  margin-bottom: 2rem;
}
</style>
