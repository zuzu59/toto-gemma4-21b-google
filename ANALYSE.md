# Analyse complète du projet Z-Services

> Date d'analyse : 2026-06-20
> Branche principale : `qwen3-6`
> Version courante : 0.4.0

---

## 1. Vue d'ensemble

Z-Services est une **Progressive Web App (PWA) offline-first** conçue pour gérer en local les services hébergés à la maison (Proxmox, cloud perso). Elle stocke toutes les données dans une base IndexedDB locale chiffrée, avec un système d'authentification basé sur un mot de passe maître.

**Objectif :** Permettre à un administrateur système de stocker et récupérer de manière sécurisée les accès (SSH, HTML) à ses services internes, avec une interface mobile-friendly.

### Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | Vue 3 | ^3.4.0 |
| Build | Vite | ^5.0.0 |
| Routing | Vue Router | ^4.3.0 |
| Base de données | Dexie.js (IndexedDB) | ^3.2.4 |
| PWA | vite-plugin-pwa | ^0.17.0 |
| Test | Playwright | ^1.40.0 |

### Architecture du projet

```
z-services/
├── src/
│   ├── main.js              # Point d'entrée Vue
│   ├── App.vue              # Composant racine
│   ├── components/
│   │   └── Navbar.vue       # Barre de navigation + hamburger
│   ├── views/
│   │   ├── Login.vue        # Authentification + setup initial
│   │   ├── Records.vue      # Liste paginée des services
│   │   ├── RecordDetail.vue # Détail/création/modification d'un service
│   │   ├── Tags.vue         # Gestion des tags
│   │   ├── Tools.vue        # Import/export CSV/JSON
│   │   ├── Help.vue         # Page d'aide (vide)
│   │   └── About.vue        # Infos projet + vérification version GitHub
│   ├── services/
│   │   ├── auth.js          # AuthService (dérivation clé, session)
│   │   └── crypto.js        # CryptoService (PBKDF2, AES-GCM)
│   ├── db/
│   │   └── database.js      # Schéma Dexie (records, tags, config)
│   ├── router/
│   │   └── index.js         # Routes + guards d'authentification
│   └── styles/
│       └── main.css         # Variables CSS + styles globaux
├── scripts/
│   ├── update-version.cjs   # Incrémentation automatique version
│   └── playwright-check.cjs # Capture écran Playwright
├── vite.config.js           # Config Vite + PWA
├── version.json             # Version courante (0.4.0)
├── package.json             # Dépendances
├── PROMPT.md                # Spécifications initiales
├── PROMPT-2.md              # Prompt de référence (plus complet)
├── AGENT.md                 # Flow de travail agent
├── CHANGELOG.md             # Historique des versions
├── kanban-a-faire.md        # Tâches en cours (vide)
├── kanban-termine.md        # Tâches terminées
└── README.md                # Documentation + procédure de test
```

---

## 2. Fichiers de spécification et prompt

### 2.1 PROMPT.md (zf260605.1100, zf260606.1218)

**Rôle :** Première spécification complète du projet.

**Contenu :**
- But : PWA offline pour gérer les services hébergés
- Conditions de développement : Vite, Vue 3, Dexie.js, PWA, GitHub Pages
- Contraintes techniques absolues :
  - PBKDF2 avec SHA-256, salt aléatoire, 600 000 itérations minimum
  - AES-GCM 256 bits, IV de 12 octets unique par chiffrement
  - Gestion mémoire avec Uint8Array et wipe (fill(0))
  - Ne jamais stocker le mot de passe maître ni la clé dérivée
  - Verrouillage automatique après X minutes d'inactivité
  - Interdiction de CryptoJS, sjcl ou autres libs crypto
- Features attendues :
  - Champs du record : nom, IP, URL, description, tags, SSH1/2, HTML1/2, note, dates
  - Formulaire de lecture avec labels (pas de textbox)
  - Recherche full-text avec logique AND
  - CRUD complet sur les records
  - Export/Import CSV (remise à zéro) et JSON (config)
  - Tags en bulles avec croix de suppression
  - Hamburger menu pour fonctions secondaires
  - Versioning avec releases GitHub
  - Page About avec infos GitHub et vérification de version

**Points faibles identifiés :**
- Spécification large mais peu structurée pour un agent
- Pas de modèle de données explicite
- Pas de workflow de validation visuelle détaillé
- Gestion des secrets mal définie (masquage avec hold-click)

### 2.2 PROMPT-2.md (zf260612.0939)

**Rôle :** Prompt de référence amélioré, plus structuré et complet.

**Améliorations par rapport à PROMPT.md :**
- Structure claire avec sections : Mission, Stack, Contraintes, Modèle de données, Comportement, Écrans
- Modèle de données explicite avec tous les champs
- Comportement des secrets mieux défini (masquage, verrouillage)
- Liste des écrans attendus détaillée
- Spécifications de la liste des records (tri, pagination, recherche AND)
- Spécifications de la lecture/édition (boutons Copier, mode verrouillé)
- Gestion des tags plus précise (ajout, modification, suppression, sélection multiple)
- Import/export mieux spécifié (remise à zéro, confirmation)
- Navigation : hamburger à droite, drawer à droite
- Boutons compacts cohérents
- Style sombre, mobile-first, offline-first
- Règle finale : un agent peut reconstruire l'app en suivant ce fichier
- Cycle de validation par navigateur impératif (build → serveur → Playwright → auto-correction)
- Déploiement GitHub Pages uniquement sur demande
- Workflow Git avec mini kanban
- Versions, releases, changelog détaillés

**Points forts :**
- Spécifications exhaustives et actionnables
- Contraintes de sécurité claires
- Workflow de validation visuelle obligatoire
- Règle de reconstruction complète pour un agent

### 2.3 AGENT.md

**Rôle :** Flow de travail à respecter pour l'agent.

**Contenu :**
1. Lire kanban-a-faire.md avant de commencer
2. Modifier le code
3. Déplacer les tâches terminées dans kanban-termine.md
4. Vérifier/build le projet
5. Validation visuelle locale dans Chromium
6. Commit atomique
7. Push immédiat sur GitHub
8. Générer le build statique dans docs/
9. Quand kanban est vide, commit + push pour déclencher le déploiement

**Règles du projet :**
- Toujours pousser sur master (branch gh-pages pour GitHub Pages)
- Déploiement en mode Deploy from branch
- Dossier publié : docs/
- Commits atomiques en français
- Préfixes : new, change, fixe, refact, del
- Version seulement si l'app buildée change réellement
- Serveur local sur port 4173
- Fermer tout autre serveur sur 4174+ avant validation
- Validation visuelle obligatoire (pas seulement DOM)

---

## 3. Architecture technique détaillée

### 3.1 Schéma de base de données (Dexie)

```javascript
db.version(1).stores({
  records: '++id, serviceName, ip, url, createdAt, modifiedAt',
  tags: '++id, name',
  config: 'id, value'
});
```

**Table `records` :**
- `id` : auto-incrément (primary key)
- `serviceName` : nom du service
- `ip` : adresse IP
- `url` : URL du service
- `description` : description libre
- `tagIds` : tableau d'IDs de tags
- `ssh1User`, `ssh1Password`, `ssh1String` : accès SSH 1
- `ssh2User`, `ssh2Password`, `ssh2String` : accès SSH 2
- `html1User`, `html1Password`, `html1String` : accès HTML 1
- `html2User`, `html2Password`, `html2String` : accès HTML 2
- `note` : note libre
- `createdAt` : ISO date string
- `modifiedAt` : ISO date string

**Table `tags` :**
- `id` : auto-incrément (primary key)
- `name` : nom du tag

**Table `config` :**
- `id` : clé unique
- `value` : valeur stockée

### 3.2 Système de chiffrement

**Fichier : `src/services/crypto.js`**

```javascript
const ITERATIONS = 600000;
const KEY_LENGTH = 256;

// Vérification de disponibilité du Web Crypto API
const cryptoAvailable = typeof crypto !== 'undefined' && crypto.subtle !== undefined;
```

**Méthodes :**
- `deriveKey(password, salt)` : PBKDF2 + SHA-256 → CryptoKey
- `encrypt(plainText, key)` : AES-GCM 256 bits, IV 12 octets
- `decrypt(ciphertext, iv, key)` : déchiffrement AES-GCM
- `wipe(array)` : écrasement mémoire avec fill(0)

**Stockage des secrets :**
```javascript
// Format dans IndexedDB :
JSON.stringify({
  ciphertext: ArrayBuffer,  // données chiffrées
  iv: Uint8Array            // vecteur d'initialisation
})
```

**Authentification (`src/services/auth.js`) :**
```javascript
AuthService = {
  initialize(password, salt)  → deriveKey + store dans window.__MASTER_KEY__
  getMasterKey()              → return window.__MASTER_KEY__
  isAuthenticated()           → check window.__MASTER_KEY__ !== undefined
  wipeKey()                   → delete window.__MASTER_KEY__
}
```

**Point critique :** La clé maîtresse est stockée en mémoire (window.__MASTER_KEY__). Elle n'est PAS persistée. La session expire au rechargement de la page.

### 3.3 Router et guards

**Fichier : `src/router/index.js`**

```javascript
routes = [
  { path: '/', name: 'Home', component: Login },
  { path: '/login', name: 'Login', component: Login },
  { path: '/records', name: 'Records', component: Records, meta: { requiresAuth: true } },
  { path: '/record/:id', name: 'RecordDetail', component: RecordDetail, meta: { requiresAuth: true } },
  { path: '/tags', name: 'Tags', component: Tags, meta: { requiresAuth: true } },
  { path: '/tools', name: 'Tools', component: Tools, meta: { requiresAuth: true } },
  { path: '/help', name: 'Help', component: Help, meta: { requiresAuth: true } },
  { path: '/about', name: 'About', component: About, meta: { requiresAuth: true } },
]
```

**Guard d'authentification :**
```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !AuthService.isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

### 3.4 Vue d'ensemble des écrans

| Vue | Route | Auth requise | Description |
|---|---|---|---|
| Login | /, /login | Non | Setup initial ou connexion |
| Records | /records | Oui | Liste paginée (10/page), recherche AND |
| RecordDetail | /record/:id | Oui | CRUD avec secrets masqués |
| Tags | /tags | Oui | Ajout/suppression de tags |
| Tools | /tools | Oui | Import/export CSV/JSON |
| Help | /help | Oui | Page d'aide (vide) |
| About | /about | Oui | Infos, version, vérification GitHub |

---

## 4. Analyse des fichiers de prompt

### 4.1 PROMPT.md (Première version)

**Points forts :**
- Spécification complète des features
- Contraintes de sécurité bien définies
- Modèle de données détaillé

**Points faibles :**
- Pas de workflow de validation
- Spécifications d'UI vagues
- Pas de gestion des cas d'erreur
- Pas de stratégie de test

**Évolution nécessaire :**
- Structurer en sections actionnables
- Ajouter des contraintes de validation visuelle
- Définir un workflow de commit/test

### 4.2 PROMPT-2.md (Version améliorée)

**Points forts :**
- Structure claire et actionnable
- Spécifications exhaustives
- Workflow de validation impératif
- Règle de reconstruction pour agent
- Contraintes de style précises
- Gestion des secrets détaillée

**Points faibles :**
- Pas de mention de l'erreur WebCrypto sur IP non-localhost
- Pas de spécification sur le verrouillage automatique (timer)
- Pas de gestion d'erreur détaillée

### 4.3 AGENT.md

**Points forts :**
- Workflow clair en 9 étapes
- Règles de commit atomique
- Préfixes normalisés
- Validation visuelle obligatoire

**Points faibles :**
- Mention de branch `master` et `gh-pages` en même temps (contradictoire)
- Pas de mention du kanban dans les instructions
- Pas de stratégie de rollback

### 4.4 Comparaison des trois fichiers

| Aspect | PROMPT.md | PROMPT-2.md | AGENT.md |
|---|---|---|---|
| Spécifications fonctionnelles | ✅ Complet | ✅ Complet | ❌ Minimal |
| Contraintes de sécurité | ✅ Complet | ✅ Complet | ❌ Non |
| Workflow agent | ❌ Non | ✅ Complet | ✅ Complet |
| Validation visuelle | ❌ Non | ✅ Obligatoire | ✅ Obligatoire |
| Gestion des erreurs | ❌ Non | ❌ Minime | ❌ Non |
| Recommandations | ✅ | ✅ | ✅ |
| Actionnable par agent | ❌ Moyen | ✅ Excellent | ✅ Bon |

---

## 5. Analyse du code source

### 5.1 Architecture générale

**Forces :**
- Séparation claire des concerns (services, views, components)
- Utilisation de Vue 3 Composition API (`<script setup>`)
- IndexedDB via Dexie.js pour le stockage local
- Chiffrement natif Web Crypto API
- Routing avec guards d'authentification

**Faiblesses :**
- Pas de state management global (Pinia/Vuex)
- Pas de gestion d'erreurs robuste
- Pas de test unitaire (seulement Playwright E2E)
- Pas de validation de formulaires
- Pas de gestion de loading global
- Code durci dans les composants (pas de hooks composables)

### 5.2 Points critiques

#### 5.2.1 Web Crypto API indisponible sur IP non-localhost

**Problème :** `crypto.subtle` n'est disponible que dans un contexte sécurisé (localhost, HTTPS).
Accéder par `192.168.x.x` rend `crypto.subtle` `undefined` → erreur cryptographique.

**Solution implémentée :**
```javascript
// crypto.js
const cryptoAvailable = typeof crypto !== 'undefined' && crypto.subtle !== undefined;

// Si indisponible :
throw new Error('Votre navigateur ne permet pas la sécurité avancée. Utilisez http://127.0.0.1:4173 ou activez HTTPS.')
```

**Recommandation :** Documenter dans le README ou afficher un avertissement.

#### 5.2.2 Verrouillage automatique non implémenté

**Promesse dans PROMPT.md :** "Ajoute un mécanisme de verrouillage automatique après X minutes d'inactivité."

**État actuel :** Timer dans `RecordDetail.vue` mais pas de déverrouillage.
```javascript
const setupAutoLock = () => {
  autoLockTimer = setInterval(() => {
    if (viewMode.value) {
      isLocked.value = true
    }
  }, 10 * 60 * 1000)
}
```

**Recommandation :** Implémenter un système de déverrouillage avec mot de passe maître.

#### 5.2.3 Recherche full-text imparfaite

**État actuel :** Recherche AND basique dans `Records.vue` :
```javascript
const filteredRecords = computed(() => {
  const terms = searchQuery.value.split(' ').filter(t => t !== '')
  return data.filter(record => {
    const content = [...].join(' ').toLowerCase()
    return terms.every(term => content.includes(term.toLowerCase()))
  })
})
```

**Problèmes :**
- Pas d'indexation de recherche
- Pas de scoring de pertinence
- Pas de mise en surbrillance des termes trouvés
- Pas de recherche sur les tags (tagIds est un array d'IDs, pas de noms)

**Recommandation :** Utiliser FlexSearch ou algoliaduckdb-wasm pour une recherche performante.

#### 5.2.4 Import CSV imparfait

**Problème dans `Tools.vue` :**
```javascript
const [serviceName, ip, url, description, note, createdAt, modifiedAt] = 
  line.split(',').map(l => l.replace(/"/g, ''))
```

**Problèmes :**
- Split basique sur virgule (ne gère pas les virgules dans les champs)
- Pas de validation des données importées
- Pas de gestion des sauts de ligne dans les champs CSV
- Pas de mapping des tags

**Recommandation :** Utiliser une lib CSV parsing (papaparse) ou implémenter un parser robuste.

### 5.3 Analyse des vues

#### 5.3.1 Login.vue (269 lignes)

**Fonctionnalités :**
- Détection du premier lancement (setup mode)
- Formulaire de setup avec confirmation de mot de passe
- Formulaire de connexion
- Toggle visibilité du mot de passe
- Gestion d'erreurs détaillée

**Points forts :**
- Messages d'erreur spécifiques (salt, localStorage, crypto, navigation)
- Gestion des 3 modes : setup, login, error
- Validation en temps réel des passwords

**Points faibles :**
- Pas de feedback pendant le chiffrement (loading)
- Pas de gestion de timeout PBKDF2
- Pas de détection de faible complexité de mot de passe

#### 5.3.2 RecordDetail.vue (378 lignes)

**Fonctionnalités :**
- CRUD complet
- Masquage des secrets
- Boutons Copier
- Tags en bulles
- Mode verrouillé

**Points forts :**
- Gestion du mode lecture/édition
- Clonage des données avant persistance
- Décryptage des secrets à la volée

**Points faibles :**
- Verrouillage automatique incomplet (pas de déverrouillage)
- Pas de gestion de session expirée
- Pas de validation des formulaires
- Pas de gestion de chargement

#### 5.3.3 Records.vue (197 lignes)

**Fonctionnalités :**
- Liste paginée (10 records)
- Tri par colonnes
- Recherche full-text AND
- Navigation vers détails

**Points forts :**
- Pagination simple et efficace
- Tri sur colonnes avec indicateurs visuels
- Recherche en temps réel

**Points faibles :**
- Tri sur dates imparfait
- Pas de recherche sur les tags (IDs)
- Pas de surbrillance des termes trouvés
- Pas de tri sur les colonnes non visibles

#### 5.3.4 Navbar.vue (142 lignes)

**Fonctionnalités :**
- Barre de navigation avec titre et recherche
- Hamburger menu à droite
- Drawer latéral
- Reset factory

**Points forts :**
- Hamburger à droite comme spécifié
- Drawer avec fermeture au clic extérieur
- Reset factory avec confirmation

**Points faibles :**
- Recherche non implémentée (TODO)
- Pas de fermeture du drawer au changement de route
- Pas de gestion d'erreur Dexie

### 5.4 Scripts

#### 5.4.1 update-version.cjs

**Fonctionnement :**
- Incrémente la dernière partie de la version (0.0.x)
- À 9, passe à 0.1.0, etc.
- Met à jour version.json et src/version.js

**Problèmes :**
- Incrémente à chaque build, même sans modification fonctionnelle
- Pas de détection de modification de code
- Pas de gestion de la branche git
- Pas de commit automatique

**Recommandation :** Utiliser standard-version ou semantic-release.

#### 5.4.2 playwright-check.cjs

**Fonctionnement :**
- Lance Chromium
- Navigue vers localhost:4173
- Capture écran avec timestamp
- Sauvegarde dans copies-d-ecrans/

**Points forts :**
- Timestamp dans le nom de fichier
- Automatisation de la validation visuelle

**Points faibles :**
- Ne vérifie pas les erreurs
- Ne teste pas les flux
- Pas d'assertions automatisées
- Pas de rapport d'échec

---

## 6. Analyse des dépendances

### 6.1 Dépendances principales

| Dépendance | Version | Utilisations |
|---|---|---|
| vue | ^3.4.0 | Framework principal |
| vue-router | ^4.3.0 | Routing + guards |
| dexie | ^3.2.4 | IndexedDB |
| vite | ^5.0.0 | Build + dev server |
| vite-plugin-pwa | ^0.17.0 | PWA + Service Worker |

### 6.2 Dépendances dev

| Dépendance | Version | Utilisations |
|---|---|---|
| @vitejs/plugin-vue | ^5.0.0 | Plugin Vue pour Vite |
| playwright | ^1.40.0 | Tests E2E |

### 6.3 Analyse des risques

- **Dexie ^3.2.4** : Stable mais pas à jour (3.3.x disponible)
- **Vue 3.4.0** : LTS mais pas la dernière version
- **Playwright ^1.40.0** : Ancien, mise à jour recommandée
- **vite-plugin-pwa ^0.17.0** : Fonctionnel mais pas à jour

**Recommandation :** Mettre à jour les dépendances régulièrement.

---

## 7. Analyse de la sécurité

### 7.1 Points forts

- Chiffrement AES-GCM 256 bits (standard militaire)
- PBKDF2 avec 600 000 itérations (résistant aux attaques brute-force)
- Salt aléatoire unique par utilisateur
- IV unique par chiffrement
- Pas de stockage du mot de passe maître
- Pas de stockage de la clé dérivée
- Clé en mémoire uniquement (supprimée au rechargement)
- Fonction `wipe()` pour écraser la mémoire

### 7.2 Points faibles

- **Mot de passe maître en mémoire** : Accessible via `window.__MASTER_KEY__`
- **Aucune validation de complexité** : Un mot de passe faible est accepté
- **Aucun verrouillage automatique** : Timer présent mais pas de déverrouillage
- **Stockage localStorage** : Salt stocké en clair dans localStorage
- **Aucune protection contre le timing attack** : Pas de comparaison constante
- **Pas de rate limiting** : Tentatives de connexion illimitées
- **Pas de chiffrement des backups** : Export CSV/JSON non chiffré
- **Pas de vérification de checksum** : Import CSV/JSON non validé

### 7.3 Recommandations de sécurité

1. **Valider la complexité du mot de passe** (min 8 caractères, mixte)
2. **Implémenter le verrouillage automatique** avec déverrouillage
3. **Ajouter un rate limiting** (max 5 tentatives)
4. **Chiffrer les exports** (option mot de passe)
5. **Vérifier les checksums à l'import**
6. **Ajouter une protection contre les attaques par timing**

---

## 8. Analyse de l'UX/UI

### 8.1 Points forts

- Interface sombre moderne
- Mobile-first design
- Hamburger menu accessible
- Boutons compacts
- Pagination claire
- Recherche en temps réel
- Toggle visibilité du mot de passe
- Messages d'erreur spécifiques
- Reset factory avec confirmation

### 8.2 Points faibles

- Page Help vide
- Pas de feedback pendant le chiffrement
- Pas de gestion d'erreur globale
- Pas de thème clair/sombre
- Pas d'accessibilité ARIA
- Pas de gestion du clavier (tabindex, focus visible)
- Pas de gestion du redimensionnement
- Pas de support multi-langue
- Pas de gestion du plein écran

### 8.3 Recommandations UX

1. **Ajouter du feedback visuel** pendant les opérations longues (chiffrement)
2. **Implémenter le verrouillage automatique** avec animation
3. **Ajouter une page Help** complète
4. **Ajouter un mode sombre/clair**
5. **Améliorer l'accessibilité** (ARIA, keyboard navigation)
6. **Ajouter des toasts/notifications** pour les actions

---

## 9. Analyse du workflow Git

### 9.1 Préfixes de commit

| Préfixe | Signification | Exemple |
|---|---|---|
| new | Nouvelle fonctionnalité | `new: add export CSV feature` |
| change | Modification de comportement | `change: improve search performance` |
| fixe | Correction de bug | `fixe: fix login validation` |
| refact | Refactorisation | `refact: extract auth logic` |
| del | Suppression | `del: remove unused code` |

### 9.2 Workflow recommandé

1. Lire kanban-a-faire.md
2. Travailler sur une branche dédiée
3. Tester localement
4. Commit atomique avec préfixe
5. Pousser immédiatement
6. Mettre à jour le kanban
7. Build et validation visuelle

### 9.3 Points faibles

- Pas de tests unitaires
- Pas de CI/CD automatisé
- Pas de validation de code (linting, formatting)
- Pas de stratégie de release
- Pas de gestion de merge conflict
- Pas de protection de branche

---

## 10. Analyse de la documentation

### 10.1 Fichiers existants

| Fichier | Utilité | Qualité |
|---|---|---|
| README.md | Documentation principale | ✅ Bonne (procédure de test) |
| CHANGELOG.md | Historique des versions | ✅ Bonne (format Keep a Changelog) |
| PROMPT.md | Spécifications initiales | ✅ Bonne (détaillée) |
| PROMPT-2.md | Prompt de référence | ✅ Excellente (complet) |
| AGENT.md | Flow de travail agent | ✅ Bonne (actionnable) |
| kanban-a-faire.md | Tâches en cours | ❌ Vide |
| kanban-termine.md | Tâches terminées | ✅ Bonne |
| ANALYSE.md | Cette analyse | ✅ Nouvelle |

### 10.2 Points faibles

- Pas de documentation API
- Pas de documentation d'installation
- Pas de documentation de déploiement
- Pas de guide de contribution
- Pas de FAQ

### 10.3 Recommandations

1. **Ajouter une documentation d'installation** (prérequis, setup, build)
2. **Ajouter une documentation de déploiement** (GitHub Pages, custom domain)
3. **Créer un guide de contribution** (règles de commit, workflow)
4. **Ajouter une FAQ** (problèmes courants, solutions)

---

## 11. Analyse des performances

### 11.1 Points forts

- Chiffrement natif (Web Crypto) très performant
- IndexedDB pour le stockage local (pas de réseau)
- Recherche en temps réel (pas de rechargement de page)
- Pagination (pas de chargement de tous les records)
- Code splitting automatique (Vue Router)

### 11.2 Points faibles

- PBKDF2 avec 600 000 itérations = ~200-500ms (peut bloquer l'UI)
- Pas de Web Worker pour le chiffrement
- Pas de mise en cache de la clé
- Pas de recherche indexée (linear scan)
- Pas de virtualisation de la liste (si > 100 records)

### 11.3 Recommandations

1. **Démarrer le chiffrement dans un Web Worker** pour ne pas bloquer l'UI
2. **Mettre en cache la clé** (si session active)
3. **Ajouter un index de recherche** (FlexSearch, lunr.js)
4. **Virtualiser la liste** si > 100 records
5. **Lazy loader les vues** (déjà fait avec Vue Router)

---

## 12. Analyse de la maintenabilité

### 12.1 Points forts

- Code bien organisé (séparation des concerns)
- Utilisation de Vue 3 Composition API
- Commentaires dans le code
- Préfixes de commit standardisés
- Workflow Git clair
- Prompts bien documentés

### 12.2 Points faibles

- Pas de tests unitaires
- Pas de linting/formatting (ESLint, Prettier)
- Pas de stratégie de versioning sémantique
- Pas de CI/CD
- Pas de documentation d'API
- Code durci dans les composants (pas de hooks)

### 12.3 Recommandations

1. **Ajouter des tests unitaires** (Vitest)
2. **Configurer ESLint + Prettier**
3. **Mettre en place une CI/CD** (GitHub Actions)
4. **Extraire les hooks composables**
5. **Ajouter de la documentation API**
6. **Utiliser un gestionnaire de version sémantique** (standard-version)

---

## 13. Synthèse et recommandations prioritaires

### 13.1 Critique (à faire immédiatement)

1. **Implémenter le verrouillage automatique** (déverrouillage + timer)
2. **Valider la complexité du mot de passe**
3. **Ajouter une page Help** (même basique)
4. **Corriger le parsing CSV** (papaparse ou similaire)

### 13.2 Important (à faire prochainement)

1. **Ajouter des tests unitaires** (Vitest)
2. **Configurer ESLint + Prettier**
3. **Mettre en place une CI/CD** (GitHub Actions)
4. **Extraire les hooks composables**
5. **Ajouter une recherche indexée** (lunr.js)

### 13.3 Amélioration continue

1. **Mettre à jour les dépendances**
2. **Ajouter un mode sombre/clair**
3. **Améliorer l'accessibilité** (ARIA)
4. **Ajouter des toasts/notifications**
5. **Chiffrer les exports**
6. **Ajouter une gestion d'erreurs globale**

---

## 14. Historique des versions

| Version | Date | Notes |
|---|---|---|
| 0.0.6 | 2026-06-12 | Authentification, liste records, tags, import/export, PWA |
| 0.3.x | 2026-06-20 | Setup initial, toggle password, fix pointer-events |
| 0.4.0 | 2026-06-20 | Erreurs détaillées, compatibilité WebCrypto |

---

## 15. Conclusion

Z-Services est une application **solide et bien pensée** avec :
- Un chiffrement de niveau militaire (AES-GCM 256 bits)
- Une architecture claire (Vue 3 + Dexie.js + Web Crypto)
- Un workflow Git structuré
- Des prompts bien documentés

Les **points d'amélioration** prioritaires sont :
1. Le verrouillage automatique
2. La validation de mot de passe
3. Les tests unitaires
4. La recherche indexée
5. La page Help

L'application est **production-ready** pour un usage personnel avec un administrateur expérimenté, mais nécessite des améliorations pour une utilisation plus large ou en équipe.

---

*Analyse générée le 2026-06-20 par l'agent. Dernière mise à jour du code : 2026-06-20.*
