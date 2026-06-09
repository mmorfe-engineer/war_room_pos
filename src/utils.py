import numpy as np
import pandas as pd

from src.config import ALPHA, DATA, MAPEO_ESTADO, OUT


def parse_rent(x):
    """Convierte formato venezolano a float."""
    if pd.isna(x) or str(x).strip() == '':
        return np.nan
    s = str(x).strip().replace('"', '').replace(' ', '').replace('.', '').replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return np.nan


def load_rentability_data():
    """Carga datos de rentabilidad desde CSV."""
    rent_path = DATA / '8_agencia_rentabilidad_vis.csv'
    if rent_path.exists():
        df = pd.read_csv(rent_path, skiprows=5)
        df.columns = ['cod_estado', 'estado', 'region', 'cod_agencia', 'nombre_agencia', 'rent_raw']
        df['rentabilidad'] = df['rent_raw'].apply(parse_rent)
        df = df.dropna(subset=['rentabilidad']).drop_duplicates(subset=['cod_agencia', 'estado'])
        df['estado'] = df['estado'].str.strip()
        df['estado_cuota'] = df['estado'].map(MAPEO_ESTADO).fillna(df['estado'])
        return df

    fallback = OUT / 'matriz_asignacion_v2.csv'
    if not fallback.exists():
        raise FileNotFoundError('No se encontró data/8_agencia_rentabilidad_vis.csv ni outputs/matriz_asignacion_v2.csv')

    df = pd.read_csv(fallback)
    df = df.rename(columns={'estado_asig': 'estado'})
    df['rentabilidad'] = df['pos'].astype(float).clip(lower=1.0)
    df['estado'] = df['estado'].astype(str).str.strip()
    df['estado_cuota'] = df['estado'].map(MAPEO_ESTADO).fillna(df['estado'])
    return df[['cod_agencia', 'nombre_agencia', 'estado', 'estado_cuota', 'rentabilidad']]


def apply_ceiling_redistribution(grupo, cuota, cap, alpha=ALPHA):
    """Capa 2 del modelo con techo y redistribución."""
    g = grupo.copy()
    g['peso'] = g['rentabilidad'] ** alpha
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
