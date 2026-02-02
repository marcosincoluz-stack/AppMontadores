# 🔧 AppMontadores - Sistema de Gestión de Instalaciones

Sistema web para gestionar trabajos de instalación, evidencias fotográficas y flujo de aprobación entre montadores y oficina.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 📋 Descripción

**AppMontadores** es una aplicación web diseñada para empresas de instalaciones que necesitan:

- Asignar trabajos a montadores/instaladores
- Recopilar evidencias fotográficas del trabajo realizado
- Gestionar un flujo de aprobación con la oficina
- Controlar pagos tras la aprobación

## 🎯 Funcionalidades

### Para Montadores
- 📱 Panel móvil optimizado para ver trabajos asignados
- 📸 Subida de fotos del trabajo realizado
- ✍️ Subida de acta firmada por el cliente
- 🖼️ Galería de evidencias subidas
- ✅ Botón "Finalizar" con validación (requiere foto + acta)
- ⚠️ Visualización de motivo de rechazo si aplica

### Para Oficina/Admin
- 📊 Dashboard con estadísticas de trabajos
- 👷 Gestión de montadores
- 📋 Lista de todos los trabajos con filtros
- 🔍 Panel de revisiones pendientes
- ✅ Aprobar trabajos completados
- ❌ Rechazar con motivo (vuelve al montador)

## 🔄 Flujo de Estados

```
┌─────────┐     Finalizar     ┌─────────────┐     Aprobar     ┌──────────┐
│ PENDING │ ────────────────► │ EN_REVISION │ ───────────────► │ APPROVED │
└─────────┘                   └─────────────┘                  └──────────┘
     ▲                              │
     │         Rechazar             │
     └──────────────────────────────┘
              (con motivo)
```

## 🛠️ Tecnologías

- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilos**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Iconos**: Lucide React

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── admin/           # Panel de administración
│   │   ├── approvals/   # Revisiones pendientes
│   │   ├── jobs/        # Gestión de trabajos
│   │   └── users/       # Gestión de montadores
│   ├── installer/       # Panel del montador
│   │   └── jobs/[id]/   # Detalle de trabajo + subida
│   └── login/           # Autenticación
├── components/
│   ├── ui/              # Componentes shadcn
│   └── ...              # Componentes de la app
├── types/
│   └── supabase.ts      # Tipos generados de Supabase
└── utils/
    └── supabase/        # Clientes de Supabase
```

## 🗄️ Base de Datos

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios (admin, installer) |
| `jobs` | Trabajos/instalaciones |
| `evidence` | Evidencias fotográficas |

### Estados de trabajo (`job_status`)

| Estado | Descripción |
|--------|-------------|
| `pending` | Pendiente de realizar |
| `en_revision` | Finalizado, pendiente de revisión |
| `approved` | Aprobado por oficina |
| `paid` | Pagado (futuro) |

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/marcosincoluz-stack/AppMontadores.git
cd AppMontadores

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

## ⚙️ Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 📱 Uso

### Como Montador
1. Inicia sesión con tu cuenta de instalador
2. Ve tus trabajos asignados en el panel principal
3. Entra a un trabajo para ver los detalles
4. Sube fotos del trabajo realizado
5. Sube el acta firmada por el cliente
6. Haz clic en "Finalizar Trabajo" cuando esté listo

### Como Administrador
1. Inicia sesión con cuenta de admin
2. Ve al panel de "Revisiones" para ver trabajos pendientes
3. Revisa las evidencias de cada trabajo
4. Aprueba o rechaza (indicando el motivo)

## 📄 Licencia

Este proyecto es privado y de uso interno.

---

Desarrollado con ❤️ para Incoluz
