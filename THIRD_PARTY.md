# Third-party license inventory

Reviewed 2026-09-14 against original publisher license files. This inventory covers
identified direct frontend dependencies; it is not a complete transitive audit.
Copies of the license notices are in licenses/.

| Component | Version / source | License | Notice |
|---|---|---|---|
| Leaflet | 1.9.4, github.com/Leaflet/Leaflet | BSD-2-Clause | licenses/Leaflet.txt |
| React and ReactDOM | 18.3.1, github.com/facebook/react | MIT | licenses/React.txt |
| Babel standalone | 7.29.0, github.com/babel/babel | MIT (project license; bundled dependencies need separate audit) | licenses/Babel.txt |
| Assistant font | Google Fonts, ofl/assistant, retrieved 2026-09-14; live CSS is not version-pinned | OFL-1.1 | licenses/Assistant.txt |
| JetBrains Mono font | github.com/JetBrains/JetBrainsMono, notice retrieved 2026-09-14; live CSS is not version-pinned | OFL-1.1 | licenses/JetBrainsMono.txt |
| OSRM backend | github.com/Project-OSRM/osrm-backend, master license reference; actual upstream build version requires inventory | BSD-2-Clause | licenses/OSRM.txt |

These licenses permit commercial use subject to their obligations, including
preserving notices. This does not confer rights to unrelated hosted APIs, imagery,
voices or datasets. Inventory every new dependency and exact version before use.

## Service migration status

The policy applies immediately. Removal of CARTO/Esri and public routing fallback
is staged separately until operator-owned endpoints exist. The current live service
is not declared commercially cleared. GTFS, hosting, voice-provider terms and
transitive dependencies remain outstanding; see docs/open-services-migration.md
in the migration branch. Do not assign a license to user-authored code by inference.
