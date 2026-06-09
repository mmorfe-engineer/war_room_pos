# 🌐 GitHub Pages - War Room Público

## Instrucciones para habilitar GitHub Pages

### Opción 1: Manual (UI) — 2 minutos
1. Ve a: https://github.com/mmorfe-engineer/war_room_pos/settings/pages
2. En **Source** selecciona:
   - Branch: `main`
   - Folder: `/docs`
3. Click en **Save**
4. GitHub Pages se habilitará en ~1-2 minutos

### Opción 2: CLI — si prefieres terminal
```bash
# Requiere GitHub CLI instalado y autenticado
gh repo edit mmorfe-engineer/war_room_pos \
  --enable-pages \
  --pages-source main:/docs
```

### Opción 3: REST API — programático
```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/mmorfe-engineer/war_room_pos/pages \
  -d '{
    "build_type": "legacy",
    "source": {
      "branch": "main",
      "path": "/docs"
    }
  }'
```

---

## 🔗 URL de tu War Room (una vez habilitado)

```
https://mmorfe-engineer.github.io/war_room_pos/
```

---

## 📊 Estructura servida

GitHub Pages servirá los archivos desde `/docs`:

```
docs/
├── index.html              ← Punto de entrada
├── styles.css              ← Estilos
├── app.js                  ← Lógica interactiva
└── data_public.js          ← Datos enmascarados
```

---

## ✅ Verificar que está activo

1. Ve a: https://github.com/mmorfe-engineer/war_room_pos/settings/pages
2. Deberías ver: **"Your site is live at https://mmorfe-engineer.github.io/war_room_pos/"**
3. Prueba el link: https://mmorfe-engineer.github.io/war_room_pos/

---

## 🔒 Seguridad verificada

✅ El contenido en `docs/` NO contiene:
- Rentabilidad en Bs sensibles
- Tab "Sala Privada" 
- Datos personales de agencias
- Información confidencial del BDT

✅ Los datos sensibles quedan en `outputs/` (nunca publicados)

---

**Última actualización:** 2026-06-09 17:30 UTC
