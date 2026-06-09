# Operación Meridiano · War Room POS

Proyecto para planeación, asignación y control de despliegue de 2.000 terminales POS (DIGIPAGOS × BDT), con separación explícita entre artefactos internos y publicación pública en GitHub Pages.

## Estructura

- `data/`: fuentes CSV operativas (incluye datos sensibles de rentabilidad).
- `src/`: modelo Python modular (`config.py`, `utils.py`, `modelo_meridiano.py`).
- `outputs/`: salidas del modelo y versión interna del War Room.
- `docs/`: build público enmascarado para GitHub Pages.
- `notebooks/`: análisis y seguimiento en Jupyter.
- `.github/workflows/integridad_modelo.yml`: validación automática de suma POS=2000.

## Cómo ejecutar el modelo

```bash
pip install -r requirements.txt
python src/modelo_meridiano.py --validar-integridad
```

Salida principal: `outputs/matriz_asignacion_v2.csv`.

## Cómo regenerar War Room

1. Ejecutar el modelo Python.
2. Actualizar `docs/data_public.js` con versión enmascarada (sin Bs sensibles).
3. Publicar `docs/` vía GitHub Pages.

## Documentación por carpeta

- Datos: `data/README.md`
- Salidas: `outputs/README.md`
- Publicación Pages: `docs/README.md`
- Notebooks: `notebooks/README.md`

## GitHub Pages

Configurar Pages con source `main` y carpeta `/docs`.
