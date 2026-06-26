from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[1]
ICON_PATH = ROOT / "apps" / "desktop" / "src-tauri" / "icons" / "icon.ico"


def bgra(r: int, g: int, b: int, a: int = 255) -> bytes:
    return bytes((b, g, r, a))


def build_icon(size: int = 32) -> bytes:
    width = size
    height = size
    pixels = bytearray()

    # DIB pixels are stored bottom-up.
    for y in reversed(range(height)):
        for x in range(width):
            border = x in (0, width - 1) or y in (0, height - 1)
            if border:
                pixels.extend(bgra(143, 183, 255, 255))
            elif 8 <= x <= 23 and 8 <= y <= 23:
                pixels.extend(bgra(22, 31, 48, 255))
            else:
                pixels.extend(bgra(8, 11, 16, 255))

    and_mask_stride = ((width + 31) // 32) * 4
    and_mask = bytes(and_mask_stride * height)

    # BITMAPINFOHEADER. ICO DIB height is color height + mask height.
    dib_header = struct.pack(
        "<IIIHHIIIIII",
        40,
        width,
        height * 2,
        1,
        32,
        0,
        len(pixels) + len(and_mask),
        0,
        0,
        0,
        0,
    )
    image = dib_header + bytes(pixels) + and_mask

    icon_header = struct.pack("<HHH", 0, 1, 1)
    directory_entry = struct.pack(
        "<BBBBHHII",
        width,
        height,
        0,
        0,
        1,
        32,
        len(image),
        len(icon_header) + 16,
    )
    return icon_header + directory_entry + image


def main() -> None:
    ICON_PATH.parent.mkdir(parents=True, exist_ok=True)
    ICON_PATH.write_bytes(build_icon())
    print(f"wrote {ICON_PATH}")


if __name__ == "__main__":
    main()
