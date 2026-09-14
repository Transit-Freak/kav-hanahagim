# Open service migration — prepared, not deployed

2026-09-14. The live site is not changed by this draft.

Changes: remove CARTO raster tiles and Esri imagery/labels; retain Leaflet and all
route overlays. Remove the satellite toggle. Remove implicit public OSRM fallback.
Ready-made route instructions from the existing feed still work. Manual GTFS
live instruction generation requires the configured operator OSRM endpoint.
Dark mode dims only the raster pane. No new map library is introduced.

## Deployment requirements

1. Provision an operator-owned raster tile service built from openly licensed OSM
   data and an open renderer, e.g. a renderd/mod_tile deployment with openstreetmap-carto.
   Review and retain each renderer/style/data license and attribution. Do not copy
   tiles from CARTO, Esri, or public OSM tile servers into this service.
2. Configure tilesUrl and maxNativeZoom in services.js. Use HTTPS and correct CORS
   when applicable. Include all required style/data credits in attribution.
3. Provision OSRM from its BSD-licensed source, load an OSM extract, configure HTTPS,
   rate limits and CORS; set osrmUrl. Use operator infrastructure, not a public demo.
   The upstream feed generator already has a separate OSRM deployment; browser access
   to it has not been established and it is not assumed to be publicly reachable.
4. Verify tile loading in Israel, Hebrew labels, night mode, stop/route overlay,
   recentering and a manual GTFS request. Verify normal prepared feed instructions.
5. Run node --test tests/*.test.cjs and compile JSX before merging the draft.

No server/account was purchased or provisioned. Empty configuration deliberately
makes no requests and reports a missing background; it is not a production replacement.

## Unresolved rights

GTFS feed-specific license, existing speech voice provider terms and production
hosting eligibility still require separate confirmation. Browser speechSynthesis is
an API, not a license to redistribute every installed voice or recording. UNPKG and
Google Fonts delivery services have their own terms beyond the code/font licenses.
The dependency policy is not a legal opinion or a complete transitive SBOM.

Sources:
- https://carto.com/legal/basemap-terms/ (section 14)
- https://www.openstreetmap.org/copyright
- https://github.com/Project-OSRM/osrm-backend/blob/master/LICENSE.TXT
- https://switch2osm.org/serving-tiles/
