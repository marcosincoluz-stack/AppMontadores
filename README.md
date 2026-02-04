# 🔧 AppMontadores - Sistema de Gestión de Instalaciones

Sistema web PWA para gestionar trabajos de instalación, evidencias fotográficas y flujo de aprobación entre montadores y oficina.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

## 📋 Descripción

**AppMontadores** es una aplicación web progresiva (PWA) diseñada para empresas de instalaciones que necesitan:

- Asignar trabajos a montadores/instaladores
- Recopilar evidencias fotográficas del trabajo realizado
- Gestionar un flujo de aprobación con la oficina
- Controlar pagos tras la aprobación
- Notificaciones en tiempo real

## 🎯 Funcionalidades

### Para Montadores
- 📱 **PWA instalable** - Se puede añadir a pantalla de inicio como app nativa
- 📍 **Ordenación por proximidad** - Trabajos cercanos aparecen primero (con permiso GPS)
- 🔔 **Notificaciones en tiempo real** - Bell icon con contador de no leídas
- 📸 Subida de fotos del trabajo realizado
- ✍️ Subida de acta firmada por el cliente
- 🖼️ Galería de evidencias subidas
- ✅ Botón "Finalizar" con validación (requiere foto + acta)
- ⚠️ Reportar incidencias al inicio del trabajo
- 🔄 **Actualización en vivo** - Cambios se reflejan sin recargar (Supabase Realtime)

### Para Oficina/Admin
- 📊 Dashboard con estadísticas de trabajos
- 👷 Gestión de montadores
- 📋 Lista de todos los trabajos con filtros
- 🔍 Panel de revisiones pendientes
- ✅ Aprobar trabajos completados
- ❌ Rechazar con motivo (vuelve al montador)
- 📢 **Enviar recordatorios** a montadores con trabajos pendientes
- 🌍 **Auto-geocodificación** - Direcciones se convierten a coordenadas automáticamente

## 🔄 Flujo de Estados

```
┌─────────┐     Finalizar     ┌─────────────┐     Aprobar     ┌──────────┐     Pagar     ┌────────┐
│ PENDING │ ────────────────► │ EN_REVISION │ ───────────────► │ APPROVED │ ─────────────► │  PAID  │
└─────────┘                   └─────────────┘                  └──────────┘               └────────┘
     ▲                              │
     │         Rechazar             │
     └──────────────────────────────┘
              (con motivo)
```

## 🛠️ Tecnologías

- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilos**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **PWA**: Service Worker, Web App Manifest
- **Geolocalización**: Nominatim API (OpenStreetMap)
- **Push**: Web Push con VAPID (Android compatible, iOS limitado)
- **Iconos**: Lucide React

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── admin/              # Panel de administración
│   │   ├── approvals/      # Revisiones pendientes
│   │   ├── jobs/           # Gestión de trabajos
│   │   └── users/          # Gestión de montadores
│   ├── installer/          # Panel del montador
│   │   ├── jobs/[id]/      # Detalle de trabajo + subida
│   │   └── profile/        # Perfil y notificaciones push
│   └── login/              # Autenticación
├── components/
│   ├── ui/                 # Componentes shadcn
│   ├── notification-center.tsx
│   └── incident-startup-dialog.tsx
├── hooks/
│   └── use-push-notifications.ts
├── lib/
│   ├── notifications.ts    # Sistema de notificaciones
│   ├── geocoding.ts        # Auto-geocodificación
│   └── push.ts             # Web Push server-side
├── types/
│   └── supabase.ts         # Tipos generados de Supabase
└── utils/
    └── supabase/           # Clientes de Supabase
public/
├── sw.js                   # Service Worker
├── manifest.json           # PWA Manifest
└── icon-*.png              # Iconos de la app
```

## 🗄️ Base de Datos

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios (admin, installer) |
| `jobs` | Trabajos/instalaciones (con lat/lng) |
| `evidence` | Evidencias fotográficas |
| `notifications` | Notificaciones internas |
| `push_subscriptions` | Suscripciones push de usuarios |

### Estados de trabajo (`job_status`)

| Estado | Descripción |
|--------|-------------|
| `pending` | Pendiente de realizar |
| `en_revision` | Finalizado, pendiente de revisión |
| `approved` | Aprobado por oficina |
| `paid` | Pagado |

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/marcosincoluz-stack/AppMontadores.git
cd AppMontadores

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

## ⚙️ Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Web Push (opcional, para notificaciones nativas)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu-vapid-public-key
VAPID_PRIVATE_KEY=tu-vapid-private-key
VAPID_EMAIL=admin@tudominio.com
```

> **Generar claves VAPID**: `npx web-push generate-vapid-keys`

## 📱 Uso

### Como Montador
1. Inicia sesión con tu cuenta de instalador
2. **Instala la app**: Añadir a pantalla de inicio desde el navegador
3. Activa las notificaciones en Perfil → Notificaciones
4. Ve tus trabajos ordenados por cercanía (si das permiso de ubicación)
5. Entra a un trabajo, sube fotos y acta firmada
6. Haz clic en "Finalizar Trabajo" cuando esté listo

### Como Administrador
1. Inicia sesión con cuenta de admin
2. Crea trabajos (las coordenadas se calculan automáticamente)
3. Asigna trabajos a montadores (reciben notificación)
4. Ve al panel de "Revisiones" para aprobar/rechazar
5. Envía recordatorios a montadores con trabajos pendientes

## 🔔 Sistema de Notificaciones

- **Notificaciones internas**: Campanita con contador, en tiempo real
- **Push nativas** (opcional): Funcionan en Android. En iOS requiere:
  - iOS 16.4+
  - App instalada como PWA
  - Permiso dado desde la PWA (no Safari)

## 📄 Licencia

Este proyecto es privado y de uso interno.

---

Desarrollado con ❤️ para Incoluz
