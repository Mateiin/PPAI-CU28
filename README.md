# BOLSINES — CU28 Registrar Recepción de Bolsín

Proyecto académico DSI — UTN FRVM, 3º año, Comisión 1, Grupo 10.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para la base de datos)
- Git

---

## Cómo levantar el proyecto

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd PPAI
```

### 2. Configurar variables de entorno

Copiar el archivo de ejemplo y dejarlo tal cual (los valores por defecto funcionan con Docker):

```bash
cp .env.example .env
```

### 3. Levantar la base de datos (PostgreSQL)

Abrir Docker Desktop y esperar a que esté corriendo, luego:

```bash
docker compose up -d
```

### 4. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend (abrir otra terminal)
cd frontend
npm install
```

### 5. Cargar datos de prueba (seed)

Desde la carpeta `backend/`:

```bash
npm run seed
```

Esto crea el usuario, el empleado, la sesión activa y un bolsín listo para recepcionar.

> Si querés agregar más bolsines para probar, corrés:
> ```bash
> npm run seed:extra
> ```
> Podés ejecutarlo las veces que quieras, cada vez crea un bolsín nuevo.

### 6. Iniciar el backend

Desde `backend/`:

```bash
npm run start:dev
```

El backend queda escuchando en `http://localhost:3000`.

### 7. Iniciar el frontend

Desde `frontend/` (en otra terminal):

```bash
npm start
```

El frontend queda disponible en `http://localhost:4200`.

---

## Resumen de URLs

| Servicio   | URL                      |
|------------|--------------------------|
| Frontend   | http://localhost:4200    |
| Backend    | http://localhost:3000    |
| PostgreSQL | localhost:5432           |

---

## Credenciales de prueba

La sesión ya viene iniciada por el seed. El usuario activo es `ana.gonzalez`.
