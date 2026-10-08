from pathlib import Path

from render.frames import remove_empty_frames, render_stamp


def test_remove_empty_frames_deletes_only_zero_byte_pngs(tmp_path: Path):
    (tmp_path / "f_0001.png").write_bytes(b"\x89PNG data")
    (tmp_path / "f_0003.png").write_bytes(b"")          # placeholder de un render cortado
    (tmp_path / "notes.txt").write_bytes(b"")
    assert remove_empty_frames(tmp_path) == 1
    assert sorted(p.name for p in tmp_path.iterdir()) == ["f_0001.png", "notes.txt"]


def test_remove_empty_frames_missing_dir_is_noop(tmp_path: Path):
    assert remove_empty_frames(tmp_path / "nope") == 0


def test_render_stamp_changes_with_sources_and_params(tmp_path: Path):
    src = tmp_path / "scene.py"; src.write_text("a = 1")
    s1 = render_stamp([src], {"res": "960x540", "step": 2})
    assert s1 == render_stamp([src], {"step": 2, "res": "960x540"})
    src.write_text("a = 2")
    s2 = render_stamp([src], {"res": "960x540", "step": 2})
    assert s2 != s1
    assert render_stamp([src], {"res": "1920x1080", "step": 2}) != s2
