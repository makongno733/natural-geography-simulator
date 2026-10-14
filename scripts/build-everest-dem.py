"""Rebuild the teaching height grid from Copernicus DEM GLO-90 Public.

Requires Pillow. Usage: python3 scripts/build-everest-dem.py /path/to/source.tif
The source tile is Copernicus_DSM_COG_30_N27_00_E086_00_DEM.tif from
https://copernicus-dem-90m.s3.eu-central-1.amazonaws.com/
Copernicus_DSM_COG_30_N27_00_E086_00_DEM/
"""

import json
import sys
from pathlib import Path

from PIL import Image


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/build-everest-dem.py source.tif")

    source = Image.open(sys.argv[1])
    if source.size != (1200, 1200):
        raise ValueError(f"Unexpected GLO-90 tile dimensions: {source.size}")

    # The 1° tile is 86–87° E, 27–28° N, north at row zero.
    section = source.crop((900, 0, 1200, 300))
    section = section.resize((96, 96), Image.Resampling.BILINEAR)
    values = [round(float(value)) for value in section.getdata()]
    output = {
        "source": "Copernicus DEM GLO-90 Public (2021)",
        "sourceUrl": "https://registry.opendata.aws/copernicus-dem/",
        "tile": "Copernicus_DSM_COG_30_N27_00_E086_00_DEM",
        "bounds": [86.75, 27.75, 87, 28],
        "width": 96,
        "height": 96,
        "elevationMeters": values,
    }
    target = Path(__file__).resolve().parents[1] / "src/geo-labs/data/everest-dem.json"
    target.write_text(json.dumps(output, separators=(",", ":")))
    print(f"Wrote {target}; elevation range {min(values)}–{max(values)} m")


if __name__ == "__main__":
    main()
