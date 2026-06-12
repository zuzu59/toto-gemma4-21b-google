<template>
  <div class="page">
    <div class="toolbar">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Rechercher (ex: Proxmox 192.168)" 
        class="search-input"
      />
      <div class="actions">
        <button @click="goToCreate" class="btn-success">+ Ajouter</button>
      </div>
    </div>

    <div class="table-container">
      <table class="records-table">
        <thead class="table-header">
          <tr class="table-header-row">
            <th class="col-name" @click="sort('serviceName')">{{ sortKey === 'serviceName' ? (sortDir === 'asc' ? '▲' : '▼') : '' }} Nom du service</th>
            <th class="col-ip" @click="sort('ip')">{{ sortKey === 'ip' ? (sortDir === 'asc' ? '▲' : '▼') : '' }} IP</th>
            <th class="col-url" @click="sort('url')">{{ sortKey === 'url' ? (sortDir === 'asc' ? '▲' : '▼') : '' }} URL</th>
            <th class="col-date" @click="sort('modifiedAt')">{{ sortKey === 'modifiedAt' ? (sortDir === 'asc' ? '▲' : '▼') : '' }} Modifié</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in paginatedRecords" :key="record.id">
            <td class="col-name">{{ record.serviceName }}</td>
            <td class="col-ip">{{ record.ip }}</td>
            <td class="col-url">{{ record.url }}</td>
            <td class="col-date">{{ new Date(record.modifiedAt).toLocaleString() }}</td>
            <td class="col-actions">
              <button @click="goToRecord(record.id)" class="btn-view">Voir</button>
              <button @click="goToRecord(record.id)" class="btn-edit">Modifier</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Précédent</button>
        <span>Page {{ currentPage }}</span>
        <button @click="nextPage" :disabled="currentPage * 10 >= filteredRecords.length">Suivant</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../db/database'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const currentPage = ref(1)
const records = ref([])

const sortKey = ref('modifiedAt')
const sortDir = ref('desc')

const fetchRecords = async () => {
  const allRecords = await db.records.toArray()
  records.value = allRecords
}

onMounted(fetchRecords)

const sort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const filteredRecords = computed(() => {
  let data = records.value
  
  if (!searchQuery.value) {
    // No search, just sort
  } else {
    const terms = searchQuery.value.split(' ').filter(t => t !== '')
    data = data.filter(record => {
      const content = [
        record.serviceName,
        record.ip,
        record.url,
        record.description,
        record.note,
        record.ssh1String,
        record.ssh1User,
        record.ssh2String,
        record.ssh2User,
        record.html1String,
        record.html1User,
        record.html2String,
        record.html2User,
        record.tagIds ? record.tagIds.join(' ') : ''
      ].join(' ').toLowerCase()
      
      return terms.every(term => content.includes(term.toLowerCase()))
    })
  }

  return data.sort((a, b) => {
    let valA = a[sortKey.value] || ''
    let valB = b[sortKey.value] || ''
    
    if (sortKey.value === 'modifiedAt') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    }
    
    if (valA < valB) return sortDir.value === 'asc' ? -1 : 1
    if (valA > valB) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * 10
  return filteredRecords.value.slice(start, start + 10)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value * 10 < filteredRecords.value.length) currentPage.value++
}

const goToRecord = (id) => {
  router.push({ name: 'RecordDetail', params: { id } })
}

const goToCreate = () => {
  router.push({ name: 'RecordDetail' })
}
</script>

<style scoped>
.page {
  padding: 1rem;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.search-input {
  width: 100%;
  max-width: 400px;
}
.table-container {
  overflow-x: auto;
}
.records-table {
  width: 100%;
  border-collapse: collapse;
}
.table-header th {
  background: #222;
  padding: 12px;
  border-bottom: 2px solid var(--border-color);
}
.records-table td {
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
}
.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}
.btn-view {
  background: #2e7d32;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 4px;
}
.btn-edit {
  background: #f57c00;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
}
.col-name { width: 30%; }
.col-ip { width: 15%; }
.col-url { width: 25%; }
.col-date { width: 15%; }
.col-actions { width: 10%; }
</style>
