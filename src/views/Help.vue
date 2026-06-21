<template>
  <div class="page">
    <h1 class="page-title">Aide</h1>
    <div class="help-content">
      <h2>Utilisation de Z-Services</h2>
      <p>Z-Services vous permet de gérer vos services hébergés à domicile de manière sécurisée.</p>
      
      <h3>Fonctionnalités</h3>
      <ul>
        <li><strong>Gestion de services</strong> : Ajoutez, modifiez et supprimez vos services</li>
        <li><strong>Chiffrement</strong> : Tous les mots de passe sont chiffrés avec AES-GCM 256 bits</li>
        <li><strong>Recherche</strong> : Recherchez dans tous les champs avec logique AND</li>
        <li><strong>Import/Export</strong> : Exportez en CSV ou JSON, importez avec confirmation</li>
      </ul>
      
      <h3>Sécurité</h3>
      <ul>
        <li>Mot de passe maître avec PBKDF2 (600 000 itérations)</li>
        <li>Chiffrement AES-GCM pour les passwords</li>
        <li>Verrouillage automatique après 10 minutes d'inactivité</li>
      </ul>
    </div>
  </div>
</template>

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
.help-content {
  color: #ffffff;
  line-height: 1.8;
  max-width: 800px;
}
.help-content h2 {
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}
.help-content h3 {
  color: #ffffff;
  font-size: 1.2rem;
  margin: 1.5rem 0 1rem 0;
  font-weight: 700;
}
.help-content p {
  margin: 0 0 1rem 0;
}
.help-content ul {
  margin: 0 0 1.5rem 1.5rem;
  padding: 0;
}
.help-content li {
  margin-bottom: 0.5rem;
}
.help-content strong {
  color: #64b5f6;
}
</style>
