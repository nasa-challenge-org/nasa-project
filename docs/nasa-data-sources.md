# NASA data sources

Do not scrape Moon Trek or QuickMap UIs. Do not treat this app as NASA-certified.

| Resource | Role | URL |
| --- | --- | --- |
| JPL Horizons API | Observer ephemerides for Sun (10) and Earth (399) | https://ssd.jpl.nasa.gov/api/horizons.api |
| Horizons API docs | Query parameters | https://ssd-api.jpl.nasa.gov/doc/horizons.html |
| Horizons manual | Observer tables, surface targets | https://ssd.jpl.nasa.gov/horizons/manual.html |
| Horizons web UI | Manual cross-check | https://ssd.jpl.nasa.gov/horizons/app.html |
| GSFC LOLA 5 m/px site DEMs | Elevation, slope, uncertainty GeoTIFFs | https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/ |
| GSFC product 78 | Catalogue and citations | https://pgda.gsfc.nasa.gov/products/78 |
| South-pole mosaic | Large regional DEM; do not download first | https://pgda.gsfc.nasa.gov/products/81 |
| Moon Trek | Manual terrain/illumination exploration | https://trek.nasa.gov/moon/ |
| LROC QuickMap | Imagery/context | https://quickmap.lroc.asu.edu/ |

## Catalogue sites in this repo

Named from the GSFC LOLA 5 m/px landing-site collection (Mazarico et al. 2011 numbering on the product page):

- Site01 Connecting ridge
- Site04 Shackleton rim
- Site07 Peak near Shackleton
- Site11 de Gerlache rim
- Site20 Leibnitz beta plateau
- Site23 Malapert massif

**Observer latitude, longitude, and altitude are not stored as verified values.** DEM product filenames and source URLs are stored. Member 4 must fill coordinates after reading each product README / GeoTIFF metadata / ROI shapefile.

## Citations to include in the demo

- JPL Horizons / Solar System Dynamics
- Barker et al., 2021, *Improved LOLA Elevation Maps for South Pole Landing Sites*, Planetary & Space Science 203, 105119
- Mazarico et al., 2011, *Illumination conditions of the lunar polar regions using LOLA topography*, Icarus 211, 1066–1081

NASA does not endorse LunarEdge.
