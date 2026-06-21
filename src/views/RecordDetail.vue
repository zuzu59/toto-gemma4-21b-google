<template>
  <div class="page">
    <div v-if="!record && !isEditing" class="empty-state">
      <button @click="$router.push('/records')">Retour aux records</button>
    </div>
    
    <div v-else>
      <div class="header">
        <h1>{{ record?.serviceName || 'Nouveau Service' }}</h1>
        <div class="actions">
          <button v-if="viewMode" @click="switchMode" class="btn-edit">Modifier</button>
          <button v-else @click="saveRecord" class="btn-success">Enregistrer</button>
          <button @click="deleteRecord" class="btn-danger" v-if="record?.id">Supprimer</button>
        </div>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>Nom du service</label>
          <div v-if="!viewMode">
            <input v-model="formData.serviceName" type="text" />
            <button v-if="formData.serviceName" @click="copyToClipboard(formData.serviceName, $event.target)" class="btn-copy">Copier</button>
          </div>
          <span v-else>
            {{ formData.serviceName }}
            <button v-if="formData.serviceName" @click="copyToClipboard(formData.serviceName, $event.target)" class="btn-copy">Copier</button>
          </span>
        </div>

        <div class="field">
          <label>IP</label>
          <div v-if="!viewMode">
            <input v-model="formData.ip" type="text" />
            <button v-if="formData.ip" @click="copyToClipboard(formData.ip, $event.target)" class="btn-copy">Copier</button>
          </div>
          <span v-else>
            {{ formData.ip }}
            <button v-if="formData.ip" @click="copyToClipboard(formData.ip, $event.target)" class="btn-copy">Copier</button>
          </span>
        </div>

        <div class="field">
          <label>URL</label>
          <div v-if="!viewMode">
            <input v-model="formData.url" type="text" />
            <button v-if="formData.url" @click="copyToClipboard(formData.url, $event.target)" class="btn-copy">Copier</button>
          </div>
          <span v-else>
            {{ formData.url }}
            <button v-if="formData.url" @click="copyToClipboard(formData.url, $event.target)" class="btn-copy">Copier</button>
          </span>
        </div>

        <div class="field">
          <label>Description</label>
          <textarea v-if="!viewMode" v-model="formData.description" rows="3"></textarea>
          <span v-else>{{ formData.description }}</span>
        </div>

        <div class="field">
          <label>Tags</label>
          <div v-if="!viewMode" class="tag-input-container">
            <div class="tag-chips">
              <span v-for="(tag, index) in formData.tagIds" :key="index" class="tag-chip">
                {{ tag }}
                <button @click="removeTag(index)" class="tag-remove">✕</button>
              </span>
            </div>
            <input v-model="tagInput" @keydown.enter="addTag" placeholder="Ajouter un tag (Entrée)" />
          </div>
          <div v-else class="tag-list">
            <span v-for="tag in formData.tagIds" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>
        </div>

        <div class="field">
          <label>Note</label>
          <textarea v-if="!viewMode" v-model="formData.note" rows="3"></textarea>
          <span v-else>{{ formData.note }}</span>
        </div>

        <hr class="divider" />
        <h3 class="section-title">Secrets</h3>

        <div class="form-grid">
          <div class="field">
            <label>SSH 1 User</label>
            <div v-if="!viewMode">
              <input v-model="formData.ssh1User" type="text" />
              <button v-if="formData.ssh1User" @click="copyToClipboard(formData.ssh1User, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              {{ formData.ssh1User }}
              <button v-if="formData.ssh1User" @click="copyToClipboard(formData.ssh1User, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>
          <div class="field">
            <label>SSH 1 Pass</label>
            <div v-if="!viewMode">
              <div class="password-field">
                <input v-if="!isLocked || isEditingSecret" :type="visiblePasswords.has('ssh1Password') ? 'text' : 'password'" v-model="formData.ssh1Password" />
                <span v-else>🔒 Verrouillé</span>
                <button v-if="formData.ssh1Password && (!isLocked || isEditingSecret)" @click="togglePassword('ssh1Password')" class="password-toggle">{{ visiblePasswords.has('ssh1Password') ? '🙈' : '👁' }}</button>
                <button v-if="formData.ssh1Password && (!isLocked || isEditingSecret)" @click="copyToClipboard(formData.ssh1Password, $event.target)" class="btn-copy">Copier</button>
              </div>
            </div>
            <span v-else class="password-field">
              <span v-if="!visiblePasswords.has('ssh1Password')">********</span>
              <span v-else>{{ formData.ssh1Password }}</span>
              <button v-if="formData.ssh1Password" @click="togglePassword('ssh1Password')" class="password-toggle">{{ visiblePasswords.has('ssh1Password') ? '🙈' : '👁' }}</button>
              <button v-if="formData.ssh1Password" @click="copyToClipboard(formData.ssh1Password, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>

          <div class="field">
            <label>SSH 1 String</label>
            <div v-if="!viewMode">
              <input v-model="formData.ssh1String" type="text" />
              <button v-if="formData.ssh1String" @click="copyToClipboard(formData.ssh1String, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              {{ formData.ssh1String }}
              <button v-if="formData.ssh1String" @click="copyToClipboard(formData.ssh1String, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>
          <div class="field">
            <label>SSH 2 User</label>
            <div v-if="!viewMode">
              <input v-model="formData.ssh2User" type="text" />
              <button v-if="formData.ssh2User" @click="copyToClipboard(formData.ssh2User, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              {{ formData.ssh2User }}
              <button v-if="formData.ssh2User" @click="copyToClipboard(formData.ssh2User, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>
          <div class="field">
            <label>SSH 2 Pass</label>
            <div v-if="!viewMode">
              <div class="password-field">
                <input v-if="!isLocked || isEditingSecret" :type="visiblePasswords.has('ssh2Password') ? 'text' : 'password'" v-model="formData.ssh2Password" />
                <span v-else>🔒 Verrouillé</span>
                <button v-if="formData.ssh2Password && (!isLocked || isEditingSecret)" @click="togglePassword('ssh2Password')" class="password-toggle">{{ visiblePasswords.has('ssh2Password') ? '🙈' : '👁' }}</button>
                <button v-if="formData.ssh2Password && (!isLocked || isEditingSecret)" @click="copyToClipboard(formData.ssh2Password, $event.target)" class="btn-copy">Copier</button>
              </div>
            </div>
            <span v-else class="password-field">
              <span v-if="!visiblePasswords.has('ssh2Password')">********</span>
              <span v-else>{{ formData.ssh2Password }}</span>
              <button v-if="formData.ssh2Password" @click="togglePassword('ssh2Password')" class="password-toggle">{{ visiblePasswords.has('ssh2Password') ? '🙈' : '👁' }}</button>
              <button v-if="formData.ssh2Password" @click="copyToClipboard(formData.ssh2Password, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>

          <div class="field">
            <label>SSH 2 String</label>
            <div v-if="!viewMode">
              <input v-model="formData.ssh2String" type="text" />
              <button v-if="formData.ssh2String" @click="copyToClipboard(formData.ssh2String, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              {{ formData.ssh2String }}
              <button v-if="formData.ssh2String" @click="copyToClipboard(formData.ssh2String, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>

          <div class="field">
            <label>HTML 1 User</label>
            <div v-if="!viewMode">
              <input v-model="formData.html1User" type="text" />
              <button v-if="formData.html1User" @click="copyToClipboard(formData.html1User, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              {{ formData.html1User }}
              <button v-if="formData.html1User" @click="copyToClipboard(formData.html1User, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>
          <div class="field">
            <label>HTML 1 Pass</label>
            <div v-if="!viewMode">
              <div class="password-field">
                <input v-if="!isLocked || isEditingSecret" :type="visiblePasswords.has('html1Password') ? 'text' : 'password'" v-model="formData.html1Password" />
                <span v-else>🔒 Verrouillé</span>
                <button v-if="formData.html1Password && (!isLocked || isEditingSecret)" @click="togglePassword('html1Password')" class="password-toggle">{{ visiblePasswords.has('html1Password') ? '🙈' : '👁' }}</button>
                <button v-if="formData.html1Password && (!isLocked || isEditingSecret)" @click="copyToClipboard(formData.html1Password, $event.target)" class="btn-copy">Copier</button>
              </div>
            </div>
            <span v-else class="password-field">
              <span v-if="!visiblePasswords.has('html1Password')">********</span>
              <span v-else>{{ formData.html1Password }}</span>
              <button v-if="formData.html1Password" @click="togglePassword('html1Password')" class="password-toggle">{{ visiblePasswords.has('html1Password') ? '🙈' : '👁' }}</button>
              <button v-if="formData.html1Password" @click="copyToClipboard(formData.html1Password, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>

          <div class="field">
            <label>HTML 1 String</label>
            <div v-if="!viewMode">
              <input v-model="formData.html1String" type="text" />
              <button v-if="formData.html1String" @click="copyToClipboard(formData.html1String, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              {{ formData.html1String }}
              <button v-if="formData.html1String" @click="copyToClipboard(formData.html1String, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>
          <div class="field">
            <label>HTML 2 User</label>
            <div v-if="!viewMode">
              <input v-model="formData.html2User" type="text" />
              <button v-if="formData.html2User" @click="copyToClipboard(formData.html2User, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              {{ formData.html2User }}
              <button v-if="formData.html2User" @click="copyToClipboard(formData.html2User, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>
          <div class="field">
            <label>HTML 2 Pass</label>
            <div v-if="!viewMode">
              <div class="password-field">
                <input v-if="!isLocked || isEditingSecret" :type="visiblePasswords.has('html2Password') ? 'text' : 'password'" v-model="formData.html2Password" />
                <span v-else>🔒 Verrouillé</span>
                <button v-if="formData.html2Password && (!isLocked || isEditingSecret)" @click="togglePassword('html2Password')" class="password-toggle">{{ visiblePasswords.has('html2Password') ? '🙈' : '👁' }}</button>
                <button v-if="formData.html2Password && (!isLocked || isEditingSecret)" @click="copyToClipboard(formData.html2Password, $event.target)" class="btn-copy">Copier</button>
              </div>
            </div>
            <span v-else class="password-field">
              <span v-if="!visiblePasswords.has('html2Password')">********</span>
              <span v-else>{{ formData.html2Password }}</span>
              <button v-if="formData.html2Password" @click="togglePassword('html2Password')" class="password-toggle">{{ visiblePasswords.has('html2Password') ? '🙈' : '👁' }}</button>
              <button v-if="formData.html2Password" @click="copyToClipboard(formData.html2Password, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>

          <div class="field">
            <label>HTML 2 String</label>
            <div v-if="!viewMode">
              <input v-model="formData.html2String" type="text" />
              <button v-if="formData.html2String" @click="copyToClipboard(formData.html2String, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              {{ formData.html2String }}
              <button v-if="formData.html2String" @click="copyToClipboard(formData.html2String, $event.target)" class="btn-copy">Copier</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { db } from '../db/database'
import { CryptoService } from '../services/crypto'
import { AuthService } from '../services/auth'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const record = ref(null)
const viewMode = ref(true)
const formData = reactive({})
const tagInput = ref('')
const isLocked = ref(false)
const isEditingSecret = ref(false)
const isEditing = ref(false) // true when creating new record (no id)
const visiblePasswords = ref(new Set()) // Tracks which passwords are currently visible
let autoLockTimer = null

// Toggle password visibility
const togglePassword = (field) => {
  if (visiblePasswords.value.has(field)) {
    visiblePasswords.value.delete(field)
  } else {
    visiblePasswords.value.add(field)
  }
  visiblePasswords.value = new Set(visiblePasswords.value) // Trigger reactivity
}

// Hide all visible passwords when clicking outside
const hideAllPasswords = () => {
  if (visiblePasswords.value.size > 0) {
    visiblePasswords.value = new Set()
  }
}

// Watch for clicks outside password fields
let clickHandler = null
const setupClickHandler = () => {
  clickHandler = (e) => {
    // If clicked on a toggle button, do nothing (togglePassword handles it)
    if (e.target.closest('.password-toggle')) {
      return
    }
    // Otherwise hide all visible passwords
    hideAllPasswords()
  }
  document.addEventListener('click', clickHandler)
}

const removeClickHandler = () => {
  if (clickHandler) {
    document.removeEventListener('click', clickHandler)
  }
}

onMounted(async () => {
  const id = route.params.id
  if (id) {
    const data = await db.records.get(Number(id))
    record.value = data
    
    if (data) {
      Object.assign(formData, data)
      await decryptSecrets()
    } else {
      resetFormData()
    }
  } else {
    // Creating a new record — show form in edit mode
    resetFormData()
    isEditing.value = true
    viewMode.value = false
  }

  setupAutoLock()
  setupClickHandler()
})

onUnmounted(() => {
  removeClickHandler()
})

const resetFormData = () => {
  formData.serviceName = ''
  formData.ip = ''
  formData.url = ''
  formData.description = ''
  formData.note = ''
  formData.tagIds = []
  formData.ssh1User = ''
  formData.ssh1Password = ''
  formData.ssh1String = ''
  formData.ssh2User = ''
  formData.ssh2Password = ''
  formData.ssh2String = ''
  formData.html1User = ''
  formData.html1Password = ''
  formData.html1String = ''
  formData.html2User = ''
  formData.html2Password = ''
  formData.html2String = ''
}

const setupAutoLock = () => {
  autoLockTimer = setInterval(() => {
    if (viewMode.value) {
      isLocked.value = true
    }
  }, 10 * 60 * 1000)
}

const decryptSecrets = async () => {
  const key = AuthService.getMasterKey()
  if (!key) return

  const secrets = ['ssh1Password', 'ssh2Password', 'html1Password', 'html2Password']
  for (const field of secrets) {
    if (formData[field] && typeof formData[field] === 'string') {
      try {
        const parsed = JSON.parse(formData[field])
        
        // Handle both base64 and array formats for backwards compatibility
        let ciphertextBuf
        let ivBuf
        
        // Check if base64
        if (typeof parsed.ciphertext === 'string' && !Array.isArray(parsed.ciphertext)) {
          const ciphertextBytes = Uint8Array.from(atob(parsed.ciphertext), c => c.charCodeAt(0))
          ciphertextBuf = ciphertextBytes.buffer
          const ivBytes = Uint8Array.from(atob(parsed.iv), c => c.charCodeAt(0))
          ivBuf = ivBytes
        } else if (Array.isArray(parsed.ciphertext)) {
          // Old format: array of bytes
          const ciphertextBytes = new Uint8Array(parsed.ciphertext)
          ciphertextBuf = ciphertextBytes.buffer.slice(ciphertextBytes.byteOffset, ciphertextBytes.byteOffset + ciphertextBytes.byteLength)
          ivBuf = new Uint8Array(parsed.iv)
        }
        
        formData[field] = await CryptoService.decrypt(ciphertextBuf, ivBuf, key)
      } catch (e) {
        console.error('Decryption failed for', field, e)
      }
    }
  }
}

const switchMode = () => {
  viewMode.value = !viewMode.value
  if (!viewMode.value) {
    isLocked.value = false
  }
}

const addTag = () => {
  if (tagInput.value && !formData.tagIds.includes(tagInput.value)) {
    formData.tagIds.push(tagInput.value)
    tagInput.value = ''
  }
}

const removeTag = (index) => {
  formData.tagIds.splice(index, 1)
}

const copyToClipboard = (text, btn) => {
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    btn.innerText = 'Copié'
    setTimeout(() => {
      btn.innerText = 'Copier'
    }, 2000)
  })
}

const saveRecord = async () => {
  const key = AuthService.getMasterKey()
  if (!key) {
    alert('Clé maîtresse non disponible.')
    return
  }

  const secrets = ['ssh1Password', 'ssh2Password', 'html1Password', 'html2Password']
  for (const field of secrets) {
    if (formData[field]) {
      const { ciphertext, iv } = await CryptoService.encrypt(formData[field], key)
      // Convert to base64 for reliable JSON storage
      const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
      const ivBase64 = btoa(String.fromCharCode(...new Uint8Array(iv)))
      formData[field] = JSON.stringify({ ciphertext: ciphertextBase64, iv: ivBase64 })
    }
  }

  // Convert Vue reactive object to plain object for IndexedDB
  const dataToSave = {
    serviceName: formData.serviceName,
    ip: formData.ip,
    url: formData.url,
    description: formData.description,
    note: formData.note,
    tagIds: Array.isArray(formData.tagIds) ? [...formData.tagIds] : [],
    ssh1User: formData.ssh1User,
    ssh1Password: formData.ssh1Password,
    ssh1String: formData.ssh1String,
    ssh2User: formData.ssh2User,
    ssh2Password: formData.ssh2Password,
    ssh2String: formData.ssh2String,
    html1User: formData.html1User,
    html1Password: formData.html1Password,
    html1String: formData.html1String,
    html2User: formData.html2User,
    html2Password: formData.html2Password,
    html2String: formData.html2String,
    createdAt: formData.createdAt || new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  }
  
  if (record.value?.id) {
    await db.records.update(Number(record.value.id), dataToSave)
  } else {
    await db.records.add(dataToSave)
  }
  router.push('/records')
}

const deleteRecord = async () => {
  if (confirm('Supprimer ce service ?')) {
    await db.records.delete(Number(record.value.id))
    router.push('/records')
  }
}
</script>

<style scoped>
.page {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
}
.header h1 {
  color: #ffffff;
  font-size: 1.8rem;
  margin: 0;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}
.field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.field label {
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #ffffff;
  font-size: 0.95rem;
}
.field > div,
.field > span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.password-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.password-field input {
  flex: 1;
  min-width: 120px;
}
.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.tag-chip {
  background: var(--accent-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: white;
}
.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 4px;
  padding: 0 4px;
  font-size: 0.9rem;
}
.btn-copy {
  margin: 0;
  padding: 0 10px;
  font-size: 0.8rem;
  font-weight: 600;
  height: 36px;
  white-space: nowrap;
}
.password-toggle {
  margin: 0;
  padding: 0 8px;
  font-size: 1.1rem;
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}
.password-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}
.btn-success { background: #2e7d32; }
.btn-danger { background: #c62828; }
.btn-edit { background: #f57c00; }
.divider {
  border: 0;
  border-top: 2px solid var(--border-color);
  margin: 2rem 0;
}
.section-title {
  margin-bottom: 1rem;
  color: #ffffff;
  font-size: 1.3rem;
}
.empty-state {
  text-align: center;
  padding: 4rem;
  color: #ffffff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page {
    padding: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .header h1 {
    font-size: 1.5rem;
  }
  .field > div,
  .field > span,
  .password-field {
    flex-direction: column;
    align-items: stretch;
  }
  .btn-copy,
  .password-toggle {
    width: 100%;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
