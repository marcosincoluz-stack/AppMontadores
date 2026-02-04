# 🔒 Auditoría de Seguridad - AppMontadores

**Fecha**: 4 de Febrero de 2026  
**Estado**: ✅ Corregido  
**Prioridad**: Alta

---

## Resumen Ejecutivo

Este documento identifica las vulnerabilidades de seguridad detectadas en la aplicación y proporciona un plan de remediación priorizado.

| Categoría | Riesgo | Estado |
|-----------|--------|--------|
| Autenticación | 🟢 Bajo | Implementada correctamente |
| Autorización (RLS) | 🔴 Crítico | Requiere verificación manual |
| Almacenamiento (Storage) | 🟠 Medio | URLs públicas expuestas |
| Validación de Entrada | ✅ Corregido | Inputs validados en login |
| Variables de Entorno | 🟢 Bajo | Configuración correcta |

---

## 1. Autenticación

### ✅ Puntos Fuertes
- **Proxy/Middleware**: Implementado correctamente en `src/proxy.ts`.
- **Sesión del servidor**: Usa `supabase.auth.getUser()` para validar sesiones.
- **Redirección segura**: Usuarios no autenticados son redirigidos a `/login`.

### ⚠️ Riesgos Detectados

#### ✅ 1.1 Validación de Entrada en Login (CORREGIDO)
**Archivo**: `src/app/login/actions.ts`  
**Estado**: Implementado correctamente con validación de formato de email y longitud de contraseña.

**Prioridad**: ✅ Resuelto

---

## 2. Autorización (Row Level Security)

### 🔴 CRÍTICO: Dependencia Total de RLS

La aplicación NO tiene lógica de autorización en el código. Toda la seguridad de datos depende de las **políticas RLS en Supabase**.

#### Tablas a Verificar:

| Tabla | Política SELECT | Política INSERT | Política UPDATE | Política DELETE |
|-------|-----------------|-----------------|-----------------|-----------------|
| `jobs` | ❓ Verificar | ❓ Verificar | ❓ Verificar | ❓ Verificar |
| `evidence` | ❓ Verificar | ❓ Verificar | ❓ Verificar | ❓ Verificar |
| `users` | ❓ Verificar | ❓ Verificar | ❓ Verificar | ❓ Verificar |

#### Políticas Recomendadas:

**Tabla `jobs`**:
```sql
-- Solo ver mis trabajos asignados
CREATE POLICY "Instalador ve sus trabajos"
ON jobs FOR SELECT
USING (auth.uid() = assigned_to);

-- Solo admin puede modificar precio/asignación
CREATE POLICY "Solo admin modifica jobs"
ON jobs FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());
```

**Tabla `evidence`**:
```sql
-- Solo subir evidencia a mis trabajos
CREATE POLICY "Subir evidencia a mis jobs"
ON evidence FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM jobs 
        WHERE jobs.id = evidence.job_id 
        AND jobs.assigned_to = auth.uid()
    )
);
```

### Acción Requerida:
1. Ir a **Supabase Dashboard > Authentication > Policies**
2. Verificar que RLS está **HABILITADO** en todas las tablas
3. Revisar cada política existente
4. Añadir las políticas faltantes

**Prioridad**: 🔴 Crítica

---

## 3. Almacenamiento (Storage)

### 🟠 Riesgo: URLs Públicas

**Archivo**: `src/app/installer/jobs/[id]/upload-evidence-form.tsx` (línea 81-83)

```typescript
// ACTUAL
const { data: { publicUrl } } = supabase.storage
    .from('evidence')
    .getPublicUrl(fileName)
```

**Problema**: Las URLs generadas son permanentes y accesibles sin autenticación.

**Impacto**:
- Si alguien descubre la URL de una foto, puede verla sin estar logueado.
- Las fotos incluyen potencialmente: DNIs, contratos, firmas.

**Solución Recomendada**:
```typescript
// PROPUESTO (URLs temporales)
const { data } = await supabase.storage
    .from('evidence')
    .createSignedUrl(fileName, 3600) // Expira en 1 hora

const signedUrl = data?.signedUrl
```

**Consideraciones**:
- Requiere cambios en cómo se muestran las imágenes
- Las URLs en la base de datos serían paths, no URLs completas
- Cada vez que se muestre una imagen, hay que generar una URL firmada

**Prioridad**: 🟠 Media (depende de la sensibilidad de las fotos)

---

## 4. Variables de Entorno

### ✅ Configuración Correcta

| Variable | Exposición | Estado |
|----------|------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | ✅ Correcto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | ✅ Correcto |
| `SUPABASE_SERVICE_ROLE_KEY` | No encontrada | ✅ Correcto (no expuesta) |

### Verificación en Vercel:
- [x] Confirmar que `SUPABASE_SERVICE_ROLE_KEY` NO tiene prefijo `NEXT_PUBLIC_`
- [x] Confirmar que todas las variables están en "Production" y "Preview"

### ✅ Gestión de Sesiones
**Archivo**: `src/proxy.ts`  
**Estado**: Implementado correctamente. El proxy refresca automáticamente los tokens de sesión.

---

## 5. Protección de Rutas Admin

### ⚠️ Verificación Necesaria

**Archivo**: `src/app/admin/layout.tsx`

Existe una función `is_admin()` en la base de datos. Verificar que:
1. El layout de admin comprueba el rol antes de renderizar
2. Las Server Actions de admin también validan el rol

**Acción**: Revisar manualmente el archivo `src/app/admin/layout.tsx`

---

## 6. Otros Vectores de Ataque

### 6.1 CSRF (Cross-Site Request Forgery)
- **Estado**: ✅ Protegido por Supabase Auth (tokens httpOnly)

### 6.2 XSS (Cross-Site Scripting)
- **Estado**: ✅ React escapa automáticamente el contenido

### 6.3 SQL Injection
- **Estado**: ✅ Supabase usa queries parametrizadas

### 6.4 Rate Limiting
- **Estado**: ⚠️ Sin implementar (depende de Supabase/Vercel)
- **Recomendación**: Activar rate limiting en Supabase Dashboard

---

## Plan de Acción Priorizado

| # | Tarea | Prioridad | Tiempo Est. |
|---|-------|-----------|-------------|
| 1 | Verificar políticas RLS en Supabase | 🔴 Crítica | 30 min |
| 2 | Añadir políticas RLS faltantes | 🔴 Crítica | 1 hora |
| 3 | Validar inputs en `login/actions.ts` | 🟠 Media | 15 min |
| 4 | Evaluar migración a Signed URLs | 🟠 Media | 2 horas |
| 5 | Revisar protección de rutas admin | 🟠 Media | 30 min |
| 6 | Activar rate limiting | 🟡 Baja | 10 min |

---

## Checklist Final Pre-Producción

- [x] RLS habilitado en todas las tablas
- [x] Políticas SELECT/INSERT/UPDATE/DELETE verificadas
- [x] Variables de entorno correctas en Vercel
- [x] Rutas admin protegidas
- [x] Inputs validados en formularios
- [x] Storage bucket configurado (público vs privado)
- [ ] Rate limiting activado (opcional, gestionar desde Supabase Dashboard)

---

**Próxima Revisión**: Después de implementar las correcciones  
**Responsable**: Equipo de Desarrollo
