# 📰 NewsPortal - Sistema de Gestión de Noticias

Portal de noticias moderno con sistema de gestión de contenidos (CMS) que permite a reporteros crear noticias y a editores gestionarlas con un flujo de trabajo completo de publicación.

## 👥 Autores

- **Jaider Bautista Rodriguez**
  - Email: jaid.bautista@udla.edu.co
  - GitHub: [@Jaiderbr](https://github.com/Jaiderbr)

- **Jean Carlos Jimenez Ortega**
  - Email: jean.jimenez@udla.edu.co
  - GitHub: [@Jeank-J](https://github.com/Jeank-J)

## 📋 Descripción del Proyecto

NewsPortal es una aplicación web completa de gestión de noticias que implementa:

- **Portal público**: Visualización de noticias publicadas organizadas por secciones
- **Panel de reportero**: Creación y edición de noticias con estados de flujo de trabajo
- **Panel de editor**: Aprobación, publicación y gestión de contenido
- **Sistema de autenticación**: Registro e inicio de sesión con roles diferenciados
- **Gestión de secciones**: CRUD completo para categorías de noticias
- **Carga de imágenes**: Integración con Supabase Storage

### Flujo de Estados de Noticias

1. **Edición**: Noticia en borrador (reportero puede editar)
2. **Terminado**: Enviada a revisión (esperando aprobación del editor)
3. **Publicado**: Visible en el portal público
4. **Desactivado**: Removida del portal (puede ser republicada)

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 19.1.1**: Biblioteca principal para la UI
- **Vite**: Build tool y dev server
- **React Router 7.9.4**: Enrutamiento SPA con HashRouter
- **Material-UI 7.3.4**: Componentes UI (Cards, Dialogs, Tabs, Menu, Buttons)
- **Material Icons**: Iconografía del sistema

### Backend & Database
- **Supabase 2.78.0**: 
  - PostgreSQL como base de datos
  - Storage para imágenes
  - Autenticación y autorización
- **bcryptjs 3.0.2**: Hash de contraseñas

### Estilos
- CSS Modules personalizado
- Tema oscuro con acentos dorados (#ffd700)
- Diseño responsive para móviles y tablets

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (gratuita)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Jaiderbr/ProyectoFinal_2025IIg2_Jimenez_Jean_Y_Bautista_Jaider.git
cd ProyectoFinal_2025IIg2_Jimenez_Jean_Y_Bautista_Jaider
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `src/client.js` con tus credenciales de Supabase:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseKey = 'TU_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

4. **Configurar base de datos en Supabase**

Crea las siguientes tablas en tu proyecto de Supabase:

```sql
-- Tabla de usuarios
CREATE TABLE usuarios (
  uid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'reportero',
  estado BOOLEAN DEFAULT true
);

-- Tabla de secciones
CREATE TABLE secciones (
  idseccion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  estado BOOLEAN DEFAULT true
);

-- Tabla de posts/noticias
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  autor TEXT NOT NULL,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  categoria UUID REFERENCES secciones(idseccion),
  contenido TEXT NOT NULL,
  imagen TEXT,
  estado TEXT DEFAULT 'Edicion',
  destacado BOOLEAN DEFAULT false,
  fechacreacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fechaactualizacion TIMESTAMP WITH TIME ZONE
);
```

5. **Configurar Storage en Supabase**

Crea un bucket público llamado `imagenes` para almacenar las imágenes de las noticias.

6. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🌐 Despliegue

### GitHub Pages

El proyecto está configurado para desplegarse en GitHub Pages:

```bash
npm run build
npm run deploy
```

**URL del proyecto desplegado**: 
`https://jaiderbr.github.io/ProyectoFinal_2025IIg2_Jimenez_Jean_Y_Bautista_Jaider/`

### Configuración de Despliegue

El archivo `vite.config.js` incluye la configuración base para GitHub Pages:

```javascript
export default defineConfig({
  plugins: [react()],
  base: "/ProyectoFinal_2025IIg2_Jimenez_Jean_Y_Bautista_Jaider/",
})
```

## 🗂️ Estructura del Proyecto

```
src/
├── Components/
│   ├── CardsNews/      # Tarjetas de noticias reutilizables
│   ├── Footer/         # Footer con información de autores
│   ├── Header/         # Navegación principal
│   ├── Main/           # Contenedor principal
│   └── SectionCard/    # Tarjetas de secciones
├── Context/
│   └── AuthContext.jsx # Contexto de autenticación
├── pages/
│   ├── Login/          # Página de inicio de sesión
│   ├── Register/       # Página de registro
│   ├── MainPage/       # Portal público de noticias
│   ├── NoticiaDetalle/ # Vista detallada de noticia
│   ├── PanelReportero/ # Dashboard del reportero
│   ├── PanelEditor/    # Dashboard del editor
│   └── NotFound/       # Página 404
├── App.jsx             # Configuración de rutas
├── client.js           # Cliente de Supabase
└── main.jsx            # Punto de entrada
```

## 🎨 Características Principales

### Para Usuarios Públicos
- Visualización de noticias publicadas
- Filtrado por secciones
- Vista detallada de cada noticia
- Compartir noticias (URL directa o API nativa de compartir)
- Reportar contenido inapropiado

### Para Reporteros
- Crear nuevas noticias con imágenes
- Editar noticias en estado "Edición" o "Terminado"
- Marcar noticias como terminadas para revisión
- Ver estado de todas sus publicaciones

### Para Editores
- Aprobar o rechazar noticias
- Publicar noticias terminadas
- Desactivar noticias publicadas
- Eliminar noticias
- Gestión completa de secciones (CRUD)
- Vista separada de noticias pendientes y publicadas

## 🔐 Roles y Permisos

| Acción | Público | Reportero | Editor |
|--------|---------|-----------|--------|
| Ver noticias publicadas | ✅ | ✅ | ✅ |
| Crear noticias | ❌ | ✅ | ✅ |
| Editar propias noticias | ❌ | ✅ (solo Edición/Terminado) | ✅ |
| Publicar noticias | ❌ | ❌ | ✅ |
| Desactivar noticias | ❌ | ❌ | ✅ |
| Gestionar secciones | ❌ | ❌ | ✅ |

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Móviles (< 768px)
- 📱 Tablets (768px - 1024px)
- 💻 Desktop (> 1024px)

Características responsive:
- Tabs scrollables en móvil con flechas
- Cards de ancho uniforme
- Navegación colapsable
- Formularios adaptables

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run deploy       # Desplegar a GitHub Pages
npm run lint         # Ejecutar ESLint
```

## 🐛 Solución de Problemas

### Error de conexión a Supabase
Verifica que las credenciales en `src/client.js` sean correctas y que tu proyecto de Supabase esté activo.

### Imágenes no se cargan
Asegúrate de que el bucket `imagenes` en Supabase Storage esté configurado como público.

### Rutas no funcionan después del deploy
El proyecto usa HashRouter para compatibilidad con GitHub Pages. Las URLs incluyen `#` (ej: `/#/login`).

## 📄 Licencia

Este proyecto fue desarrollado como proyecto final académico para la Universidad de la Amazonia.

## 🙏 Agradecimientos

- Universidad de la Amazonia
- Supabase por su plataforma BaaS
- Material-UI por sus componentes
- React y Vite por las herramientas de desarrollo
