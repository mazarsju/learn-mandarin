#!/usr/bin/env python3
"""Run backend tests with coverage and generate HTML/JSON reports."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
ROOT = BACKEND_DIR.parent
COVERAGE_DIR = BACKEND_DIR / "coverage"


def write_summary(coverage_json: Path, output: Path) -> None:
    totals = json.loads(coverage_json.read_text())["totals"]
    covered_lines = totals["covered_lines"]
    missing_lines = totals["missing_lines"]
    total_lines = covered_lines + missing_lines
    lines_pct = round(100 * covered_lines / total_lines, 2) if total_lines else 100.0
    statements_pct = round(
        totals.get(
            "percent_statements_covered",
            totals.get("percent_covered", 0),
        ),
        2,
    )

    if "percent_branches_covered" in totals:
        branches_pct = round(totals["percent_branches_covered"], 2)
    elif totals.get("num_branches"):
        branches_pct = round(100 * totals["covered_branches"] / totals["num_branches"], 2)
    else:
        branches_pct = 100.0

    summary = {
        "total": {
            "lines": {"pct": lines_pct},
            "statements": {"pct": statements_pct},
            "branches": {"pct": branches_pct},
            "functions": {"pct": statements_pct},
        }
    }
    output.write_text(json.dumps(summary, indent=2) + "\n")


def main() -> int:
    subprocess.run(
        [
            sys.executable,
            "-m",
            "coverage",
            "run",
            "-m",
            "unittest",
            "discover",
            "-s",
            "backend/tests",
            "-v",
        ],
        cwd=ROOT,
        check=True,
    )

    COVERAGE_DIR.mkdir(exist_ok=True)
    subprocess.run(
        [sys.executable, "-m", "coverage", "html"],
        cwd=ROOT,
        check=True,
    )
    coverage_json = COVERAGE_DIR / "coverage.json"
    subprocess.run(
        [sys.executable, "-m", "coverage", "json", "-o", str(coverage_json)],
        cwd=ROOT,
        check=True,
    )
    write_summary(coverage_json, COVERAGE_DIR / "coverage-summary.json")
    print(f"Coverage report: {COVERAGE_DIR / 'index.html'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
