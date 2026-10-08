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


@needs_blender
def test_interior_has_racks_and_pallets(route, tmp_path):
    """Decisión de Fran en el checkpoint de la Task 5: el corte tiene que revelar racks con pallets."""
    import re
    out = run_hero("--mode", "check", "--route", str(route), "--out", str(tmp_path))
    m = re.search(r"RACKS (\d+) PALLETS (\d+)", out.stdout)
    assert m, out.stdout[-1500:] + out.stderr[-1500:]
    assert int(m.group(1)) >= 8 and int(m.group(2)) >= 200


@needs_blender
def test_anchors_export(route, tmp_path):
    import json
    out = run_hero("--mode", "anchors", "--route", str(route), "--out", str(tmp_path), "--res", "1920x1080")
    p = tmp_path / "film-anchors.json"
    assert p.exists(), out.stdout[-1500:] + out.stderr[-1500:]
    d = json.loads(p.read_text())
    n_route = len(json.loads(route.read_text())["frames"])
    assert d["fps"] == 24 and (d["width"], d["height"]) == (1920, 1080) and len(d["frames"]) == n_route
    for f in d["frames"]:
        for k in ("tractor", "driver", "trailer"):
            assert 0.0 <= f[k][0] <= 1.0 and 0.0 <= f[k][1] <= 1.0
    assert d["frames"][0]["status"] == "gate" and d["frames"][-1]["status"] == "docked"
    assert d["frames"][-1]["dist"] < 0.1
    assert set(d["cues"]) == {"truckCard", "cargoCard", "docked"}


@pytest.fixture(scope="module")
def route2(tmp_path_factory):
    p = tmp_path_factory.mktemp("route2") / "route.json"
    write_route(plan_route(phase=2), p)
    return p


@needs_blender
def test_scene_builds_phase2(route2, tmp_path):
    out = run_hero("--mode", "check", "--route", str(route2), "--out", str(tmp_path))
    assert "CHECK OK" in out.stdout, out.stdout[-2000:] + out.stderr[-2000:]
    assert "PHASE2 OK" in out.stdout, out.stdout[-1500:]


MIXAMO = ROOT / "assets" / "mixamo"
MIXAMO_CLIPS = ("idle", "walk", "scan", "pickup")


@needs_blender
def test_picker_without_mixamo(route2, tmp_path):
    import os
    empty = tmp_path / "no-mixamo"; empty.mkdir()
    out = subprocess.run([BLENDER, "-b", "--factory-startup", "-P", str(ROOT / "scene" / "hero.py"), "--",
                          "--mode", "check", "--route", str(route2), "--out", str(tmp_path)],
                         capture_output=True, text=True, timeout=300, env={**os.environ, "MIXAMO_DIR": str(empty)})
    assert "PICKER mannequin" in out.stdout, out.stdout[-1500:] + out.stderr[-1500:]


@needs_blender
@pytest.mark.skipif(not all((MIXAMO / f"{c}.fbx").exists() for c in MIXAMO_CLIPS), reason="faltan los FBX de Mixamo")
def test_picker_with_mixamo(route2, tmp_path):
    out = run_hero("--mode", "check", "--route", str(route2), "--out", str(tmp_path))
    assert "PICKER mixamo" in out.stdout, out.stdout[-1500:] + out.stderr[-1500:]
