#!/usr/bin/env bash
# Download OpenStreetMap road lines for the study area via the Overpass API.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p data/raw
ENDPOINT="${OVERPASS_URL:-https://overpass-api.de/api/interpreter}"
QUERY='[out:json][timeout:300];
way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|track|service)$"](42.55,142.90,42.98,143.34);
out geom tags;'
curl -sS -m 600 --data-urlencode "data=${QUERY}" "$ENDPOINT" -o data/raw/osm_roads.json
python3 -c "import json;d=json.load(open('data/raw/osm_roads.json'));print('ways:',len(d['elements']),'osm_base:',d['osm3s']['timestamp_osm_base'])"
