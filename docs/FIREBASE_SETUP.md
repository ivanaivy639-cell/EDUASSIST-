# Guide de Configuration Firebase - EduAssist

## Etape 1: Creer un projet Firebase

1. Allez sur https://console.firebase.google.com
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Ajouter un projet"
4. Nommez le projet: `eduassist-prod`
5. Desactivez Google Analytics (ou activez si vous le souhaitez)
6. Cliquez sur "Creer le projet"

## Etape 2: Activer l'authentification Google

1. Dans le menu de gauche, cliquez sur "Build" puis "Authentication"
2. Cliquez sur "Commencer"
3. Allez dans l'onglet "Methode de connexion"
4. Trouvez "Google" et cliquez sur "Activer"
5. Configurez l'ecran de consentement OAuth:
   - Allez sur https://console.cloud.google.com/apis/credentials/consent
   - Type d'utilisateur: Externe
   - Nom de l'application: EduAssist
   - Email de support: votre-email@gmail.com
   - Logo: telechargez un logo (optionnel)
   - Domaine autorise: localhost, votre-domaine.com
   - Informations de contact: votre-email@gmail.com
   - Declarations: cochez les cases necessaires
   - Enregistrez
6. Retournez dans Firebase et activez Google Sign-In
7. Sauvegardez

## Etape 3: Recuperer la configuration Web (Frontend)

1. Dans Firebase Console, allez dans "Parametres du projet" (engrenage)
2. Onglet "General"
3. Section "Vos applications"
4. Cliquez sur l'icone Web `</>`
5. Nommez l'app: "EduAssist Mobile"
6. Cochez "Configurer aussi Firebase Hosting" (optionnel)
7. Cliquez sur "Enregistrer l'application"
8. Copiez la configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "eduassist-prod.firebaseapp.com",
  projectId: "eduassist-prod",
  storageBucket: "eduassist-prod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

9. Ouvrez `frontend/src/config/firebase.config.ts`
10. Remplacez les valeurs par celles de votre projet

## Etape 4: Generer la cle de service (Backend)

1. Dans Firebase Console, allez dans "Parametres du projet"
2. Onglet "Comptes de service"
3. Cliquez sur "Generer une nouvelle cle privee"
4. Un fichier JSON sera telecharge automatiquement
5. Renommez-le en `service-account.json`
6. Placez-le dans: `backend/storage/app/firebase/`
7. Assurez-vous que le dossier `firebase` existe, sinon creez-le

## Etape 5: Configurer les variables d'environnement

### Frontend - Creer `.env` dans `frontend/`

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=eduassist-prod.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=eduassist-prod
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=eduassist-prod.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
EXPO_PUBLIC_API_URL=http://192.168.1.X:8000/api/v1
```

> Note: Remplacez `192.168.1.X` par l'IP locale de votre machine pour tester sur mobile

### Backend - Mettre a jour `.env` dans `backend/`

```env
FIREBASE_CREDENTIALS=storage/app/firebase/service-account.json
FIREBASE_PROJECT_ID=eduassist-prod
```

## Etape 6: Configurer la base de donnees

1. Creez une base de donnees MySQL:
```sql
CREATE DATABASE eduassist CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Mettez a jour `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eduassist
DB_USERNAME=root
DB_PASSWORD=votre-mot-de-passe
```

## Etape 7: Lancer le projet

### Terminal 1 - Backend
```bash
cd backend
composer install
php artisan migrate
php artisan serve --host=0.0.0.0
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npx expo start
```

## Etape 8: Tester sur mobile

1. Installez l'app Expo Go sur votre telephone
2. Scannez le QR code affiche dans le terminal
3. Ou appuyez sur 'a' pour lancer sur Android emulator
4. Ou appuyez sur 'i' pour lancer sur iOS simulator

## Depannage

### Erreur "Firebase ID Token invalide"
- Verifiez que le service-account.json est correctement place
- Verifiez que FIREBASE_PROJECT_ID correspond au projet
- Verifiez que l'heure de votre machine est synchronisee

### Erreur "CORS"
- Ajoutez dans `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['*'],
```

### Erreur "Network Error"
- Verifiez que l'IP dans EXPO_PUBLIC_API_URL est correcte
- Assurez-vous que le telephone et le PC sont sur le meme reseau WiFi
- Essayez avec l'IP locale au lieu de localhost
