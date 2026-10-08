from PIL import Image

from post.composite import compose_frame, scan_progress, wipe_mask


def test_wipe_mask_extremes():
    assert wipe_mask(200, 100, 0.0).getextrema() == (0, 0)
    assert wipe_mask(200, 100, 1.0).getextrema() == (255, 255)


def test_wipe_mask_monotonic_and_feathered():
    m = wipe_mask(1000, 10, 0.5, feather_px=100)
    row = [m.getpixel((x, 5)) for x in range(1000)]
    assert all(b >= a for a, b in zip(row, row[1:])) or all(b <= a for a, b in zip(row, row[1:]))
    assert 0 < row[500] < 255


def test_compose_without_photo_is_post_only():
    tech = Image.new("RGB", (64, 36), (10, 10, 10))
    assert compose_frame(tech, None, 1.0).size == (64, 36)


def test_scan_progress_smoothstep_between_cues():
    assert scan_progress(10, 72, 120) == 0.0
    assert scan_progress(96, 72, 120) == 0.5
    assert scan_progress(130, 72, 120) == 1.0
