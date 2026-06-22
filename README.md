================================================================================
COMANDOS PARA LEVANTAR EL PROYECTO
================================================================================

1. docker compose up -d                          # Levanta PostgreSQL
2. cd backend && npm install                     # Instalar dependencias backend
3. cd backend && npm run start:dev               # Levanta el backend (crea tablas)
4. cd backend && npx ts-node src/seeds/seed.ts  # Carga datos de prueba
5. cd frontend && npm install                    # Instalar dependencias frontend
6. cd frontend && npm start                      # Levanta la pantalla Angular

Credenciales de prueba:
  Usuario: ana.gonzalez (id: 1)
  Bolsín:  BOL-001 — estado inicial: EnBolsinEnviado
  4 documentaciones listas para recepcionar
