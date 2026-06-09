from pathlib import Path

# Rutas base
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT = ROOT / "outputs"

# Paleta de branding
COLORS = {
    'bg': '#070B14',
    'panel': '#111B2E',
    'alfa': '#00E5A0',
    'bravo': '#4C9FFF',
    'charlie': '#FFB454',
    'delta': '#8B95AD',
    'danger': '#FF5470',
}

# Parámetros del modelo
TOTAL_POS = 2000
ALPHA = 0.5
FLOOR = 2
CAP_PCT = 0.15
P15_PCT = 0.15

# Cuotas por estado (Capa 1)
CUOTAS = {
    'Sucre': 7, 'Miranda': 41, 'Falcón': 33, 'Lara': 27, 'Anzoátegui': 64, 'Mérida': 31,
    'Barinas': 56, 'Bolívar': 33, 'Nueva Esparta': 34, 'Monagas-Delta Amacuro': 36, 'Táchira': 62,
    'Guárico': 35, 'Aragua': 78, 'Apure-Amazonas': 44, 'La Guaira': 45, 'Trujillo': 40,
    'Portuguesa': 86, 'Carabobo': 181, 'Gran Caracas': 734, 'Yaracuy': 81, 'Zulia': 252,
}

MAPEO_ESTADO = {
    'Amazonas': 'Apure-Amazonas', 'Apure': 'Apure-Amazonas', 'La Guaira': 'La Guaira',
    'Guarico': 'Guárico', 'Tachira': 'Táchira', 'Zulia': 'Zulia', 'Falcon': 'Falcón', 'Merida': 'Mérida',
    'Bolivar': 'Bolívar', 'Anzoategui': 'Anzoátegui', 'Delta Amacuro': 'Monagas-Delta Amacuro',
    'Monagas': 'Monagas-Delta Amacuro', 'Cojedes': 'Yaracuy',
}

REGION = {
    'Gran Caracas': 'Capital Centro', 'Miranda': 'Capital Centro', 'Carabobo': 'Capital Centro',
    'Guárico': 'Capital Centro', 'Aragua': 'Capital Centro', 'Apure-Amazonas': 'Capital Centro',
    'La Guaira': 'Capital Centro', 'Barinas': 'Centro Occidente', 'Portuguesa': 'Centro Occidente',
    'Yaracuy': 'Centro Occidente', 'Lara': 'Centro Occidente', 'Zulia': 'Occidente', 'Táchira': 'Occidente',
    'Falcón': 'Occidente', 'Mérida': 'Occidente', 'Trujillo': 'Occidente', 'Anzoátegui': 'Oriente',
    'Bolívar': 'Oriente', 'Nueva Esparta': 'Oriente', 'Monagas-Delta Amacuro': 'Oriente', 'Sucre': 'Oriente',
}
