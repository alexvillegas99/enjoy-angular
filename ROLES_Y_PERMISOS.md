# Modulo de Roles y Permisos

## Como funciona

El sistema de roles y permisos permite controlar de forma dinamica que puede hacer cada usuario en la plataforma web, sin necesidad de modificar codigo.

### Flujo general

```
Login -> Backend resuelve permisos del rol -> Frontend recibe user.permisos[]
                                                   |
                                           sidebar se filtra
                                           guards validan rutas
                                           web.acceso controla ingreso
```

1. Cada **usuario** tiene un campo `rol` (string: `admin`, `admin-local`, `staff`, etc.)
2. En la coleccion **`roles`** de MongoDB existe un documento por cada rol con su lista de permisos
3. Al hacer login, el backend busca el rol por su `slug` y adjunta `permisos[]` al usuario
4. El frontend usa `permisos[]` para:
   - Filtrar el sidebar (solo muestra items que el usuario tiene permiso de ver)
   - Proteger rutas (el guard valida `permissions` en `route.data`)
   - Bloquear acceso web (si no tiene `web.acceso`, no entra al dashboard)

### Estructura de un permiso

```
modulo.accion
```

Ejemplos: `usuarios.ver`, `cupones.crear`, `roles.editar`, `web.acceso`

### Roles por defecto (seed automatico)

| Rol | Slug | Permisos |
|-----|------|----------|
| Administrador | `admin` | Todos los permisos |
| Admin Local | `admin-local` | `web.acceso`, `dashboard-local.ver`, `usuarios-local.ver`, `perfil-local.ver` |
| Staff | `staff` | `dashboard-local.ver`, `historico.ver`, `historico.crear`, `historico.validar` |
| Visualizador | `visualizador` | Todos los `.ver` (solo lectura) |

Los roles de sistema (`esSistema: true`) no se pueden eliminar pero si se pueden editar sus permisos.

---

## Como agregar permisos cuando creas un nuevo modulo

### Paso 1: Backend - Agregar permisos al catalogo

Archivo: `coponera-nest/src/roles/constants/permisos.constant.ts`

Agrega un nuevo grupo al array `PERMISOS_CATALOG`:

```typescript
{
  modulo: 'mi-modulo',
  nombre: 'Mi Modulo',
  permisos: [
    { clave: 'mi-modulo.ver', nombre: 'Ver mi modulo', descripcion: 'Acceso a mi modulo' },
    { clave: 'mi-modulo.crear', nombre: 'Crear en mi modulo', descripcion: 'Crear registros' },
    { clave: 'mi-modulo.editar', nombre: 'Editar mi modulo', descripcion: 'Modificar registros' },
    { clave: 'mi-modulo.eliminar', nombre: 'Eliminar mi modulo', descripcion: 'Eliminar registros' },
  ],
},
```

Los permisos se agregan automaticamente a `TODOS_LOS_PERMISOS` y aparecen en el endpoint `GET /roles/permisos` que consume el frontend.

### Paso 2: Frontend - Agregar item al sidebar

Archivo: `enjoy-angular/src/app/core/constants/sidebar.config.ts`

Agrega el item a `SIDEBAR_MENU_FULL`:

```typescript
{ label: 'Mi Modulo', route: '/mi-modulo', icon: 'nombre-icono', permission: 'mi-modulo.ver', mobile: true },
```

- `permission`: el permiso que necesita el usuario para ver este item
- `mobile: true`: si quieres que aparezca en el bottom-nav del movil
- `icon`: nombre del icono de Lucide (debe estar registrado en `lucide-icons.ts`)

### Paso 3: Frontend - Proteger la ruta

Archivo: `enjoy-angular/src/app/app.routes.ts`

```typescript
{
  path: 'mi-modulo',
  canActivate: [roleGuard],
  data: { permissions: ['mi-modulo.ver'] },
  loadChildren: () =>
    import('./features/mi-modulo/mi-modulo.routes').then(m => m.miModuloRoutes),
},
```

El `roleGuard` verifica que el usuario tenga al menos uno de los permisos listados en `data.permissions`.

### Paso 4: Backend - Proteger endpoints (opcional)

En el controller del nuevo modulo, usa el decorador `@Auth()` con permisos:

```typescript
@Get()
@Auth('mi-modulo.ver')  // Solo usuarios con este permiso
findAll() { ... }

@Post()
@Auth('mi-modulo.crear')
create() { ... }

@Patch(':id')
@Auth('mi-modulo.editar')
update() { ... }

@Delete(':id')
@Auth('mi-modulo.eliminar')
delete() { ... }
```

Si usas `@Auth()` sin parametros, solo valida que el usuario este autenticado (JWT valido) sin verificar permisos.

### Paso 5: Asignar permisos a roles

Desde la interfaz web en `/roles`:
1. Edita el rol que necesitas (ej: "Administrador")
2. Marca los checkboxes del nuevo modulo
3. Guarda

Los nuevos permisos aparecen automaticamente en la seccion de permisos del formulario de roles porque se leen del endpoint `GET /roles/permisos`.

---

## Archivos clave

### Backend (coponera-nest)

| Archivo | Funcion |
|---------|---------|
| `src/roles/constants/permisos.constant.ts` | Catalogo de todos los permisos |
| `src/roles/schema/rol.schema.ts` | Schema MongoDB del rol |
| `src/roles/roles.service.ts` | CRUD de roles + seed + resolver permisos |
| `src/roles/roles.controller.ts` | Endpoints REST de roles |
| `src/auth/decorators/auth.decorator.ts` | `@Auth(...permisos)` decorator |
| `src/auth/guards/permissions.guard.ts` | Guard que valida permisos en endpoints |
| `src/auth/strategies/jwt.strategy.ts` | Adjunta `permisos[]` al `req.user` |

### Frontend (enjoy-angular)

| Archivo | Funcion |
|---------|---------|
| `src/app/core/services/permissions.service.ts` | `hasPermission()`, `hasAnyPermission()` |
| `src/app/core/services/roles.service.ts` | Cliente HTTP para API de roles |
| `src/app/core/guards/role-guard.ts` | Guard de rutas (soporta `permissions` y `roles`) |
| `src/app/core/guards/auth.guard.ts` | Valida `web.acceso` en cada navegacion |
| `src/app/core/constants/sidebar.config.ts` | Menu con permisos por item |
| `src/app/features/roles/` | UI de gestion de roles |

---

## Endpoints de la API

| Metodo | Ruta | Funcion |
|--------|------|---------|
| `GET /roles` | Listar todos los roles |
| `GET /roles/permisos` | Lista maestra de permisos (para el formulario) |
| `GET /roles/:id` | Obtener rol por ID |
| `POST /roles` | Crear rol |
| `PATCH /roles/:id` | Actualizar rol |
| `DELETE /roles/:id` | Eliminar rol (solo personalizados) |

---

## Ejemplo: Crear rol "Vendedor"

1. Ir a `/roles` en el dashboard
2. Click "Crear rol"
3. Nombre: `Vendedor`
4. Marcar permisos:
   - `web.acceso` (para que pueda entrar al panel)
   - `cupones.ver`
   - `cupones.crear`
   - `establecimientos.ver`
5. Guardar
6. Ir a `/usuarios`, editar un usuario y cambiar su rol a "Vendedor"
7. Ese usuario al hacer login solo vera: Cupones, Crear cupon, Establecimientos

---

## Notas importantes

- El permiso `web.acceso` es **obligatorio** para poder ingresar al dashboard web. Sin este permiso, el usuario ve "Acceso denegado" al intentar hacer login.
- Los roles de sistema (admin, admin-local, staff, visualizador) se crean automaticamente la primera vez que se levanta el backend. Si ya existen, no se sobreescriben.
- Si necesitas resetear los roles por defecto, elimina todos los documentos de la coleccion `roles` en MongoDB y reinicia el backend.
- El sistema es **backward compatible**: usuarios que no tengan `permisos[]` en su objeto (por no haber re-logueado) caen al fallback por `rol` string en el sidebar y guards.
- La app Flutter **no se ve afectada** por estos cambios. Almacena el usuario como `Map<String, dynamic>` y no valida campos extra.

---

> Para documentacion completa del proyecto (pagos, auditoria, seguridad, etc.) ver `DOCUMENTACION.md` en la raiz del proyecto.
