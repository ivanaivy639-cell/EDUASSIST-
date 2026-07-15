<<<<<<< HEAD
# EduAssist

Application mobile pour enseignants - React Native + Expo + Laravel 13 + Firebase + Sanctum

## Architecture

```
eduassist/
├── frontend/          # React Native + Expo SDK 54
│   ├── src/
│   │   ├── components/   # Composants reutilisables
│   │   ├── features/     # Ecrans (Login, RegisterTeacher, Home)
│   │   ├── services/     # API Client + AuthService
│   │   ├── context/      # AuthContext + ThemeContext
│   │   ├── hooks/        # Hooks personnalises
│   │   ├── utils/        # SecureStorage + ErrorHandler
│   │   ├── types/        # Types TypeScript stricts
│   │   ├── schemas/      # Validation Zod
│   │   ├── theme/        # Design System
│   │   └── config/       # Firebase + API config
│   ├── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
└── backend/           # Laravel 13 + PHP 8.3
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/Auth/GoogleAuthController.php
    │   │   ├── Controllers/Teacher/TeacherController.php
    │   │   ├── Requests/Auth/GoogleLoginRequest.php
    │   │   ├── Requests/Teacher/RegisterTeacherRequest.php
    │   │   └── Resources/UserResource.php, TeacherResource.php
    │   ├── Models/User.php, Teacher.php
    │   └── Services/FirebaseService.php, AuthService.php, TeacherService.php
    ├── database/migrations/
    ├── routes/api.php
    └── .env
```

## Configuration Firebase

### 1. Creer un projet Firebase
1. Aller sur https://console.firebase.google.com
2. Cliquer sur "Ajouter un projet"
3. Nommer le projet "eduassist" (ou le nom de votre choix)
4. Desactiver Google Analytics (optionnel)
5. Cliquer sur "Creer le projet"

### 2. Configurer l'authentification Google
1. Dans le menu de gauche, cliquer sur "Authentication"
2. Cliquer sur "Commencer"
3. Activer "Google" dans l'onglet "Methode de connexion"
4. Configurer l'ecran de consentement OAuth:
   - Type d'utilisateur: Externe
   - Nom de l'application: EduAssist
   - Email de support: votre-email@gmail.com
   - Domaine autorise: localhost
   - Informations de contact: votre-email@gmail.com
   - Accepter les conditions et enregistrer
5. Activer Google Sign-In et sauvegarder

### 3. Recuperer la configuration Firebase (Frontend)
1. Aller dans "Parametres du projet" (engrenage en haut a gauche)
2. Onglet "General"
3. Section "Vos applications" -> Cliquer sur l'icone Web (</>)
4. Nommer l'application "EduAssist Mobile"
5. Copier les valeurs de configuration:

```
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

6. Coller ces valeurs dans `frontend/src/config/firebase.config.ts`

### 4. Generer le Service Account (Backend)
1. Dans "Parametres du projet" -> Onglet "Comptes de service"
2. Cliquer sur "Generer une nouvelle cle privee"
3. Un fichier JSON sera telecharge
4. Renommer le fichier en `service-account.json`
5. Le placer dans `backend/storage/app/firebase/`

### 5. Variables d'environnement

#### Frontend (.env dans frontend/)
```
EXPO_PUBLIC_FIREBASE_API_KEY=votre-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre-projet
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

#### Backend (.env dans backend/)
```
FIREBASE_CREDENTIALS=storage/app/firebase/service-account.json
FIREBASE_PROJECT_ID=votre-projet
```

## Lancement du projet

### Frontend
```bash
cd frontend
npm install
npx expo start
```

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Flux d'authentification

1. Utilisateur clique sur "Continuer avec Google"
2. Firebase ouvre la fenetre de connexion Google
3. Firebase retourne un ID Token
4. Frontend envoie le token au backend Laravel
5. Backend verifie le token avec Firebase Admin SDK
6. Backend cree/met a jour l'utilisateur
7. Backend genere un Bearer Token Sanctum
8. Frontend stocke le token dans Expo SecureStore
9. Frontend verifie le profil enseignant
10. Redirection vers Home ou RegisterTeacher

## Technologies

### Frontend
- React Native 0.76
- Expo SDK 54
- TypeScript Strict
- Firebase Authentication
- React Navigation v7
- Axios + Intercepteurs
- Zod + React Hook Form
- Expo SecureStore
- React Native Reanimated

### Backend
- Laravel 13
- PHP 8.3
- Laravel Sanctum
- Firebase Admin SDK (kreait/laravel-firebase)
- MySQL 8
- PSR-12 + SOLID
=======
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
>>>>>>> 31251911a29d10c69b35029fa71d1f24fe33216a
