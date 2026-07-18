# 🛒 Mi Tienda Online

## ¿Qué es esto?
Una tienda online completa con catálogo de productos, carrito de compras, pagos y panel de administración.

## Tecnologías
- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Frontend**: React + Tailwind CSS
- **Base de datos**: PostgreSQL (gratis en Railway)
- **Hosting**: Railway (backend gratis) + Vercel (frontend gratis)

## Estructura del Proyecto
```
ecommerce-platform/
├── backend/          → API y base de datos
├── frontend/         → La página web que ven los clientes
└── README.md
```

## Cómo empezar (Paso a paso para principiantes)

### 1. Instalar herramientas necesarias
- **Node.js**: Ve a nodejs.org y descarga la versión LTS (recomendada)
- **Git**: Ve a git-scm.com y descárgalo
- **VS Code**: Editor de código gratuito (code.visualstudio.com)

### 2. Configurar la base de datos (Gratis)
1. Ve a railway.app y crea una cuenta
2. Crea un nuevo proyecto → Add PostgreSQL
3. Copia la URL de conexión que te da Railway

### 3. Configurar variables de entorno
1. En la carpeta `backend`, renombra `.env.example` a `.env`
2. Abre el archivo `.env` y pega la URL de Railway donde dice DATABASE_URL
3. Genera un JWT_SECRET: abre terminal y escribe `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Copia ese texto largo y pégalo donde dice JWT_SECRET

### 4. Instalar dependencias
Abre terminal en la carpeta `backend` y escribe:
```bash
npm install
```

### 5. Crear la base de datos
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 6. Iniciar el servidor
```bash
npm run dev
```
Tu API estará en http://localhost:3000

### 7. Iniciar el frontend
Abre otra terminal en la carpeta `frontend`:
```bash
npm install
npm run dev
```
Tu tienda estará en http://localhost:5173

## Usuarios de prueba
- **Admin**: admin@ecommerce.com / admin123
- **Cliente**: cliente@ejemplo.com / cliente123

## Desplegar en internet (Gratis)
1. **Backend**: Sube a Railway (conecta tu repo de GitHub)
2. **Frontend**: Sube a Vercel (conecta tu repo de GitHub)
3. **Dominio**: Usa el que te dan gratis (tipo mitienda.vercel.app)

## Soporte
Si tienes dudas, busca tutoriales en YouTube de:
- "Cómo usar Railway gratis"
- "Cómo desplegar React en Vercel"
- "Prisma tutorial español"
