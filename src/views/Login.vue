<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Z-Services</h1>
      <p>Entrez votre mot de passe maître pour déverrouiller l'application.</p>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="password">Mot de passe Maître</label>
          <input 
            id="password" 
            type="password" 
            v-model="password" 
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit" :disabled="isLoading">Déverrouiller</button>
      </form>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AuthService } from '../services/auth'
import { useRouter } from 'vue-router'

const password = ref('')
const isLoading = ref(false)
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    let salt = localStorage.getItem('master_salt')
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(16))
      localStorage.setItem('master_salt', btoa(String.fromCharCode.apply(null, salt)))
    } else {
      salt = new Uint8Array(atob(salt).split('').map(c => c.charCodeAt(0)))
    }

    await AuthService.initialize(password.value, salt)
    
    if (AuthService.isAuthenticated()) {
      router.push('/records')
    } else {
      error.value = 'Mot de passe incorrect.'
    }
  } catch (e) {
    error.value = 'Une erreur est survenue lors du déverrouillage.'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #121212;
}
.login-card {
  background: #1e1e1e;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
h1 {
  margin-bottom: 1rem;
  color: #fff;
}
p {
  color: #aaa;
  margin-bottom: 2rem;
}
.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #fff;
}
input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 4px;
  border: 1px solid #333;
  background: #2c2c2c;
  color: #fff;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 0.8rem;
  border-radius: 4px;
  border: none;
  background: #2e7d32;
  color: #fff;
  cursor: pointer;
  font-weight: bold;
}
button:disabled {
  background: #444;
}
.error {
  color: #f44336;
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>
