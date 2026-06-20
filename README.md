# z-services
zf260605.1135


Petite appli pour smartphone PWA offline qui permet de gérer mes services hébergés chez moi

Pour l'instant le dev se trouve dans la branche V1

---

## 🧪 Procédure de test

### Prérequis
- Accès SSH à la machine `192.168.0.92` (serveur)
- Navigateur sur ton PC

### Démarrage du serveur
Le serveur est déjà lancé automatiquement sur le port 4173 en localhost.
Si besoin de le redémarrer :
```bash
cd /home/ubuntu/dev/toto-gemma4-21b-google
npx vite dev --port 4173 --host 127.0.0.1
```

### Accès via tunnel SSH
**Important :** Le Web Crypto API (`crypto.subtle`) n'est disponible que dans un contexte sécurisé (localhost ou HTTPS).
L'accès direct par IP `192.168.x.x` n'est PAS un contexte sécurisé → `crypto.subtle` est `undefined` → erreur cryptographique.

**Solution : utiliser un tunnel SSH**

1. **Ouvre un terminal sur TON PC**
2. **Lance le tunnel :**
   ```bash
   ssh -L 4173:127.0.0.1:4173 ubuntu@192.168.0.92
   ```
3. **Ouvre dans ton navigateur :**
   ```
   http://localhost:4173
   ```

### Scénarios de test

#### Test 1 : Premier lancement (Setup)
1. Vider le localStorage (F12 → Application → Local Storage → Clear)
2. Aller sur `http://localhost:4173`
3. **Résultat attendu :** formulaire de setup avec 2 champs de mot de passe + bouton "Créer mon mot de passe"
4. Remplir les 2 champs avec le même mot de passe (ex: `TestPass123`)
5. Cliquer sur "Créer mon mot de passe"
6. **Résultat attendu :** redirection vers la page Records (tableau vide)

#### Test 2 : Toggle visibilité du mot de passe
1. Sur le formulaire setup ou login
2. Cliquer sur l'icône 👁 à côté du champ mot de passe
3. **Résultat attendu :** le mot de passe s'affiche/masque
4. Cliquer à nouveau → retour à masqué

#### Test 3 : Connexion normale
1. Après un premier setup, faire une page reload
2. **Résultat attendu :** formulaire de login classique (1 champ mot de passe)
3. Entrer le mot de passe créé au setup
4. **Résultat attendu :** redirection vers Records

#### Test 4 : Reset factory
1. Sur la page Records, cliquer sur le menu hamburger (☰)
2. Cliquer sur "⚠ Réinitialisation usine"
3. Confirmer le dialogue
4. **Résultat attendu :** retour au formulaire de setup (comme Test 1)

#### Test 5 : Erreur mot de passe incorrect
1. Sur le formulaire login, entrer un mot de passe différent de celui créé au setup
2. **Résultat attendu :** message "Mot de passe incorrect." en rouge

### Vérification des screenshots
Les screenshots sont sauvegardés dans :
```
/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/
```
Format : `YYYYMMDD.HHMM_type.png` (ex: `260620.1048_setup.png`)

### Problèmes courants

| Symptôme | Cause | Solution |
|---|---|---|
| `crypto.subtle is undefined` | Accès via IP `192.168.x.x` (pas sécurisé) | Utiliser tunnel SSH + `http://localhost:4173` |
| Click sur le champ → toggle au lieu de focus | Bug CSS (fixé en v0.3.3) | Vérifier que le code est à jour |
| Page blanche après setup | Erreur de navigation | Console F12 → chercher l'erreur |
| Serveur ne répond pas | Port occupé ou serveur arrêté | `lsof -i:4173` pour vérifier |
