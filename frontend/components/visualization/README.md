# Horizon viewer

Maps a **single API sample** onto a polar sky. The backend is authoritative.
This component does not compute ephemeris.

## Mapping (provisional)

JPL Horizons quantity 4 (Apparent azimuth and elevation), lunar surface
observer `CENTER=coord@301`, `COORD_TYPE=GEODETIC`.

- **Azimuth:** clockwise from north. North = up on the plot, east = right.
  Confirmed against Horizons observer-table labels in
  `backend/app/services/ephemeris_parser.py`.
- **Elevation:** airless apparent elevation vs the local topocentric horizon.
  Zenith is the plot centre. The solid ring is 0°. Negative elevation is drawn
  outside that ring (below geometric horizon).
- **Geometric visible:** elevation > 0°. **Terrain visible** stays N/A until a
  verified LOLA horizon profile exists. Unknown is not drawn as blocked.

The scene is **not to scale**. Markers are schematic.
