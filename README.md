# KIU Broker - Microservicio Proxy

Microservicio NestJS que actúa como proxy para las llamadas a KIU, proporcionando una IP fija para whitelist.

## 🎯 Propósito

Este microservicio permite que el backend principal (desplegado en Vercel) se comunique con los servicios de KIU a través de una IP fija, ya que Vercel (plan free) no ofrece IPs fijas y KIU requiere whitelist de IPs.

## 🏗️ Arquitectura

```
Backend Principal (Vercel)
    ↓
KIU Broker (DigitalOcean - IP Fija)
    ↓
KIU Services (https://ssl00.kiusys.com)
```

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run start:dev
```

### Producción

```bash
npm run build
npm run start:prod
```

## ⚙️ Configuración

Copia `.env.example` a `.env` y configura las variables:

```env
PORT=3000
KIU_URL=https://ssl00.kiusys.com/ws3/index.php
CORS_ORIGINS=https://bleisure-app.vercel.app,https://bleisure-admin.vercel.app
KIU_TIMEOUT=30000
NODE_ENV=production
```

## 📡 Endpoints

### POST `/kiu/proxy`

Proxy para llamadas a KIU.

**Request Body:**
```json
{
  "user": "tu_usuario_kiu",
  "password": "tu_password_kiu",
  "request": "<?xml version=\"1.0\"?>..."
}
```

**Response:**
- XML response de KIU

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "kiu-broker",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production"
}
```

## 📦 Despliegue

### DigitalOcean

1. Crea un Droplet (Ubuntu 22.04, mínimo 1GB RAM)
2. Configura Node.js y PM2
3. Clona el repositorio
4. Configura las variables de entorno
5. Compila y ejecuta:

```bash
npm install
npm run build
pm2 start dist/main.js --name kiu-broker
pm2 save
```

### Variables de Entorno en el Backend Principal

En Vercel, agrega:

```env
KIU_MICROSERVICE_URL=https://tu-microservicio.digitalocean.app
```

## 🔒 Seguridad

- ✅ Validación de entrada con class-validator
- ✅ CORS configurable
- ✅ Timeout configurable para peticiones
- ✅ Logging detallado
- ⚠️ Considera agregar autenticación entre servicios

## 📊 Monitoreo

### Health Check

```bash
curl https://tu-microservicio.com/health
```

### Logs

```bash
pm2 logs kiu-broker
```

## 🛠️ Scripts Disponibles

- `npm run build` - Compilar el proyecto
- `npm run start` - Iniciar en modo producción
- `npm run start:dev` - Iniciar en modo desarrollo (watch)
- `npm run start:debug` - Iniciar en modo debug
- `npm run lint` - Ejecutar linter
- `npm run test` - Ejecutar tests

## 📝 Notas

- El microservicio retorna el XML directamente de KIU
- El backend principal se encarga de parsear el XML a JSON
- La IP del Droplet debe estar en la whitelist de KIU

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT
