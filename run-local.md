# Cómo correr el proyecto localmente (Windows / Mac / Linux)

## Requisitos previos

- Node.js 20 o superior → https://nodejs.org
- pnpm → `npm install -g pnpm`
- PostgreSQL corriendo en tu máquina → https://www.postgresql.org/download/

---

## Pasos

### 1. Instala dependencias

```bash
pnpm install
```

### 2. Configura el archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto con este contenido:

```
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/laboratorio_seguridad
JWT_SECRET=una_clave_larga_y_secreta_para_jwt
SESSION_SECRET=otra_clave_larga_y_secreta
NODE_ENV=development
```

Reemplaza `TU_PASSWORD` con tu contraseña de PostgreSQL.

### 3. Crea la base de datos

En psql, pgAdmin, o cualquier cliente de PostgreSQL:

```sql
CREATE DATABASE laboratorio_seguridad;
```

### 4. Aplica el schema de la base de datos

```bash
pnpm --filter @workspace/db run push
```

### 5. Corre el backend

Abre una terminal y ejecuta:

```bash
pnpm --filter @workspace/api-server run dev
```

El servidor arranca en http://localhost:5000

### 6. Corre el frontend

Abre **otra terminal** y ejecuta:

```bash
pnpm --filter @workspace/security-lab run dev
```

El frontend arranca en http://localhost:5173

### 7. Abre el navegador

Ve a: **http://localhost:5173**

---

## Configurar Burp Suite (para la práctica)

1. Abre Burp Suite → Proxy → Proxy Settings → Puerto `8080`
2. En Chrome/Firefox, configura el proxy manual: `127.0.0.1` puerto `8080`
3. Usa la app normalmente en `http://localhost:5173`
4. Burp interceptará las peticiones al backend en `http://localhost:5000`

La petición clave para interceptar es:
```
PUT http://localhost:5000/api/users/profile/unsafe
```

Agrega `"rol": "ADMIN"` al JSON para demostrar el escalamiento de privilegios.
