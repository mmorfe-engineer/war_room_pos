# Operación Meridiano (war_room_pos)

Repositorio base para análisis y control de despliegue POS con modelo MPA.

## Estructura mínima

- `src/modelo_meridiano.py`: núcleo reproducible del modelo, incluye `parse_rent`.
- `data/`: insumos CSV de ejemplo para ejecutar el modelo.
- `outputs/`: artefactos internos (sensibles).
- `docs/`: build público enmascarado (sin Bs).
- `.github/workflows/integridad.yml`: validación automática de suma POS=2000.

## Ejecución local

```bash
python /home/runner/work/war_room_pos/war_room_pos/mmorfe-engineer/war_room_pos/src/modelo_meridiano.py
```

## Seguridad de datos

- Nunca publicar rentabilidad en Bs en `docs/`.
- La salida sensible permanece en `outputs/`.
