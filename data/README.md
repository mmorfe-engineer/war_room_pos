# Data

CSV fuente del modelo Meridiano.

## Archivos

1. `1_pos_top_vis.csv`: POS por topología / histórico de topes.
2. `2_metas_agencia_captacion_vis.csv`: metas de captación por agencia.
3. `3_metas_agencia_pos_vis.csv`: metas POS por agencia.
4. `4_topo_metas_pos_vis.csv`: metas POS por topología.
5. `5_estatus_pos_vis.csv`: catálogo de estatus de despliegue.
6. `6_instalacion_metas_pos_vis.csv`: progreso instalación vs metas.
7. `7_top_metas_pos_vis.csv`: ranking/top de metas POS.
8. `8_agencia_rentabilidad_vis.csv`: rentabilidad mensual por agencia (**sensible**).

## Actualización de datos

1. Reemplazar CSV respetando nombres y columnas.
2. Validar estructura y encoding UTF-8.
3. Ejecutar `python src/modelo_meridiano.py --validar-integridad`.
4. Confirmar suma total de POS = 2000.
