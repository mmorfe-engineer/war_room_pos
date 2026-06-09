"""
═══════════════════════════════════════════════════════════════════════════
  OPERACIÓN MERIDIANO — Modelo de Distribución de POS
  DIGIPAGOS × Banco Digital de los Trabajadores (BDT)
═══════════════════════════════════════════════════════════════════════════
  Modelo de Potencial Acotado (MPA):
    Capa 1 — Cuota por hub/estado (fórmula de velocidad con factor de urgencia)
    Capa 2 — Alícuota por agencia (√rentabilidad + techo 15% + piso 2)
    Clasificación — Tiers ALFA / BRAVO / CHARLIE / DELTA por percentil nacional

  Uso:  python src/modelo_meridiano.py
  Salida: outputs/matriz_asignacion_v2.csv  y  MODELO_DATA.json
═══════════════════════════════════════════════════════════════════════════
"""
import pandas as pd
import numpy as np
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = ROOT / "outputs"

# ── Parámetros del modelo (ajustables) ─────────────────────────────────────
TOTAL_POS = 2000
ALPHA = 0.5          # exponente de compresión (0.5 = raíz cuadrada)
FLOOR = 2            # piso de POS por agencia (Regla 5)
CAP_PCT = 0.15       # techo: 15% de la cuota del estado (Regla 4)
P15_PCT = 0.15       # percentil de corte para lista de espera

# Cuotas por estado (Capa 1, fórmula de velocidad ya resuelta)
CUOTAS = {'Sucre':7,'Miranda':41,'Falcón':33,'Lara':27,'Anzoátegui':64,'Mérida':31,
 'Barinas':56,'Bolívar':33,'Nueva Esparta':34,'Monagas-Delta Amacuro':36,'Táchira':62,
 'Guárico':35,'Aragua':78,'Apure-Amazonas':44,'La Guaira':45,'Trujillo':40,
 'Portuguesa':86,'Carabobo':181,'Gran Caracas':734,'Yaracuy':81,'Zulia':252}

MAPEO_ESTADO = {'Amazonas':'Apure-Amazonas','Apure':'Apure-Amazonas','La Guaira':'La Guaira',
 'Guarico':'Guárico','Tachira':'Táchira','Zulia':'Zulia','Falcon':'Falcón','Merida':'Mérida',
 'Bolivar':'Bolívar','Anzoategui':'Anzoátegui','Delta Amacuro':'Monagas-Delta Amacuro',
 'Monagas':'Monagas-Delta Amacuro','Cojedes':'Yaracuy'}

REGION = {'Gran Caracas':'Capital Centro','Miranda':'Capital Centro','Carabobo':'Capital Centro',
 'Guárico':'Capital Centro','Aragua':'Capital Centro','Apure-Amazonas':'Capital Centro',
 'La Guaira':'Capital Centro','Barinas':'Centro Occidente','Portuguesa':'Centro Occidente',
 'Yaracuy':'Centro Occidente','Lara':'Centro Occidente','Zulia':'Occidente','Táchira':'Occidente',
 'Falcón':'Occidente','Mérida':'Occidente','Trujillo':'Occidente','Anzoátegui':'Oriente',
 'Bolívar':'Oriente','Nueva Esparta':'Oriente','Monagas-Delta Amacuro':'Oriente','Sucre':'Oriente'}


def parse_rent(x):
    """Convierte el formato venezolano (1.234.567,89) a float."""
    if pd.isna(x) or str(x).strip() == '':
        return np.nan
    s = str(x).strip().replace('"', '').replace(' ', '').replace('.', '').replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return np.nan


def cargar_rentabilidad():
    df = pd.read_csv(DATA / "8_agencia_rentabilidad_vis.csv", skiprows=5)
    df.columns = ['cod_estado', 'estado', 'region', 'cod_agencia', 'nombre_agencia', 'rent_raw']
    df['rentabilidad'] = df['rent_raw'].apply(parse_rent)
    df = df.dropna(subset=['rentabilidad']).drop_duplicates(subset=['cod_agencia', 'estado'])
    df['estado'] = df['estado'].str.strip()
    df['estado_cuota'] = df['estado'].map(MAPEO_ESTADO).fillna(df['estado'])
    return df


def asignar_estado(grupo, cuota, cap):
    """Capa 2: alícuota por √rentabilidad con techo y redistribución iterativa."""
    g = grupo.copy()
    g['peso'] = g['rentabilidad'] ** ALPHA
    g['pos'] = g['peso'] / g['peso'].sum() * cuota
    for _ in range(80):
        topadas = g['pos'] > cap
        if not topadas.any():
            break
        exceso = (g.loc[topadas, 'pos'] - cap).sum()
        g.loc[topadas, 'pos'] = cap
        libres = ~topadas
        if not libres.any() or g.loc[libres, 'peso'].sum() == 0:
            break
        g.loc[libres, 'pos'] += g.loc[libres, 'peso'] / g.loc[libres, 'peso'].sum() * exceso
    g['pos'] = g['pos'].round(0).astype(int)
    diff = cuota - g['pos'].sum()
    if diff != 0:
        g.loc[g['peso'].idxmax(), 'pos'] += diff
    return g


def construir_modelo():
    df = cargar_rentabilidad()
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
        g = asignar_estado(grupo, cuota, cap)
        g['estado_asig'] = estado
        g['cap'] = cap
        resultados.append(g)

    df_final = pd.concat(resultados, ignore_index=True)
    act = df_final[df_final['pos'] > 0].copy()
    act['REGION'] = act['estado_asig'].map(REGION)

    # Tiers por percentil nacional de rentabilidad
    act = act.sort_values('rentabilidad', ascending=False).reset_index(drop=True)
    act['pctil'] = (1 - (np.arange(len(act)) / len(act))) * 100
    act['TIER'] = act['pctil'].apply(
        lambda p: 'ALFA' if p >= 90 else 'BRAVO' if p >= 70 else 'CHARLIE' if p >= 40 else 'DELTA')

    return act, p15


if __name__ == "__main__":
    act, p15 = construir_modelo()
    print(f"Total POS asignados : {act['pos'].sum()}")
    print(f"Agencias activas    : {len(act)}")
    print(f"Umbral P15 nacional : {p15:,.0f} Bs")
    print("\nPOS por tier:")
    print(act.groupby('TIER')['pos'].agg(['count', 'sum']))
    print("\nPOS por región:")
    print(act.groupby('REGION')['pos'].agg(['count', 'sum']))

    OUT.mkdir(exist_ok=True)
    cols = ['REGION', 'estado_asig', 'cod_agencia', 'nombre_agencia', 'rentabilidad', 'pos', 'TIER']
    act[cols].to_csv(OUT / "matriz_asignacion_v2.csv", index=False, encoding='utf-8-sig')
    print(f"\n✓ Exportado a {OUT / 'matriz_asignacion_v2.csv'}")
