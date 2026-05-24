# SitiosWebDLB Builder Pro

Plataforma profesional en React + Vite para crear sitios web editables y exportarlos en ZIP multipágina.

## Requisitos

- Node.js instalado
- VS Code
- Navegador

## Instalación

```bash
npm install
npm run dev
```

Abre la URL que aparezca, normalmente:

```bash
http://localhost:5173
```

## Para usar IA / búsqueda real opcional

Copia `.env.example` como `.env` y coloca tus API keys.

Luego ejecuta:

```bash
npm run dev:full
```

## Exportar sitio del cliente

Dentro del builder:

1. Llena los datos.
2. Edita páginas, servicios, formularios y galería.
3. Presiona **Exportar ZIP**.
4. El ZIP tendrá:
   - index.html
   - servicios.html
   - galeria.html
   - citas.html si está activa
   - financiamiento.html si está activa
   - contacto.html
   - css/style.css
   - js/script.js
   - imagenes/

## Crédito fijo

Todas las webs exportadas incluyen:

**Desarrollado por SitiosWebDLB**
