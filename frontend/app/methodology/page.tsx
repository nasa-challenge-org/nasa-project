export default function MethodologyPage() {
  return (
    <article className="prose prose-invert max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Methodology and sources</h1>
      <p className="text-slate-300">
        LunarEdge is a NASA Space Apps Challenge 2026 prototype. NASA does not
        endorse this project. Results are decision-support sketches, not flight
        products.
      </p>
      <h2 className="text-lg font-medium text-cyan-300">Programmatic sources</h2>
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
        <li>
          <a className="text-cyan-400" href="https://ssd-api.jpl.nasa.gov/doc/horizons.html">
            JPL Horizons API
          </a>{" "}
          — observer ephemerides for Sun and Earth (Member 4).
        </li>
        <li>
          <a className="text-cyan-400" href="https://pgda.gsfc.nasa.gov/products/78">
            NASA/GSFC LOLA 5 m/px south-pole site DEMs
          </a>{" "}
          — elevation and slope GeoTIFFs. Not ingested in this scaffold.
        </li>
      </ul>
      <h2 className="text-lg font-medium text-cyan-300">Exploration tools (not APIs)</h2>
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
        <li>
          <a className="text-cyan-400" href="https://trek.nasa.gov/moon/">
            NASA Moon Trek
          </a>
        </li>
        <li>
          <a className="text-cyan-400" href="https://quickmap.lroc.asu.edu/">
            LROC QuickMap
          </a>
        </li>
      </ul>
      <h2 className="text-lg font-medium text-cyan-300">Visibility labels</h2>
      <p className="text-sm text-slate-300">
        Geometric visibility uses Horizons elevation versus a local geometric
        horizon. Terrain-aware visibility additionally requires a verified LOLA
        horizon profile. Earth-centre visibility is not a communications link
        budget. Relative solar incidence is not electrical power.
      </p>
      <p className="text-sm text-slate-500">
        Observer coordinates in the catalogue are unverified. Null metrics mean
        not computed.
      </p>
    </article>
  );
}
