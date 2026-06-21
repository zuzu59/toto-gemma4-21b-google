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
import { APP_VERSION } from '../version.js'

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
  padding: 1.5rem;
}
.page-title {
  color: #ffffff;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  font-weight: 700;
}
.about-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #ffffff;
  font-size: 1rem;
}
.about-content p {
  margin: 0;
  line-height: 1.6;
}
.about-content a {
  color: #64b5f6;
  text-decoration: underline;
}
.about-content a:hover {
  color: #90caf9;
}
.version-info {
  margin: 1rem 0;
  padding: 1.5rem;
  background: #2a2a2a;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: #ffffff;
}
.version-info p {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}
.version-info strong {
  color: #4caf50;
  font-size: 1.1rem;
}
.alert {
  color: #ff9800;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0.5rem;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 8px;
}
.loading {
  color: #cccccc;
  font-style: italic;
}
</style>
