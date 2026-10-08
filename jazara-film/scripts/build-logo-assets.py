"""
Builds the logo assets used by the film from the supplied Jazara logo (logo-source.png):
  public/logo.png        - transparent logo, exact geometry + sampled turquoise
  public/logo-thin.png   - hairline centre-line of the same logo (the "travelling line")
  public/logo-order.png  - geodesic draw-order map (16-bit packed in R,G) so the real logo
                           ink can be revealed progressively along its own strokes
Run with a python that has numpy, scipy, scikit-image, pillow.
"""
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra
from skimage.morphology import skeletonize

SRC = sys.argv[1]
OUT = sys.argv[2]
START = (float(sys.argv[3]), float(sys.argv[4])) if len(sys.argv) > 4 else (124, 372)  # logo px (447 space)
S = 3
im = Image.open(SRC).convert('RGB')
N = 447 * S
im = im.resize((N, N), Image.LANCZOS)
a = np.array(im).astype(float)
al = np.clip((255 - a[..., 0]) / (255 - 80), 0, 1)
al = np.clip((al - 0.04) / 0.9, 0, 1)
al = al * al * (3 - 2 * al) * 0.35 + al * 0.65
TEAL = (79, 203, 205)
out = np.zeros((N, N, 4), np.uint8)
out[..., 0], out[..., 1], out[..., 2] = TEAL
out[..., 3] = (al * 255).astype(np.uint8)
Image.fromarray(out).save(f'{OUT}/logo.png')

ink = al > 0.18
lab, n = ndi.label(ink, structure=np.ones((3, 3)))
sizes = ndi.sum(ink, lab, range(1, n + 1))
print('components', n, sorted(sizes)[-4:])
ink = lab == (1 + int(np.argmax(sizes)))

# skeleton -> hairline
sk = skeletonize(ink)
d = ndi.distance_transform_edt(~sk)
thin = np.clip(1.0 - (d - 1.6) / 1.4, 0, 1)
t = np.zeros((N, N, 4), np.uint8)
t[..., 0], t[..., 1], t[..., 2] = TEAL
t[..., 3] = (thin * 255).astype(np.uint8)
Image.fromarray(t).save(f'{OUT}/logo-thin.png')

# geodesic order over ink pixels (dijkstra on 8-neighbour graph)
idx = -np.ones(ink.shape, np.int64)
ys, xs = np.nonzero(ink)
idx[ys, xs] = np.arange(len(ys))
rows, cols, w = [], [], []
for dy, dx in [(0, 1), (1, 0), (1, 1), (1, -1)]:
    y2, x2 = ys + dy, xs + dx
    ok = (y2 >= 0) & (y2 < N) & (x2 >= 0) & (x2 < N)
    y2o, x2o = y2[ok], x2[ok]
    j = idx[y2o, x2o]
    good = j >= 0
    i = idx[ys[ok][good], xs[ok][good]]
    rows.append(i); cols.append(j[good]); w.append(np.full(good.sum(), np.hypot(dy, dx)))
rows, cols, w = map(np.concatenate, (rows, cols, w))
g = coo_matrix((w, (rows, cols)), shape=(len(ys), len(ys))).tocsr()
g = g + g.T
sy, sx = START[1] * S, START[0] * S
k = int(np.argmin((ys - sy) ** 2 + (xs - sx) ** 2))
dist = dijkstra(g, indices=k)
dist[~np.isfinite(dist)] = 0
mx = dist.max()
e = int(np.argmax(dist))
print('start px(1x)', xs[k] / S, ys[k] / S, ' end px(1x)', xs[e] / S, ys[e] / S, ' maxdist', mx / S)
order = np.zeros((N, N))
order[ys, xs] = dist / mx
# propagate to antialiased fringe: nearest ink pixel
_, (iy, ix) = ndi.distance_transform_edt(~ink, return_indices=True)
order = order[iy, ix]
v = np.clip(np.round(order * 65535), 0, 65535).astype(np.uint32)
o = np.zeros((N, N, 3), np.uint8)
o[..., 0] = (v >> 8).astype(np.uint8)
o[..., 1] = (v & 255).astype(np.uint8)
Image.fromarray(o).save(f'{OUT}/logo-order.png')
json.dump({'start': [float(xs[k] / S), float(ys[k] / S)], 'end': [float(xs[e] / S), float(ys[e] / S)], 'maxdist': float(mx / S)},
          open(f'{OUT}/logo-order.json', 'w'))
