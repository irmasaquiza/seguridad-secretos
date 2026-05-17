# Cómo correr el proyecto localmente

## Requisitos previos

- Node.js 20 o superior
- pnpm (`npm install -g pnpm`)
- PostgreSQL corriendo en tu máquina

## Pasos

### 1. Clona e instala dependencias

```bash
git clone <url-del-repo>
cd <carpeta>
pnpm install
```

### 2. Configura el archivo .env

```bash
cp .env.example .env
```

Edita `.env` con tus datos reales de PostgreSQL.

### 3. Crea la base de datos

En psql o pgAdmin:

```sql
CREATE DATABASE laboratorio_seguridad;
```

### 4. Aplica el schema

```bash
pnpm --filter @workspace/db run push
```

### 5. Corre el backend (Terminal 1)

```bash
PORT=5000 pnpm --filter @workspace/api-server run dev
```

### 6. Corre el frontend (Terminal 2)

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/security-lab run dev
```

### 7. Abre el navegador

- Frontend: http://localhost:5173
- API directa: http://localhost:5000/api/healthz

## Usuarios de prueba

Regístrate directamente desde la app en `/register`.

Para crear un admin manualmente en psql:

```sql
UPDATE users SET rol = 'ADMIN' WHERE correo = 'tu@correo.com';
```

## Configurar Burp Suite (para la práctica)

1. Abre Burp Suite → Proxy → Options → Puerto `8080`
2. Configura tu navegador para usar proxy `127.0.0.1:8080`
3. Ve a `http://localhost:5173` y realiza la práctica normalmente
4. Burp interceptará las peticiones al backend
