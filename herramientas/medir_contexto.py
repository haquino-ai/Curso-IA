"""Mide cuánto contexto entra en cada llamada y cuánto cuesta, SIN llamar a la IA (gratis, sin API key).

Uso (desde la raíz del repositorio):
    python herramientas/medir_contexto.py
    $env:PRICE_IN="..."     (USD por millón de tokens de ENTRADA, de la consola de Anthropic)  -> agrega costos
    python herramientas/medir_contexto.py --llamadas-mes 100000

Los tokens son una ESTIMACIÓN (≈ 1 token cada 3,6 caracteres en español). Para el número exacto agregue --exacto
con ANTHROPIC_API_KEY definida: usa el endpoint de conteo de tokens de la API.
"""
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from recuperar import RAIZ, Indice, formatear, fragmentos  # noqa: E402

CHARS_POR_TOKEN = 3.6


def est(texto):
    return round(len(texto) / CHARS_POR_TOKEN)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--llamadas-mes", type=int, default=100_000)
    ap.add_argument("--exacto", action="store_true")
    a = ap.parse_args()

    ts = (RAIZ / "prompts" / "responder.system.ts").read_text(encoding="utf-8")
    system = ts[ts.index("`") + 1: ts.rindex("`")]  # el reglamento está entre comillas invertidas
    frags = fragmentos(incluir_obsoletos=False)
    idx = Indice(frags)
    pregunta = "<pregunta>\n¿Cuánto es el deducible si choco mi auto?\n</pregunta>"
    estrategias = {
        "A. Sin documentos": "<documentos>\n</documentos>",
        "B. Todos los documentos": formatear([(1, f) for f in frags]),
        "C. 3 fragmentos recuperados": formatear(idx.buscar("deducible choco auto siniestro", 3)),
    }
    p_in = os.environ.get("PRICE_IN")
    print(f"{'Estrategia':<30}{'Tokens entrada':>16}{'Veces vs C':>12}" + ("   Costo entrada/mes (USD)" if p_in else ""))
    base = est(system + estrategias["C. 3 fragmentos recuperados"] + pregunta)
    for nombre, docs in estrategias.items():
        t = est(system + docs + pregunta)
        if a.exacto and os.environ.get("ANTHROPIC_API_KEY"):
            import anthropic
            t = anthropic.Anthropic().messages.count_tokens(
                model="claude-haiku-4-5-20251001", system=system,
                messages=[{"role": "user", "content": docs + pregunta}]).input_tokens
        fila = f"{nombre:<30}{t:>16}{t / base:>11.1f}x"
        if p_in:
            fila += f"   {t / 1e6 * float(p_in) * a.llamadas_mes:>12,.2f}"
        print(fila)
    print(f"\nSupuestos: {a.llamadas_mes:,} llamadas al mes; solo cuenta la ENTRADA (la salida es similar en las tres).")
    print("Con 20 veces más documentos, B pasa de ~2.600 a ~40.000 tokens por llamada; C sigue cerca de ~800.")


if __name__ == "__main__":
    main()
