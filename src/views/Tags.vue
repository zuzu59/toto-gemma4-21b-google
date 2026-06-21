<template>
  <div class="page">
    <h1 class="page-title">Tags</h1>
    
    <div class="tag-management">
      <div class="form-group">
        <input v-model="newTag" @keydown.enter="addTag" placeholder="Nouveau tag..." />
        <button @click="addTag">Ajouter</button>
      </div>

      <ul class="tag-list">
        <li v-for="tag in tags" :key="tag.id">
          <span>{{ tag.name }}</span>
          <button @click="deleteTag(tag.id)" class="btn-delete">✕</button>
        </li>
        <li v-if="tags.length === 0">Aucun tag disponible.</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../db/database'

const tags = ref([])
const newTag = ref('')

const fetchTags = async () => {
  tags.value = await db.tags.toArray()
}

onMounted(fetchTags)

const addTag = async () => {
  if (newTag.value && !tags.value.some(t => t.name === newTag.value)) {
    await db.tags.add({ name: newTag.value })
    newTag.value = ''
    fetchTags()
  }
}

const deleteTag = async (id) => {
  await db.tags.delete(Number(id))
  fetchTags()
}
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
.tag-management {
  max-width: 600px;
}
.form-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
.form-group input {
  flex-grow: 1;
}
.tag-list {
  list-style: none;
  padding: 0;
}
.tag-list li {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  color: #ffffff;
  font-weight: 500;
}
.tag-list li:hover {
  background: #2a2a2a;
}
.btn-delete {
  background: none;
  border: none;
  color: #ff5252;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px 8px;
  border-radius: 4px;
}
.btn-delete:hover {
  background: rgba(255, 82, 82, 0.2);
}
</style>
