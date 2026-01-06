# Guía de Despliegue - KIU Broker en DigitalOcean

## 📋 Prerrequisitos

- Droplet de DigitalOcean con Ubuntu 22.04 (o superior)
- Acceso SSH al servidor
- Repositorio Git del proyecto

---

## 🔧 Paso 1: Configurar Git en el Servidor

### 1.1 Conectarse al servidor

```bash
ssh root@tu-ip-digitalocean
# O si usas un usuario:
ssh usuario@tu-ip-digitalocean
```

### 1.2 Instalar Git (si no está instalado)

```bash
sudo apt update
sudo apt install git -y
```

### 1.3 Configurar Git (si es la primera vez)

```bash
git config --global user.name "juanSalazar33"
git config --global user.email "juancrogollo@gmail.com"
```

### 1.4 Configurar SSH para Git

#### 1.4.1 Generar llave SSH

```bash
# Generar una nueva llave SSH (usa tu email de GitHub)
ssh-keygen -t ed25519 -C "juancrogollo@gmail.com"

# Presiona Enter para aceptar la ubicación por defecto (~/.ssh/id_ed25519)
# Ingresa una contraseña segura (o presiona Enter para no usar contraseña)
```

#### 1.4.2 Iniciar el agente SSH

```bash
eval "$(ssh-agent -s)"
```

#### 1.4.3 Agregar la llave al agente SSH

```bash
ssh-add ~/.ssh/id_ed25519
```

#### 1.4.4 Mostrar la llave pública para agregarla a GitHub

```bash
# Mostrar la llave pública
cat ~/.ssh/id_ed25519.pub
```

**Copia toda la salida** (debería verse algo como: `ssh-ed25519 AAAA... tu-email@ejemplo.com`)

#### 1.4.5 Agregar la llave a GitHub

1. Ve a GitHub.com → Settings → SSH and GPG keys
2. Click en "New SSH key"
3. Título: "DigitalOcean Droplet" (o el que prefieras)
4. Key: Pega la llave que copiaste
5. Click en "Add SSH key"

#### 1.4.6 Verificar la conexión SSH

```bash
# Probar la conexión con GitHub
ssh -T git@github.com

# Deberías ver algo como:
# Hi tu-usuario! You've successfully authenticated, but GitHub does not provide shell access.
```

### 1.5 Clonar el repositorio

```bash
# Crear directorio para la aplicación
cd /var/www
# O si prefieres otro directorio:
# cd /opt

# Clonar tu repositorio usando SSH
git clone git@github.com:tu-usuario/Kiu-broker.git

cd Kiu-broker
```

---

## 📦 Paso 2: Instalar Node.js

### 2.1 Instalar Node.js 20.x (LTS)

```bash
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 2.2 Instalar PM2 (gestor de procesos)

```bash
sudo npm install -g pm2
```

---

## ⚙️ Paso 3: Configurar el Proyecto

### 3.1 Instalar dependencias

```bash
cd /var/www/Kiu-broker
npm install
```

### 3.2 Crear archivo .env.example

Si no existe el archivo `.env.example`, créalo con este comando:

```bash
# Opción 1: Usando cat con heredoc (recomendado)
cat > .env.example << 'EOF'
# Puerto del servidor
PORT=3000

# URL del servicio KIU
KIU_URL=https://ssl00.kiusys.com/ws3/index.php

# CORS - Orígenes permitidos (separados por coma)
# Ejemplo: https://bleisure-app.vercel.app,https://bleisure-admin.vercel.app
# Usa * para permitir todos (solo en desarrollo)
CORS_ORIGINS=*

# Timeout para peticiones a KIU (en milisegundos)
KIU_TIMEOUT=30000

# NODE_ENV
NODE_ENV=production
EOF
```

**O si prefieres usar nano:**

```bash
nano .env.example
```

Y pega este contenido:

```env
# Puerto del servidor
PORT=3000

# URL del servicio KIU
KIU_URL=https://ssl00.kiusys.com/ws3/index.php

# CORS - Orígenes permitidos (separados por coma)
# Ejemplo: https://bleisure-app.vercel.app,https://bleisure-admin.vercel.app
# Usa * para permitir todos (solo en desarrollo)
CORS_ORIGINS=*

# Timeout para peticiones a KIU (en milisegundos)
KIU_TIMEOUT=30000

# NODE_ENV
NODE_ENV=production
```

Guarda con: `Ctrl+O`, `Enter`, `Ctrl+X`

### 3.3 Crear archivo .env

```bash
# Crear archivo .env desde el ejemplo
cp .env.example .env
```

### 3.4 Configurar variables de entorno

Edita el archivo `.env` con tus valores:

```bash
nano .env
```

**Para desarrollo local:**
```env
PORT=3000
KIU_URL=https://ssl00.kiusys.com/ws3/index.php
CORS_ORIGINS=*
KIU_TIMEOUT=30000
NODE_ENV=development
```

**Para producción, configura CORS específicamente:**
```env
PORT=3000
KIU_URL=https://ssl00.kiusys.com/ws3/index.php
CORS_ORIGINS=https://bleisure-app.vercel.app,https://bleisure-admin.vercel.app
KIU_TIMEOUT=30000
NODE_ENV=production
```

### 3.4 Compilar el proyecto

```bash
npm run build
```

---

## 🚀 Paso 4: Iniciar con PM2

### 4.1 Iniciar la aplicación

```bash
pm2 start dist/main.js --name kiu-broker
```

### 4.2 Configurar PM2 para iniciar al arrancar el servidor

```bash
# Guardar la configuración actual
pm2 save

# Generar script de inicio
pm2 startup

# Copiar y ejecutar el comando que te muestre (será algo como):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u tu-usuario --hp /home/tu-usuario
```

### 4.3 Comandos útiles de PM2

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs kiu-broker

# Reiniciar
pm2 restart kiu-broker

# Detener
pm2 stop kiu-broker

# Eliminar
pm2 delete kiu-broker

# Monitoreo en tiempo real
pm2 monit
```

---

## 🌐 Paso 5: Configurar Nginx (Opcional pero Recomendado)

### 5.1 Instalar Nginx

```bash
sudo apt install nginx -y
```

### 5.2 Crear configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/kiu-broker
```

Agrega esta configuración:

```nginx
server {
    listen 80;
    server_name 174.138.91.6;  # O tu IP si no tienes dominio

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.3 Habilitar el sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/kiu-broker /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 5.4 Configurar firewall

```bash
# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'
# O si solo quieres HTTP:
sudo ufw allow 'Nginx HTTP'
```

---

## 🔒 Paso 6: Configurar SSL con Let's Encrypt (Opcional)

### 6.1 Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtener certificado SSL

```bash
sudo certbot --nginx -d tu-dominio.com
```

Sigue las instrucciones en pantalla. El certificado se renovará automáticamente.

---

## ✅ Paso 7: Verificar que Funciona

### 7.1 Health Check

```bash
# Desde el servidor
curl http://localhost:3000/health

# Desde tu máquina local
curl http://tu-ip-o-dominio/health
```

Deberías ver algo como:

```json
{
  "status": "ok",
  "service": "kiu-broker",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### 7.2 Probar el proxy de KIU

```bash
curl -X POST http://tu-ip-o-dominio/kiu/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "user": "tu_usuario_kiu",
    "password": "tu_password_kiu",
    "request": "<?xml version=\"1.0\"?><test/>"
  }'
```

---

## 📊 Paso 8: Monitoreo y Logs

### 8.1 Ver logs de PM2

```bash
pm2 logs kiu-broker
```

### 8.2 Ver logs de Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 8.3 Monitoreo de recursos

```bash
# Ver uso de recursos
pm2 monit

# Ver información del proceso
pm2 info kiu-broker
```

---

## 🔄 Paso 9: Actualizar el Código

Cuando necesites actualizar el código:

```bash
cd /var/www/Kiu-broker

# Obtener últimos cambios
git pull origin main

# Instalar nuevas dependencias (si hay)
npm install

# Recompilar
npm run build

# Reiniciar la aplicación
pm2 restart kiu-broker
```

---

## 🐛 Solución de Problemas

### El servicio no inicia

```bash
# Ver logs detallados
pm2 logs kiu-broker --lines 100

# Verificar que el puerto esté libre
sudo netstat -tulpn | grep 3000

# Verificar variables de entorno
pm2 env kiu-broker
```

### Error de permisos

```bash
# Dar permisos al usuario
sudo chown -R $USER:$USER /var/www/Kiu-broker
```

### Puerto ya en uso

```bash
# Cambiar el puerto en .env
PORT=3001

# Recompilar y reiniciar
npm run build
pm2 restart kiu-broker
```

---

## 📝 Notas Importantes

1. **IP Fija**: Anota la IP pública de tu Droplet para agregarla a la whitelist de KIU
2. **Seguridad**: Considera agregar autenticación entre servicios
3. **Backup**: Configura backups regulares de tu código
4. **Monitoreo**: Considera usar servicios de monitoreo como UptimeRobot

---

## 🎯 Siguiente Paso

Una vez que el microservicio esté funcionando:

1. Obtén la IP pública de tu Droplet
2. Contacta a KIU para agregar esa IP a la whitelist
3. Actualiza la variable `KIU_MICROSERVICE_URL` en Vercel con la URL de tu microservicio

---

## 📞 Comandos de Referencia Rápida

```bash
# Iniciar
pm2 start dist/main.js --name kiu-broker

# Ver estado
pm2 status

# Ver logs
pm2 logs kiu-broker

# Reiniciar
pm2 restart kiu-broker

# Detener
pm2 stop kiu-broker

# Verificar Nginx
sudo nginx -t
sudo systemctl restart nginx
```

