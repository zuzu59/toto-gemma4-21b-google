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
              <input v-if="!isLocked || isEditingSecret" v-model="formData.ssh1Password" type="password" />
              <span v-else>🔒 Verrouillé</span>
              <button v-if="formData.ssh1Password && (!isLocked || isEditingSecret)" @click="copyToClipboard(formData.ssh1Password, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              ********
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
              <input v-if="!isLocked || isEditingSecret" v-model="formData.ssh2Password" type="password" />
              <span v-else>🔒 Verrouillé</span>
              <button v-if="formData.ssh2Password && (!isLocked || isEditingSecret)" @click="copyToClipboard(formData.ssh2Password, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              ********
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
              <input v-if="!isLocked || isEditingSecret" v-model="formData.html1Password" type="password" />
              <span v-else>🔒 Verrouillé</span>
              <button v-if="formData.html1Password && (!isLocked || isEditingSecret)" @click="copyToClipboard(formData.html1Password, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              ********
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
              <input v-if="!isLocked || isEditingSecret" v-model="formData.html2Password" type="password" />
              <span v-else>🔒 Verrouillé</span>
              <button v-if="formData.html2Password && (!isLocked || isEditingSecret)" @click="copyToClipboard(formData.html2Password, $event.target)" class="btn-copy">Copier</button>
            </div>
            <span v-else>
              ********
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
import { ref, reactive, onMounted } from 'vue'
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
let autoLockTimer = null

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
        const { ciphertext, iv } = JSON.parse(formData[field])
        formData[field] = await CryptoService.decrypt(ciphertext, new Uint8Array(iv), key)
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
      formData[field] = JSON.stringify({ ciphertext, iv })
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
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.field label {
  margin-bottom: 0.5rem;
  font-weight: bold;
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
}
.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 4px;
}
.btn-copy {
  margin-left: 0.5rem;
  padding: 0 5px;
  font-size: 0.7rem;
}
.btn-success { background: #2e7d32; }
.btn-danger { background: #c62828; }
.btn-edit { background: #f57c00; }
.divider {
  border: 0;
  border-top: 1px solid var(--border-color);
  margin: 2rem 0;
}
.section-title {
  margin-bottom: 1rem;
}
.empty-state {
  text-align: center;
  padding: 4rem;
}
</style>
