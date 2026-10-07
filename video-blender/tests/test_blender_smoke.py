"""Pruebas de humo del lado Blender (se saltean si Blender no está instalado)."""
import shutil
import subprocess
from pathlib import Path

import pytest

from plan.route import plan_route, write_route

ROOT = Path(__file__).resolve().parents[1]
BLENDER = shutil.which("blender") or "/Applications/Blender.app/Contents/MacOS/Blender"
needs_blender = pytest.mark.skipif(not Path(BLENDER).exists(), reason="sin Blender")


def run_hero(*args: str, timeout: int = 300) -> subprocess.CompletedProcess:
    return subprocess.run([BLENDER, "-b", "--factory-startup", "-P", str(ROOT / "scene" / "hero.py"), "--", *args],
                          capture_output=True, text=True, timeout=timeout)


@pytest.fixture(scope="module")
def route(tmp_path_factory):
    p = tmp_path_factory.mktemp("route") / "route.json"
    write_route(plan_route(), p)
    return p


@needs_blender
def test_scene_builds(route, tmp_path):
    out = run_hero("--mode", "check", "--route", str(route), "--out", str(tmp_path))
    assert "CHECK OK" in out.stdout, out.stdout[-2000:] + out.stderr[-2000:]
