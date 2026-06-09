import argparse
import sys
from pathlib import Path

import numpy as np
import pandas as pd

if __package__ is None or __package__ == '':
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from src.config import CAP_PCT, CUOTAS, FLOOR, OUT, P15_PCT, REGION, TOTAL_POS
from src.utils import apply_ceiling_redistribution, load_rentability_data


def construir_modelo():
    df = load_rentability_data()
    p15 = df[df['rentabilidad'] > 0]['rentabilidad'].quantile(P15_PCT)
    elegibles = df[df['rentabilidad'] > 0].copy()
    fase1 = elegibles[elegibles['rentabilidad'] >= p15].copy()
    espera = elegibles[elegibles['rentabilidad'] < p15].copy()

    resultados = []
    for estado, cuota in CUOTAS.items():
        grupo = fase1[fase1['estado_cuota'] == estado].copy()
        if len(grupo) == 0:
            grupo = espera[espera['estado_cuota'] == estado].copy()
        if len(grupo) == 0:
            continue

        cap = max(FLOOR, round(CAP_PCT * cuota))
        if cuota < len(grupo) * FLOOR:
            grupo = grupo.sort_values('rentabilidad', ascending=False).head(max(1, cuota // FLOOR)).copy()

        g = apply_ceiling_redistribution(grupo, cuota, cap)
        g['estado_asig'] = estado
        g['cap'] = cap
        resultados.append(g)

    df_final = pd.concat(resultados, ignore_index=True)
    act = df_final[df_final['pos'] > 0].copy()
    act['REGION'] = act['estado_asig'].map(REGION)

    act = act.sort_values('rentabilidad', ascending=False).reset_index(drop=True)
    act['pctil'] = (1 - (np.arange(len(act)) / len(act))) * 100
    act['TIER'] = act['pctil'].apply(
        lambda p: 'ALFA' if p >= 90 else 'BRAVO' if p >= 70 else 'CHARLIE' if p >= 40 else 'DELTA'
    )

    return act, p15


def exportar_resultados(act):
    OUT.mkdir(exist_ok=True)
    cols = ['REGION', 'estado_asig', 'cod_agencia', 'nombre_agencia', 'rentabilidad', 'pos', 'TIER']
    salida = OUT / 'matriz_asignacion_v2.csv'
    act[cols].to_csv(salida, index=False, encoding='utf-8-sig')
    return salida


def main(validar_integridad=False):
    act, p15 = construir_modelo()
    total = int(act['pos'].sum())

    print(f'Total POS asignados : {total}')
    print(f'Agencias activas    : {len(act)}')
    print(f'Umbral P15 nacional : {p15:,.0f} Bs')
    print('\nPOS por tier:')
    print(act.groupby('TIER')['pos'].agg(['count', 'sum']))
    print('\nPOS por región:')
    print(act.groupby('REGION')['pos'].agg(['count', 'sum']))

    salida = exportar_resultados(act)
    print(f'\n✓ Exportado a {salida}')

    if validar_integridad:
        if total != TOTAL_POS:
            raise SystemExit(f'ERROR: suma={total}, esperado={TOTAL_POS}')
        print(f'✓ Integridad verificada: suma = {TOTAL_POS}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--validar-integridad', action='store_true')
    args = parser.parse_args()
    main(validar_integridad=args.validar_integridad)
