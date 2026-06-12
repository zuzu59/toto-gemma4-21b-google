<template>
  <Navbar />
  <router-view />
  <div class="version-footer">
    <span class="version-badge">Version {{ appVersion }}</span>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import { ref } from 'vue'
import { APP_VERSION } from './version.js'

const appVersion = ref(APP_VERSION)
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #121212;
  color: #e0e0e0;
}
.version-footer {
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 10px;
  z-index: 1000;
}
.version-badge {
  background: #333;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #aaa;
  border: 1px solid #444;
  letter-spacing: 0.05em;
}
</style>
