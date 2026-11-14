import { DASHBOARD_METRICS } from "@/lib/metrics";

export default function MethodologyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 text-slate-300">
      <p>
        LunarEdge compares lunar south-pole site and date windows using JPL
        Horizons Sun/Earth observer geometry and NASA/GSFC LOLA site DEMs. NASA
        does not endorse this project. Results are not landing certification,
        comms link budgets, or spacecraft power forecasts.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-cyan-300">What we compute</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          {DASHBOARD_METRICS.map((metric) => (
            <li key={metric.key}>
              <span className="text-slate-100">{metric.label}</span>
              {metric.unit ? ` (${metric.unit})` : ""} — {metric.quality}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-cyan-300">
          Programmatic sources
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>
            <a
              className="text-cyan-400 underline-offset-2 hover:underline"
              href="https://ssd-api.jpl.nasa.gov/doc/horizons.html"
            >
              JPL Horizons API
            </a>{" "}
            — observer ephemerides for Sun and Earth. Manual:{" "}
            <a
              className="text-cyan-400 underline-offset-2 hover:underline"
              href="https://ssd.jpl.nasa.gov/horizons/manual.html"
            >
              Horizons manual
            </a>
            .
          </li>
          <li>
            <a
              className="text-cyan-400 underline-offset-2 hover:underline"
              href="https://pgda.gsfc.nasa.gov/products/78"
            >
              NASA/GSFC LOLA 5 m/px south-pole site DEMs
            </a>{" "}
            — elevation and slope GeoTIFFs. Terrain-aware flags stay unknown
            until a coordinate transform is verified.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-cyan-300">
          Exploration tools (not queried by this app)
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>
            <a
              className="text-cyan-400 underline-offset-2 hover:underline"
              href="https://trek.nasa.gov/moon/"
            >
              NASA Moon Trek
            </a>
          </li>
          <li>
            <a
              className="text-cyan-400 underline-offset-2 hover:underline"
              href="https://quickmap.lroc.asu.edu/"
            >
              LROC QuickMap
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-cyan-300">How to read results</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Times are UTC with a Z suffix.</li>
          <li>Null means not computed. The UI shows N/A and never substitutes 0.</li>
          <li>
            Geometric visibility is Horizons elevation versus a smooth local
            horizon. Unknown is not blocked.
          </li>
          <li>
            Catalogue coordinates stay unverified until a documented GSFC
            transform exists.
          </li>
          <li>
            DEMO / MOCK fixtures are labelled and are not NASA measurements.
          </li>
        </ul>
      </section>
    </article>
  );
}
