<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Z-Services</h1>
      
      <!-- First-time setup -->
      <template v-if="isSetupMode">
        <p>Créez votre mot de passe maître pour la première fois.</p>
        <form @submit.prevent="handleSetup">
          <div class="form-group">
            <label for="password1">Mot de passe maître</label>
            <div class="input-wrapper">
              <input 
                :id="'password1'" 
                :type="showPassword1 ? 'text' : 'password'" 
                v-model="password1" 
                placeholder="••••••••"
                required
              />
              <div class="toggle-wrapper">
                <button type="button" class="toggle-visibility" @click="showPassword1 = !showPassword1">
                  {{ showPassword1 ? '🙈' : '👁' }}
                </button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label for="password2">Confirmez le mot de passe maître</label>
            <div class="input-wrapper">
              <input 
                id="password2" 
                :type="showPassword2 ? 'text' : 'password'" 
                v-model="password2" 
                placeholder="••••••••"
                required
              />
              <div class="toggle-wrapper">
                <button type="button" class="toggle-visibility" @click="showPassword2 = !showPassword2">
                  {{ showPassword2 ? '🙈' : '👁' }}
                </button>
              </div>
            </div>
            <small v-if="password1 && password2 && password1 !== password2" class="match-error">Les mots de passe ne correspondent pas.</small>
          </div>
          <button type="submit" :disabled="isLoading || password1 !== password2 || !password1 || !password2">
            Créer mon mot de passe
          </button>
        </form>
      </template>
      
      <!-- Regular login -->
      <template v-else>
        <p>Entrez votre mot de passe maître pour déverrouiller l'application.</p>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="password">Mot de passe Maître</label>
            <div class="input-wrapper">
              <input 
                id="password" 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="••••••••"
                required
              />
              <div class="toggle-wrapper">
                <button type="button" class="toggle-visibility" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁' }}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" :disabled="isLoading">Déverrouiller</button>
        </form>
      </template>
      
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AuthService } from '../services/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const isSetupMode = ref(false)
const password = ref('')
const password1 = ref('')
const password2 = ref('')
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showPassword1 = ref(false)
const showPassword2 = ref(false)

onMounted(() => {
  isSetupMode.value = !localStorage.getItem('master_salt')
})

const handleSetup = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    localStorage.setItem('master_salt', btoa(String.fromCharCode.apply(null, salt)))

    await AuthService.initialize(password1.value, salt)
    router.push('/records')
  } catch (e) {
    error.value = 'Une erreur est survenue lors de la création du mot de passe.'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

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
.input-wrapper {
  position: relative;
}
.input-wrapper input {
  width: 100%;
  padding: 0.8rem;
  padding-right: 3rem;
  border-radius: 4px;
  border: 1px solid #333;
  background: #2c2c2c;
  color: #fff;
  box-sizing: border-box;
}
.toggle-wrapper {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  pointer-events: none;
}
.toggle-visibility {
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  pointer-events: auto;
}
.toggle-visibility:hover {
  opacity: 1;
  background: rgba(255,255,255,0.1);
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
.match-error {
  color: #f44336;
  font-size: 0.8rem;
  display: block;
  margin-top: 4px;
}
</style>
