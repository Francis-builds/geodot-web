"""Tractor sleeper + semirremolque 53' (port del spike).

Origen del camión = trasera del tráiler, centro, piso; avanza hacia -Y local.
Jerarquía: <name> (tráiler) -> <name>_piv (perno rey, rota con `art`)
-> <name>_piv_steerL / _steerR (pivotes de dirección de las ruedas delanteras).
La cabina, el capó y el deflector usan un bevel ancho de varios segmentos:
redondea como un tractor aerodinámico sin perder la silueta (ver ledger, Task 4).
"""
import math

from kit.primitives import box, cyl, empty, prism

# ---------- ruedas ----------
def wheel(p, col, x, y, outer_sign, r=0.52, w=0.28):
    cyl("tire", r, w, (x, y, r), col, p, axis="x", seg=40, bev=0.06)
    rx = x + outer_sign * 0.01
    cyl("rim", r * 0.6, w + 0.02, (rx, y, r), col, p, axis="x", seg=28)
    cyl("hub", r * 0.24, w + 0.08, (rx, y, r), col, p, axis="x", seg=16)
    for k in range(10):
        a = k * math.tau / 10
        cyl("lug", 0.022, w + 0.1, (rx, y + math.cos(a) * r * 0.38, r + math.sin(a) * r * 0.38), col, p, axis="x", seg=8)

def dual_axle(p, col, y, track_in=0.80, track_out=1.12):
    cyl("axle", 0.07, 2.2, (0, y, 0.52), col, p, axis="x", seg=12)
    for s in (-1, 1):
        wheel(p, col, s * track_in, y, s)
        wheel(p, col, s * track_out, y, s)

# ---------- tráiler 53' (origen = trasera, centro, piso; avanza hacia -Y) ----------
L, W, Z0, Z1 = 16.15, 2.6, 1.3, 4.1

def trailer(col, p):
    H = Z1 - Z0
    zc = (Z0 + Z1) / 2
    box("body", (W, L, H), (0, -L / 2, zc), col, p, bev=0.035)
    posts = [-0.55 - i * 1.22 for i in range(13)]
    for y in posts:
        for s in (-1, 1):
            box("post", (0.05, 0.09, H - 0.1), (s * (W / 2 + 0.02), y, zc), col, p)
        box("bow", (W - 0.1, 0.06, 0.025), (0, y, Z1 + 0.012), col, p)
    for s in (-1, 1):
        box("toprail", (0.07, L, 0.12), (s * (W / 2 + 0.03), -L / 2, Z1 - 0.06), col, p)
        box("botrail", (0.09, L, 0.26), (s * (W / 2 + 0.035), -L / 2, Z0 + 0.13), col, p)
        box("skirt", (0.03, 6.2, 0.55), (s * 1.27, -7.9, 0.98), col, p, bev=0.01)
        box("rpost", (0.13, 0.15, H + 0.1), (s * 1.29, 0.06, zc), col, p)
        box("door", (1.22, 0.04, H - 0.2), (s * 0.63, 0.07, zc), col, p, bev=0.01)
        for z in (Z0 + 0.4, Z0 + 1.1, Z0 + 1.8, Z0 + 2.4):
            box("hinge", (0.14, 0.07, 0.1), (s * 1.22, 0.13, z), col, p)
        for x in (0.25, 1.0):
            cyl("lockrod", 0.025, H - 0.25, (s * x, 0.12, zc), col, p, seg=10)
            box("handle", (0.05, 0.06, 0.35), (s * x, 0.16, Z0 + 1.2), col, p)
        box("mudflap", (0.62, 0.02, 0.62), (s * 0.96, -0.45, 0.62), col, p)
        box("lgleg", (0.13, 0.13, 1.0), (s * 0.95, -12.6, 0.82), col, p)
        box("lgfoot", (0.3, 0.3, 0.05), (s * 0.95, -12.6, 0.3), col, p)
        box("slider", (0.1, 6.0, 0.26), (s * 0.45, -3.4, 1.15), col, p)
    box("header", (2.7, 0.15, 0.26), (0, 0.06, Z1 - 0.05), col, p)
    box("sill", (2.7, 0.17, 0.22), (0, 0.07, Z0 + 0.05), col, p)
    box("icc", (2.4, 0.13, 0.15), (0, 0.27, 0.55), col, p, bev=0.02)
    for s in (-1, 1):
        box("iccstrut", (0.08, 0.08, 0.75), (s * 0.8, 0.16, 0.92), col, p)
    cyl("lgbrace", 0.03, 1.9, (0, -12.6, 0.75), col, p, axis="x", seg=8)
    for y in (-1.55, -2.85):
        dual_axle(p, col, y)

# ---------- tractor sleeper (pivote en el kingpin) ----------
def tractor(col, p):
    # coordenadas del tráiler -> locales al pivote; cabina y frente 0.9 m más
    # adelante para dejar el hueco cabina-caja que permite articular
    o = lambda y: y + 14.95 - (0.9 if y < -15.9 else 0.0)
    for s in (-1, 1):
        box("rail", (0.1, 8.9, 0.3), (s * 0.45, o(-17.0), 1.0), col, p)
        box("qfender", (0.62, 2.7, 0.05), (s * 0.97, o(-14.75), 1.12), col, p, bev=0.02)
        box("extender", (0.04, 0.6, 2.4), (s * 1.24, o(-16.0), 2.6), col, p)
        box("sidewin", (0.02, 0.9, 0.7), (s * 1.235, o(-18.6), 3.2), col, p, bev=0.01)
        box("door", (0.02, 1.15, 1.7), (s * 1.24, o(-18.55), 2.35), col, p, bev=0.01)
        box("ffender", (0.42, 1.35, 0.12), (s * 1.06, o(-20.3), 1.48), col, p, bev=0.04)
        box("hlamp", (0.36, 0.08, 0.18), (s * 0.82, o(-21.24), 1.55), col, p, bev=0.01)
        cyl("tank", 0.33, 1.6, (s * 1.08, o(-17.6), 0.82), col, p, axis="y", seg=32)
        for y in (-17.05, -18.15):
            cyl("strap", 0.345, 0.06, (s * 1.08, o(y), 0.82), col, p, axis="y", seg=32)
        for z in (0.55, 0.95):
            box("step", (0.36, 0.5, 0.04), (s * 1.26, o(-18.6), z), col, p)
        cyl("stack", 0.09, 3.1, (s * 1.18, o(-16.15), 2.65), col, p, seg=16)
        box("heatshield", (0.05, 0.2, 1.0), (s * 1.28, o(-16.15), 2.4), col, p)
        cyl("aircleaner", 0.2, 1.1, (s * 1.2, o(-19.35), 2.1), col, p, seg=20)
        cyl("mirrorarm", 0.02, 0.45, (s * 1.42, o(-19.05), 2.95), col, p, axis="x", seg=8)
        box("mirror", (0.08, 0.14, 0.5), (s * 1.62, o(-19.05), 2.95), col, p, bev=0.01)
        # rueda delantera bajo su propio pivote de dirección (eje vertical en el centro de la rueda)
        st = empty(f"{p.name}_steer{'L' if s < 0 else 'R'}", col, (s * 1.04, o(-20.3), 0), parent=p)
        wheel(st, col, 0, 0, s)
    for y in (-14.15, -15.45):
        dual_axle(p, col, o(y))
    cyl("fifthwheel", 0.85, 0.1, (0, 0, 1.24), col, p, seg=40)
    box("fwslot", (0.2, 0.7, 0.12), (0, 0.45, 1.25), col, p)
    box("deck", (1.4, 0.9, 0.04), (0, o(-16.0), 1.2), col, p)
    box("cab", (2.45, 2.9, 2.75), (0, o(-17.7), 2.525), col, p, bev=0.38, seg=5)
    prism("fairing", (2.3, 4.25), (2.1, 3.92), o(-16.3), o(-18.9), 3.88, col, p, bev=0.22, seg=4)
    box("windshield", (2.15, 0.05, 0.92), (0, o(-19.18), 3.25), col, p, bev=0.01, rot=(math.radians(-14), 0, 0))
    box("wsbar", (0.06, 0.07, 0.95), (0, o(-19.2), 3.25), col, p, rot=(math.radians(-14), 0, 0))
    prism("hood", (2.2, 2.38), (1.86, 2.08), o(-19.1), o(-21.3), 1.02, col, p, bev=0.3, seg=5)
    box("grille", (1.3, 0.05, 0.85), (0, o(-21.32), 1.6), col, p, bev=0.01)
    for k in range(7):
        box("slat", (1.24, 0.04, 0.03), (0, o(-21.36), 1.25 + k * 0.11), col, p)
    box("bumper", (2.5, 0.35, 0.36), (0, o(-21.5), 0.85), col, p, bev=0.06)
    cyl("horn", 0.05, 0.6, (0.4, o(-17.0), 4.0), col, p, axis="y", seg=10)

def truck(col, name, x, y, yaw=0.0, art=0.0, with_tractor=True):
    root = empty(name, col, (x, y, 0), yaw)
    trailer(col, root)
    if with_tractor:
        piv = empty(name + "_piv", col, (0, -14.95, 0), art, root)
        tractor(col, piv)
    return root

