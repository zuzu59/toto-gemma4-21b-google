<template>
  <div class="page">
    <h1 class="page-title">Outils</h1>
    <div class="tools-grid">
      <div class="tool-card">
        <h3>Données</h3>
        <button @click="exportRecordsCSV">Exporter CSV</button>
        <button @click="importRecordsCSV">Importer CSV</button>
        <button @click="exportRecordsJSON">Exporter JSON</button>
        <button @click="importRecordsJSON">Importer JSON</button>
      </div>
      <div class="tool-card">
        <h3>Configuration</h3>
        <button @click="exportConfigJSON">Exporter Config</button>
        <button @click="importConfigJSON">Importer Config</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { db } from '../db/database'
import { AuthService } from '../services/auth'
import { CryptoService } from '../services/crypto'

const exportRecordsCSV = async () => {
  const records = await db.records.toArray()
  if (records.length === 0) return alert('Aucun record à exporter.')
  
  let csv = 'serviceName,ip,url,description,note,createdAt,modifiedAt\n'
  records.forEach(r => {
    csv += `"${r.serviceName}","${r.ip}","${r.url}","${r.description.replace(/"/g, '""')}","${r.note}","${r.createdAt}","${r.modifiedAt}"\n`
  })
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'z-services-records.csv'
  link.click()
}

const importRecordsCSV = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    const text = await file.text()
    const lines = text.split('\n').slice(1)
    
    if (confirm('L\'import CSV va réinitialiser la base de données. Continuer ?')) {
      await db.records.clear()
      for (const line of lines) {
        if (line) {
          const [serviceName, ip, url, description, note, createdAt, modifiedAt] = line.split(',').map(l => l.replace(/"/g, ''))
          await db.records.add({
            serviceName, ip, url, description, note,
            createdAt: createdAt || new Date().toISOString(),
            modifiedAt: modifiedAt || new Date().toISOString(),
            tagIds: []
          })
        }
      }
      alert('Import réussi.')
    }
  }
  input.click()
}

const exportRecordsJSON = async () => {
  const records = await db.records.toArray()
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'z-services-records.json'
  link.click()
}

const importRecordsJSON = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      if (confirm('L\'import JSON va réinitialiser la base de données. Continuer ?')) {
        await db.records.clear()
        for (const item of data) {
          await db.records.add(item)
        }
        alert('Import réussi.')
      }
    } catch (e) {
      alert('Erreur lors de l\'import JSON.')
    }
  }
  input.click()
}

const exportConfigJSON = async () => {
  const config = await db.config.toArray()
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'z-services-config.json'
  link.click()
}

const importConfigJSON = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      await db.config.clear()
      for (const item of data) {
        await db.config.add(item)
      }
      alert('Config importée.')
    } catch (e) {
      alert('Erreur lors de l\'import Config.')
    }
  }
  input.click()
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
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.tool-card {
  border: 2px solid var(--border-color);
  padding: 1.5rem;
  border-radius: 12px;
  background: #2a2a2a;
}
.tool-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
  color: #ffffff;
  font-size: 1.3rem;
  font-weight: 700;
}
.tool-card button {
  display: block;
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 12px;
  background: #333;
  color: #ffffff;
  border: 2px solid #666;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.tool-card button:hover {
  background: #444;
  border-color: #888;
}
.page-title {
  margin-bottom: 2rem;
}
</style>
