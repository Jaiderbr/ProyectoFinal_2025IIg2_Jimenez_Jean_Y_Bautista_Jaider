# Configuración de Supabase para NewsPortal

## 1. Variables de entorno (.env)

```properties
VITE_SUPABASE_URL=https://zqwabsdxmempeucyypqf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxd2Fic2R4bWVtcGV1Y3l5cHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Njc3MTQsImV4cCI6MjA3NzQ0MzcxNH0.OCS4uxCF4q5PajS5bFqedKuO3c53o4p71mlmYOjq4J0
VITE_SUPABASE_BUCKET=news
```

**Nota:** Después de modificar el archivo `.env`, reinicia el servidor de Vite.

## 2. Crear Bucket de Storage

1. Ve a **Storage** en tu proyecto de Supabase
2. Click en **Create bucket**
3. Nombre: `news`
4. Marca como **Public** (para usar URLs públicas directas)
5. Click **Save**

## 3. Políticas RLS (Row Level Security)

### Tabla `secciones` (lectura pública)

```sql
-- Habilitar RLS
alter table public.secciones enable row level security;

-- Permitir lectura pública
create policy "secciones_select_public" 
  on public.secciones 
  for select 
  using (true);
```

### Tabla `posts` (lectura pública, inserción según necesidad)

```sql
-- Habilitar RLS
alter table public.posts enable row level security;

-- Permitir lectura pública
create policy "posts_select_public" 
  on public.posts 
  for select 
  using (true);

-- OPCIÓN A: Permitir insert a todos (sin autenticación)
create policy "posts_insert_public" 
  on public.posts 
  for insert 
  with check (true);

-- OPCIÓN B: Permitir insert solo a usuarios autenticados (comentar la anterior)
-- create policy "posts_insert_auth" 
--   on public.posts 
--   for insert 
--   with check (auth.role() = 'authenticated');
```

### Tabla `usuarios` (para login/registro)

```sql
-- Habilitar RLS
alter table public.usuarios enable row level security;

-- Permitir lectura pública de campos específicos para login
-- (en producción, considera usar una función RPC para mayor seguridad)
create policy "usuarios_select_public" 
  on public.usuarios 
  for select 
  using (true);

-- Permitir registro público
create policy "usuarios_insert_public" 
  on public.usuarios 
  for insert 
  with check (true);
```

### Storage (bucket `news`)

```sql
-- Permitir lectura pública del bucket
create policy "storage_read_public_news" 
  on storage.objects 
  for select 
  using (bucket_id = 'news');

-- OPCIÓN A: Permitir subida sin autenticación
create policy "storage_insert_public_news" 
  on storage.objects 
  for insert 
  with check (bucket_id = 'news');

-- OPCIÓN B: Permitir subida solo a autenticados (comentar la anterior)
-- create policy "storage_insert_auth_news" 
--   on storage.objects 
--   for insert 
--   with check (bucket_id = 'news' and auth.role() = 'authenticated');
```

## 4. Nota importante sobre nombres de columnas

Postgres **convierte automáticamente** los nombres de columnas a minúsculas a menos que uses comillas dobles. Por ejemplo:

- Tu esquema define: `idUsuario` 
- Postgres lo guarda como: `idusuario`

El código ya está actualizado para usar nombres en **minúsculas** en todas las queries:
- `idusuario` en lugar de `idUsuario`
- `idseccion` en lugar de `idSeccion`
- `fechapublicacion` en lugar de `fechaPublicacion`

## 5. Instalación de dependencias

El proyecto usa `bcryptjs` para hashear contraseñas:

```bash
npm install bcryptjs
```

## 6. Probar la aplicación

### Registrar usuario
1. Navega a `/register`
2. Completa el formulario (nombre, email, contraseña, rol)
3. Click en "Registrarme"
4. Te redirige a `/login`

### Login
1. Usa el email y contraseña del usuario registrado
2. La sesión se guarda en `localStorage`

### Crear post
1. En la página principal, click en "Añadir noticia"
2. Completa:
   - Título (obligatorio)
   - Contenido (obligatorio)
   - Sección (selecciona una de las existentes)
   - Estado: "publicado" o "borrador"
   - Imagen (opcional)
3. Click en "Guardar noticia"

### Ver posts
- Se muestran ordenados por fecha de publicación (más recientes primero)
- Click en una sección del Header para filtrar por categoría
- Click en "Ver más" en una card para mostrar el contenido completo

## 7. Solución de problemas comunes

### Error 400: "column does not exist"
- Verifica que las políticas RLS estén activas
- Confirma que los nombres de columnas en las queries usan minúsculas

### Error 404: imagen no carga
- Verifica que el bucket `news` esté creado y sea público
- Confirma que la policy de Storage permite lectura pública

### Error de Firebase
- Si ves errores de Firebase, verifica que hayas removido imports de `firebase/auth` o `firebase/firestore`
- El proyecto ahora usa 100% Supabase

### "Multiple GoTrueClient instances"
- Esto es solo un warning, no afecta funcionalidad
- Ocurre porque Supabase Auth se inicializa más de una vez (puede ser por React StrictMode en desarrollo)
