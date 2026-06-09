from __future__ import annotations

import argparse
import csv
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


RAIZ_REPO = Path(__file__).resolve().parents[1]
DATA_DIR = RAIZ_REPO / "data"
OUTPUTS_DIR = RAIZ_REPO / "outputs"

HUBS_REGIONALES = {
    "Capital Centro": "H1 CENTINELA",
    "Occidente": "H2 FRONTERA",
    "Centro Occidente": "H3 LLANO",
    "Oriente": "H4 AURORA",
}


def parse_rent(valor: str | float | int | None) -> float:
    if valor is None:
        return 0.0
    if isinstance(valor, (int, float)):
        return float(valor)
    limpio = "".join(c for c in valor.strip() if c in "0123456789,.-")
    if not limpio or limpio in {"-", ".", ","}:
        return 0.0
    if "," in limpio:
        limpio = limpio.replace(".", "").replace(",", ".")
    else:
        partes = limpio.split(".")
        if len(partes) > 1 and all(len(parte) == 3 for parte in partes[1:]):
            limpio = "".join(partes)
    return float(limpio)


@dataclass(frozen=True)
class EstadoMeta:
    estado: str
    meta_bdt: float
    cumplimiento: float
    factor_urgencia: float


def _normalizar_enteros(valores: dict[str, float], total: int) -> dict[str, int]:
    base = {k: int(math.floor(v)) for k, v in valores.items()}
    faltantes = total - sum(base.values())
    residuos = sorted(
        ((k, valores[k] - base[k]) for k in valores),
        key=lambda x: x[1],
        reverse=True,
    )
    for i in range(max(0, faltantes)):
        base[residuos[i % len(residuos)][0]] += 1
    return base


def calcular_cuotas_estado(estados: Iterable[EstadoMeta], total_pos: int = 2000) -> dict[str, int]:
    pesos: dict[str, float] = {}
    for fila in estados:
        peso = fila.meta_bdt * (1 - fila.cumplimiento) * fila.factor_urgencia
        pesos[fila.estado] = max(0.0, peso)
    suma = sum(pesos.values())
    if suma <= 0:
        raise ValueError("La suma de pesos estatales es 0; no se puede asignar cuota.")
    cuotas_float = {k: total_pos * (v / suma) for k, v in pesos.items()}
    return _normalizar_enteros(cuotas_float, total_pos)


def _tier_por_percentil(rentabilidades: list[float], rentabilidad: float) -> str:
    orden = sorted(rentabilidades)
    if not orden:
        return "DELTA"
    q25 = orden[max(0, int(0.25 * (len(orden) - 1)))]
    q50 = orden[max(0, int(0.50 * (len(orden) - 1)))]
    q75 = orden[max(0, int(0.75 * (len(orden) - 1)))]
    if rentabilidad >= q75:
        return "ALFA"
    if rentabilidad >= q50:
        return "BRAVO"
    if rentabilidad >= q25:
        return "CHARLIE"
    return "DELTA"


def asignar_pos_agencias(
    agencias: list[dict[str, str]],
    cuotas_estado: dict[str, int],
    alpha: float = 0.5,
    tope_estado: float = 0.15,
    piso_pos: int = 2,
) -> list[dict[str, str | int | float]]:
    if not 0 < alpha <= 1:
        raise ValueError("alpha debe estar entre 0 y 1.")
    salida: list[dict[str, str | int | float]] = []
    rentas_validas = [parse_rent(a["rentabilidad"]) for a in agencias if parse_rent(a["rentabilidad"]) > 0]
    por_estado: dict[str, list[dict[str, str]]] = {}
    for a in agencias:
        por_estado.setdefault(a["estado"], []).append(a)
    for estado, cuota in cuotas_estado.items():
        candidatas = [a for a in por_estado.get(estado, []) if parse_rent(a["rentabilidad"]) > 0]
        if not candidatas or cuota <= 0:
            continue
        pesos = [parse_rent(a["rentabilidad"]) ** alpha for a in candidatas]
        suma_pesos = sum(pesos)
        if suma_pesos <= 0:
            continue
        objetivo = [cuota * p / suma_pesos for p in pesos]
        asignadas = [max(piso_pos, int(math.floor(v))) for v in objetivo]
        tope_abs = max(piso_pos, int(math.floor(cuota * tope_estado)))
        asignadas = [min(v, tope_abs) for v in asignadas]
        restante = cuota - sum(asignadas)
        residuos = sorted(
            range(len(candidatas)),
            key=lambda i: objetivo[i] - math.floor(objetivo[i]),
            reverse=True,
        )
        while restante > 0 and residuos:
            movimiento = False
            for i in residuos:
                if asignadas[i] < tope_abs:
                    asignadas[i] += 1
                    restante -= 1
                    movimiento = True
                    if restante == 0:
                        break
            if not movimiento:
                break
        if restante > 0 and residuos:
            for i in residuos:
                if restante == 0:
                    break
                asignadas[i] += 1
                restante -= 1
            while restante > 0:
                for i in residuos:
                    if restante == 0:
                        break
                    asignadas[i] += 1
                    restante -= 1
        for idx, ag in enumerate(candidatas):
            renta = parse_rent(ag["rentabilidad"])
            salida.append(
                {
                    "estado": estado,
                    "hub": ag.get("hub", HUBS_REGIONALES.get(ag.get("region", ""), "H1 CENTINELA")),
                    "cod_agencia": ag["cod_agencia"],
                    "rentabilidad": renta,
                    "tier": _tier_por_percentil(rentas_validas, renta),
                    "pos_objetivo": asignadas[idx],
                }
            )
    total = sum(int(f["pos_objetivo"]) for f in salida)
    if total != sum(cuotas_estado.values()):
        raise ValueError(f"Integridad inválida: total_agencias={total}, total_estado={sum(cuotas_estado.values())}")
    return salida


def _leer_estados(path: Path) -> list[EstadoMeta]:
    filas: list[EstadoMeta] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            filas.append(
                EstadoMeta(
                    estado=r["estado"],
                    meta_bdt=parse_rent(r["meta_bdt"]),
                    cumplimiento=parse_rent(r["cumplimiento"]),
                    factor_urgencia=parse_rent(r["factor_urgencia"]),
                )
            )
    return filas


def _leer_agencias(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def ejecutar_modelo(
    estados_csv: Path = DATA_DIR / "estados_meta.csv",
    agencias_csv: Path = DATA_DIR / "agencias.csv",
    salida_csv: Path = OUTPUTS_DIR / "matriz_objetivo.csv",
    salida_json: Path = OUTPUTS_DIR / "integridad.json",
    total_pos: int = 2000,
) -> dict[str, int]:
    estados = _leer_estados(estados_csv)
    agencias = _leer_agencias(agencias_csv)
    cuotas = calcular_cuotas_estado(estados, total_pos=total_pos)
    matriz = asignar_pos_agencias(agencias, cuotas)
    salida_csv.parent.mkdir(parents=True, exist_ok=True)
    with salida_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["estado", "hub", "cod_agencia", "tier", "pos_objetivo", "rentabilidad"],
        )
        writer.writeheader()
        writer.writerows(matriz)
    resumen = {"total_pos_objetivo": sum(int(r["pos_objetivo"]) for r in matriz), "total_pos_esperado": total_pos}
    with salida_json.open("w", encoding="utf-8") as f:
        json.dump(resumen, f, ensure_ascii=False, indent=2)
    return resumen


def main() -> int:
    parser = argparse.ArgumentParser(description="Modelo MPA - Operación Meridiano")
    parser.add_argument("--validar-integridad", action="store_true", help="Falla si POS total != 2000")
    args = parser.parse_args()
    resumen = ejecutar_modelo()
    if args.validar_integridad and resumen["total_pos_objetivo"] != resumen["total_pos_esperado"]:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
