# E-Descarte — Observatório Digital de Direito Ambiental (EcoTech)

Plataforma de gestão e denúncia de lixo eletrônico, com módulo legal integrado.

## Estrutura do projeto

```
edescarte/
├── backend/          # API Node.js + Express + JWT + PostgreSQL + MongoDB
├── frontend-web/      # React (web)
└── mobile/            # React Native (app)
```

## Como executar

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # configure suas variáveis
npm run dev
```
A API sobe em `http://localhost:3000`

### 2. Frontend Web
```bash
cd frontend-web
npm install
npm start
```
Abre em `http://localhost:5173`

### 3. Mobile (React Native / Expo)
```bash
cd mobile
npm install
npx expo start
```

## Variáveis de ambiente (backend/.env)

```
PORT=3000
JWT_SECRET=sua_chave_secreta_super_segura
POSTGRES_URI=postgres://usuario:senha@localhost:5432/edescarte
MONGO_URI=mongodb://localhost:27017/edescarte_logs
GOOGLE_MAPS_API_KEY=sua_chave_google_maps
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app
SMS_API_KEY=sua_chave_sms
```

## Módulo Legal

O diferencial do projeto é o módulo `legalContent.js` (backend) que mapeia
cada tipo de denúncia ambiental à legislação aplicável (Lei 12.305/2010,
Decreto 10.240/2020, Lei 9.605/1998, Resolução CONAMA 401/2008), exibindo
isso automaticamente na tela de denúncia tanto no web quanto no mobile.
