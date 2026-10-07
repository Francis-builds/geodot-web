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


@needs_blender
def test_technical_frames(route, tmp_path):
    from PIL import Image, ImageStat
    out = run_hero("--mode", "technical", "--route", str(route), "--out", str(tmp_path),
                   "--res", "480x270", "--frames", "1-289", "--step", "96", timeout=600)
    names = ["f_0001.png", "f_0097.png", "f_0193.png", "f_0289.png"]
    for n in names:
        assert (tmp_path / n).exists(), out.stdout[-1500:] + out.stderr[-1500:]
        assert Image.open(tmp_path / n).size == (480, 270)
    assert ImageStat.Stat(Image.open(tmp_path / names[0]).convert("L")).mean[0] > 2
