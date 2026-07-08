import math
import os
import json
import textwrap
from io import BytesIO

import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter


OUT_DIR = os.path.abspath(".")
OUT_PATH = os.path.join(OUT_DIR, "甘南自驾路书地图_7月18-26.png")
ROUTE_CACHE_PATH = os.path.join(OUT_DIR, "甘南自驾路书_OSRM驾车路线缓存.json")

W, H = 3000, 2000
MAP_W, MAP_H = 2050, 1820
MAP_X, MAP_Y = 70, 115
PANEL_X, PANEL_Y = 2160, 115
PANEL_W, PANEL_H = 770, 1820
ZOOM = 8
TILE = 256


def font(size, weight="Regular"):
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size, index=0)
            except Exception:
                pass
    return ImageFont.load_default()


F_TITLE = font(58)
F_SUB = font(28)
F_DAY = font(30)
F_TEXT = font(22)
F_SMALL = font(18)
F_NUM = font(19)
F_LABEL = font(26)


days = [
    ("D1", "7/18", [
        ("兰州中川国际机场", 36.5152, 103.6208),
        ("甘肃省博物馆", 36.0660, 103.7549),
        ("中山桥", 36.0710, 103.8190),
        ("全季酒店(兰州张掖路省政府地铁站店)", 36.0620, 103.8250),
    ]),
    ("D2", "7/19", [
        ("全季酒店(兰州张掖路省政府地铁站店)", 36.0620, 103.8250),
        ("美仁大草原", 35.0300, 103.1800),
        ("安多合作米拉日巴佛阁", 34.9860, 102.9110),
        ("卓尼扎古录大酒店", 34.6100, 103.0500),
    ]),
    ("D3", "7/20", [
        ("卓尼扎古录大酒店", 34.6100, 103.0500),
        ("达日观景台", 34.4300, 103.2100),
        ("云端山舍·全域日出观景民宿(扎尕那达日观景台店)", 34.2060, 103.2210),
    ]),
    ("D4", "7/21", [
        ("云端山舍·全域日出观景民宿(扎尕那达日观景台店)", 34.2060, 103.2210),
        ("扎尕那仙女滩", 34.2160, 103.2180),
        ("格尔底寺", 34.0900, 102.6420),
        ("纳摩大峡谷", 34.1000, 102.6400),
        ("郎木寺庚盼民宿(白龙江峡谷店)", 34.0870, 102.6360),
    ]),
    ("D5", "7/22", [
        ("郎木寺庚盼民宿(白龙江峡谷店)", 34.0870, 102.6360),
        ("花湖湿地", 33.9500, 102.8730),
        ("黄河九曲第一湾", 33.5860, 102.4800),
        ("朵兰达V酒店(阿坝县店)", 32.9046, 101.7026),
    ]),
    ("D6", "7/23", [
        ("朵兰达V酒店(阿坝县店)", 32.9046, 101.7026),
        ("莲宝叶则景区", 32.9850, 101.7900),
        ("各莫寺", 33.0100, 101.7800),
        ("久治玉宫酒店", 33.4300, 101.4840),
    ]),
    ("D7", "7/24", [
        ("久治玉宫酒店", 33.4300, 101.4840),
        ("娘玛寺", 33.6650, 101.9750),
        ("阿万仓湿地", 33.6600, 101.9800),
        ("郭莽湿地", 34.2300, 102.3800),
        ("桑科草原", 35.0300, 102.4400),
        ("夏河蓝庭雅居酒店", 35.2040, 102.5210),
    ]),
    ("D8", "7/25", [
        ("夏河蓝庭雅居酒店", 35.2040, 102.5210),
        ("拉卜楞寺", 35.1980, 102.5080),
        ("甘加秘境", 35.4500, 102.6400),
        ("临夏八坊十三巷美仑酒店", 35.6040, 103.2120),
    ]),
    ("D9", "7/26", [
        ("临夏八坊十三巷美仑酒店", 35.6040, 103.2120),
        ("黄洮交汇观景平台", 35.9180, 103.2860),
        ("兰州中川国际机场 T3 航站楼", 36.5152, 103.6208),
    ]),
]

day_colors = {
    "D1": "#3B82F6",
    "D2": "#10B981",
    "D3": "#F59E0B",
    "D4": "#EF4444",
    "D5": "#8B5CF6",
    "D6": "#06B6D4",
    "D7": "#84CC16",
    "D8": "#F97316",
    "D9": "#64748B",
}

amap_metrics = {
    "D1": {"distance_m": 75933, "duration_s": 5289},
    "D2": {"distance_m": 307207, "duration_s": 14828},
    "D3": {"distance_m": 142678, "duration_s": 14600},
    "D4": {"distance_m": 104801, "duration_s": 9366},
    "D5": {"distance_m": 291055, "duration_s": 19946},
    "D6": {"distance_m": 134332, "duration_s": 10289},
    "D7": {"distance_m": 336587, "duration_s": 19549},
    "D8": {"distance_m": 166973, "duration_s": 10470},
    "D9": {"distance_m": 153281, "duration_s": 10399},
}


def format_km(distance_m):
    return f"{distance_m / 1000:.1f}km"


def format_duration(seconds):
    hours = int(seconds // 3600)
    minutes = int(((seconds % 3600) + 30) // 60)
    if minutes == 60:
        hours += 1
        minutes = 0
    return f"{hours}h{minutes:02d}m"


def total_amap_metrics():
    distance = sum(item["distance_m"] for item in amap_metrics.values())
    duration = sum(item["duration_s"] for item in amap_metrics.values())
    return distance, duration


def lonlat_to_world(lon, lat, z=ZOOM):
    lat_rad = math.radians(lat)
    n = 2 ** z * TILE
    x = (lon + 180.0) / 360.0 * n
    y = (1.0 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2.0 * n
    return x, y


def point_bbox(points, padding_px=160):
    xs, ys = zip(*(lonlat_to_world(lon, lat) for _, lat, lon in points))
    minx, maxx = min(xs) - padding_px, max(xs) + padding_px
    miny, maxy = min(ys) - padding_px, max(ys) + padding_px
    bbox_w, bbox_h = maxx - minx, maxy - miny
    target_ratio = MAP_W / MAP_H
    if bbox_w / bbox_h > target_ratio:
        extra = bbox_w / target_ratio - bbox_h
        miny -= extra / 2
        maxy += extra / 2
    else:
        extra = bbox_h * target_ratio - bbox_w
        minx -= extra / 2
        maxx += extra / 2
    return minx, miny, maxx, maxy


def download_tile(x, y, z=ZOOM):
    cache_dir = os.path.join(OUT_DIR, ".tile_cache", str(z), str(x))
    os.makedirs(cache_dir, exist_ok=True)
    cache_path = os.path.join(cache_dir, f"{y}.png")
    if os.path.exists(cache_path):
        return Image.open(cache_path).convert("RGB")
    url = f"https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
    headers = {"User-Agent": "Codex personal travel route map"}
    r = requests.get(url, headers=headers, timeout=20)
    r.raise_for_status()
    im = Image.open(BytesIO(r.content)).convert("RGB")
    im.save(cache_path)
    return im


def make_map(points):
    minx, miny, maxx, maxy = point_bbox(points)
    tx0, ty0 = math.floor(minx / TILE), math.floor(miny / TILE)
    tx1, ty1 = math.floor(maxx / TILE), math.floor(maxy / TILE)
    mosaic = Image.new("RGB", ((tx1 - tx0 + 1) * TILE, (ty1 - ty0 + 1) * TILE), "#f5f5f2")
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            try:
                tile = download_tile(tx, ty)
            except Exception:
                tile = Image.new("RGB", (TILE, TILE), "#f5f5f2")
            mosaic.paste(tile, ((tx - tx0) * TILE, (ty - ty0) * TILE))
    crop = (
        int(minx - tx0 * TILE),
        int(miny - ty0 * TILE),
        int(maxx - tx0 * TILE),
        int(maxy - ty0 * TILE),
    )
    cropped = mosaic.crop(crop).resize((MAP_W, MAP_H), Image.LANCZOS)
    overlay = Image.new("RGBA", cropped.size, (255, 255, 255, 38))
    cropped = Image.alpha_composite(cropped.convert("RGBA"), overlay)

    def project(lat, lon):
        wx, wy = lonlat_to_world(lon, lat)
        return ((wx - minx) / (maxx - minx) * MAP_W, (wy - miny) / (maxy - miny) * MAP_H)

    return cropped, project


def all_route_stops():
    stops = []
    for _, _, items in days:
        stops.extend(items)
    return stops


def route_key(a, b):
    return "|".join([
        a[0],
        f"{a[2]:.5f},{a[1]:.5f}",
        b[0],
        f"{b[2]:.5f},{b[1]:.5f}",
    ])


def fetch_driving_route(a, b, cache):
    key = route_key(a, b)
    if key in cache:
        return cache[key]

    _, a_lat, a_lon = a
    _, b_lat, b_lon = b
    coord_string = f"{a_lon},{a_lat};{b_lon},{b_lat}"
    url = f"https://router.project-osrm.org/route/v1/driving/{coord_string}"
    params = {
        "overview": "full",
        "geometries": "geojson",
        "alternatives": "false",
        "steps": "false",
    }
    headers = {"User-Agent": "Codex personal travel route map"}
    try:
        r = requests.get(url, params=params, headers=headers, timeout=30)
        r.raise_for_status()
        data = r.json()
        if data.get("code") != "Ok" or not data.get("routes"):
            raise ValueError(data.get("message", "OSRM route not found"))
        route = data["routes"][0]
        coords = route["geometry"]["coordinates"]
        cache[key] = {
            "coordinates": coords,
            "distance_m": route.get("distance"),
            "duration_s": route.get("duration"),
            "source": "osrm",
        }
    except Exception as exc:
        # Keep the map complete even when one remote route segment is unavailable.
        cache[key] = {
            "coordinates": [[a_lon, a_lat], [b_lon, b_lat]],
            "distance_m": None,
            "duration_s": None,
            "source": f"fallback_straight: {exc}",
        }
    with open(ROUTE_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
    return cache[key]


def load_driving_routes():
    if os.path.exists(ROUTE_CACHE_PATH):
        with open(ROUTE_CACHE_PATH, "r", encoding="utf-8") as f:
            cache = json.load(f)
    else:
        cache = {}
    routes = []
    stops = all_route_stops()
    for i in range(len(stops) - 1):
        current_day = next(day for day, _, items in days if stops[i] in items)
        route = fetch_driving_route(stops[i], stops[i + 1], cache)
        routes.append((current_day, stops[i], stops[i + 1], route))
    return routes


def rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_shadow(base, xy, radius=28, alpha=80, blur=18):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle(xy, radius=radius, fill=(0, 0, 0, alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)


def wrapped_lines(text, width_chars):
    lines = []
    for part in text.split("\n"):
        lines.extend(textwrap.wrap(part, width=width_chars, break_long_words=False) or [""])
    return lines


def draw_route(draw, project, driving_routes):
    all_index = 1
    point_records = []
    for day, start, end, route in driving_routes:
        color = day_colors[day]
        pts = [project(lat, lon) for lon, lat in route["coordinates"]]
        if len(pts) > 1:
            for width, shade in [(13, "#ffffff"), (8, color)]:
                draw.line(pts, fill=shade, width=width, joint="curve")

    for day, date, items in days:
        color = day_colors[day]
        for name, lat, lon in items:
            x, y = project(lat, lon)
            point_records.append((all_index, day, date, name, x, y, color))
            all_index += 1

    # Draw points after all route segments so numbers stay readable.
    for idx, day, date, name, x, y, color in point_records:
        r = 17 if idx < 10 else 19
        draw.ellipse((x - r - 3, y - r - 3, x + r + 3, y + r + 3), fill="#ffffff")
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)
        txt = str(idx)
        b = draw.textbbox((0, 0), txt, font=F_NUM)
        draw.text((x - (b[2] - b[0]) / 2, y - (b[3] - b[1]) / 2 - 1), txt, fill="white", font=F_NUM)

    labels = [
        ("兰州中川机场", 36.5152, 103.6208, 18, -38),
        ("兰州市", 36.0611, 103.8343, 22, -5),
        ("美仁大草原", 35.0300, 103.1800, 20, -38),
        ("合作", 34.9860, 102.9110, -70, -35),
        ("扎古录", 34.6100, 103.0500, -82, 10),
        ("扎尕那", 34.2180, 103.2240, 18, 0),
        ("郎木寺", 34.0870, 102.6360, -100, -20),
        ("唐克", 33.5630, 102.4840, 20, 6),
        ("阿坝", 32.9020, 101.7060, 18, 0),
        ("夏河", 35.2040, 102.5210, -76, -38),
        ("临夏", 35.6040, 103.2120, 18, 0),
    ]
    for label, lat, lon, dx, dy in labels:
        x, y = project(lat, lon)
        x += dx
        y += dy
        b = draw.textbbox((x, y), label, font=F_LABEL)
        pad = 8
        draw.rounded_rectangle((b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad), radius=10, fill=(255, 255, 255, 220))
        draw.text((x, y), label, fill="#111827", font=F_LABEL)


def draw_panel(draw):
    x, y = PANEL_X + 28, PANEL_Y + 28
    draw.text((x, y), "每日路书", fill="#111827", font=F_TITLE)
    y += 70
    total_distance, total_duration = total_amap_metrics()
    draw.text(
        (x, y),
        f"7/18-7/26 · 高德实算总计 {format_km(total_distance)} / {format_duration(total_duration)}",
        fill="#475569",
        font=F_SUB,
    )
    y += 50
    idx = 1
    short_names = {
        "全季酒店(兰州张掖路省政府地铁站店)": "全季酒店(张掖路)",
        "云端山舍·全域日出观景民宿(扎尕那达日观景台店)": "云端山舍",
        "郎木寺庚盼民宿(白龙江峡谷店)": "郎木寺庚盼民宿",
        "朵兰达V酒店(阿坝县店)": "朵兰达V酒店",
        "临夏八坊十三巷美仑酒店": "临夏美仑酒店",
        "兰州中川国际机场 T3 航站楼": "中川机场T3",
    }
    for day, date, items in days:
        color = day_colors[day]
        metric = amap_metrics.get(day)
        metric_text = ""
        if metric:
            metric_text = f"{format_km(metric['distance_m'])} / {format_duration(metric['duration_s'])}"
        card_h = 64 + 22 * len(items)
        rounded_rect(draw, (PANEL_X + 24, y - 10, PANEL_X + PANEL_W - 24, y + card_h), 18, "#ffffff", "#e5e7eb", 1)
        draw.rounded_rectangle((x, y, x + 82, y + 34), radius=17, fill=color)
        draw.text((x + 15, y + 3), day, fill="white", font=F_DAY)
        draw.text((x + 96, y + 5), date, fill="#334155", font=F_DAY)
        draw.text((x + 185, y + 9), metric_text, fill="#0f766e", font=F_TEXT)
        yy = y + 50
        for name, lat, lon in items:
            label = f"{idx}. {short_names.get(name, name)}"
            draw.text((x + 8, yy), label, fill="#111827", font=F_SMALL)
            yy += 22
            idx += 1
        y += card_h + 12


def main():
    all_points = [p for _, _, items in days for p in items]
    driving_routes = load_driving_routes()
    base = Image.new("RGBA", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(base)

    draw.text((70, 38), "甘南自驾路书地图", fill="#0f172a", font=F_TITLE)
    total_distance, total_duration = total_amap_metrics()
    draw.text(
        (620, 55),
        f"杭州 → 兰州中川机场｜7月18日-26日｜高德参考 {format_km(total_distance)} / {format_duration(total_duration)}",
        fill="#475569",
        font=F_SUB,
    )

    draw_shadow(base, (MAP_X, MAP_Y, MAP_X + MAP_W, MAP_Y + MAP_H), radius=32, alpha=45, blur=20)
    map_img, project = make_map(all_points)
    mask = Image.new("L", (MAP_W, MAP_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, MAP_W, MAP_H), radius=32, fill=255)
    base.paste(map_img, (MAP_X, MAP_Y), mask)

    map_layer = Image.new("RGBA", (MAP_W, MAP_H), (0, 0, 0, 0))
    md = ImageDraw.Draw(map_layer)
    draw_route(md, project, driving_routes)
    base.alpha_composite(map_layer, (MAP_X, MAP_Y))

    # Subtle map frame and scale note.
    draw.rounded_rectangle((MAP_X, MAP_Y, MAP_X + MAP_W, MAP_Y + MAP_H), radius=32, outline="#CBD5E1", width=2)
    draw.rounded_rectangle((MAP_X + 30, MAP_Y + MAP_H - 72, MAP_X + 835, MAP_Y + MAP_H - 25), radius=14, fill=(255, 255, 255, 225))
    draw.text((MAP_X + 48, MAP_Y + MAP_H - 62), "里程/时长：高德JSAPI；底图/轨迹：CARTO/OSM + OSRM，部分点位为近似点", fill="#475569", font=F_SMALL)

    draw_shadow(base, (PANEL_X, PANEL_Y, PANEL_X + PANEL_W, PANEL_Y + PANEL_H), radius=32, alpha=45, blur=20)
    rounded_rect(draw, (PANEL_X, PANEL_Y, PANEL_X + PANEL_W, PANEL_Y + PANEL_H), 32, "#F1F5F9", "#CBD5E1", 2)
    draw_panel(draw)

    base.convert("RGB").save(OUT_PATH, quality=95)
    print(OUT_PATH)


if __name__ == "__main__":
    main()
