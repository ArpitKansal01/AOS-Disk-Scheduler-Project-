import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  Cpu,
  Download,
  Gauge,
  HardDrive,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import {
  runAlgorithm,
  recommend,
  type AlgorithmKey,
  type Direction,
} from "./scheduler";

const algorithms: AlgorithmKey[] = [
  "FCFS",
  "SSTF",
  "SCAN",
  "C-SCAN",
  "LOOK",
  "C-LOOK",
];
const descriptions: Record<AlgorithmKey, string> = {
  FCFS: "Arrival order",
  SSTF: "Nearest request",
  SCAN: "Elevator sweep",
  "C-SCAN": "Circular sweep",
  LOOK: "Sweep to last request",
  "C-LOOK": "Circular look",
};
const initialQueue = "98, 183, 37, 122, 14, 124, 65, 67";

function parseQueue(value: string) {
  if (!value.trim()) return [];
  return value
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);
}
function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
function App() {
  const [queueText, setQueueText] = useState(initialQueue);
  const [headText, setHeadText] = useState("53");
  const [maxText, setMaxText] = useState("199");
  const [direction, setDirection] = useState<Direction>("up");
  const [selected, setSelected] = useState<AlgorithmKey>("LOOK");
  const [showBoundaries, setShowBoundaries] = useState(true);

  const parsed = parseQueue(queueText);
  const head = Number(headText);
  const maxCylinder = Number(maxText);
  const errors: string[] = [];
  if (!headText.trim() || !Number.isInteger(head) || head < 0)
    errors.push("Head position must be a non-negative integer.");
  if (!maxText.trim() || !Number.isInteger(maxCylinder) || maxCylinder < 1)
    errors.push("Maximum cylinder must be a positive integer.");
  if (
    Number.isInteger(head) &&
    Number.isInteger(maxCylinder) &&
    head > maxCylinder
  )
    errors.push("Head position must be within the disk range.");
  if (queueText.trim() && parsed.some((n) => !Number.isInteger(n) || n < 0))
    errors.push("Requests must be non-negative integers.");
  if (Number.isInteger(maxCylinder) && parsed.some((n) => n > maxCylinder))
    errors.push("Every request must be within the disk range.");
  if (parsed.length > 100)
    errors.push("Enter 100 requests or fewer for this demo.");
  const valid = errors.length === 0 && parsed.length > 0;

  const results = useMemo(() => {
    if (!valid) return [];
    return algorithms.map((key) =>
      runAlgorithm(key, parsed, head, maxCylinder, direction),
    );
  }, [queueText, head, maxCylinder, direction, valid]);
  const chosen = results.find((r) => r.key === selected);
  const suggestion = recommend(results, parsed, head, direction);
  const bestMovement = results.length
    ? Math.min(...results.map((r) => r.movement))
    : 0;
  const selectedRank = chosen
    ? [...results]
        .sort((a, b) => a.movement - b.movement)
        .findIndex((r) => r.key === selected) + 1
    : 0;

  const reset = () => {
    setQueueText(initialQueue);
    setHeadText("53");
    setMaxText("199");
    setDirection("up");
    setSelected("LOOK");
  };
  const exportCsv = () => {
    const lines = [
      "Algorithm,Total head movement,Average movement per request,Requests served,Head path",
      ...results.map(
        (r) =>
          `${r.key},${r.movement},${r.averageMovement.toFixed(2)},${r.served},"${r.path.join(" -> ")}"`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "disk-scheduling-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <HardDrive size={21} />
          </div>
          <div>
            <strong>DiskScope</strong>
            <span>OS LAB / ANALYTICS</span>
          </div>
        </div>
        <div className="side-label">WORKSPACE</div>
        <button className="nav-item active">
          <Activity size={17} /> Analyzer <span className="nav-dot" />
        </button>
        <button
          className="nav-item"
          onClick={() =>
            document
              .getElementById("comparison")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <BarChart3 size={17} /> Comparisons
        </button>
        <button
          className="nav-item"
          onClick={() =>
            document
              .getElementById("recommendation")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Sparkles size={17} /> Smart insights
        </button>
        <div className="sidebar-bottom">
          <div className="status-card">
            <div className="status-top">
              <span className="status-led" /> SIMULATOR STATUS
            </div>
            <strong>Ready to analyze</strong>
            <p>Local simulation engine active. No disk access is performed.</p>
          </div>
          <div className="sidebar-footer">
            DISKSCOPE <span>v1.0.0</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>Disk I/O Analyzer</strong>
          </div>
          <div className="top-right">
            <span className="live-pill">
              <i /> SIMULATION MODE
            </span>
            <div className="avatar">DS</div>
          </div>
        </header>
        <div className="page">
          <div className="hero">
            <div>
              <div className="eyebrow">
                <span /> INTELLIGENT SCHEDULING SYSTEM
              </div>
              <h1>
                Disk I/O Scheduling <em>Analyzer</em>
              </h1>
              <p>
                Model disk-head movement, compare six classic algorithms, and
                discover the right strategy for your workload.
              </p>
            </div>
            <div className="hero-chip">
              <Cpu size={16} /> RULE-BASED ENGINE <ChevronDown size={14} />
            </div>
          </div>

          <section className="metrics">
            <Metric
              icon={<Gauge size={18} />}
              label="ALGORITHMS"
              value="06"
              detail="Strategies compared"
            />
            <Metric
              icon={<HardDrive size={18} />}
              label="REQUEST QUEUE"
              value={String(parsed.length).padStart(2, "0")}
              detail="Pending I/O requests"
            />
            <Metric
              icon={<TrendingDown size={18} />}
              label="LOWEST MOVEMENT"
              value={valid ? `${bestMovement}` : "—"}
              detail="Cylinder movements"
            />
            <Metric
              icon={<Activity size={18} />}
              label="SELECTED RANK"
              value={valid ? `#${selectedRank}` : "—"}
              detail="By total movement"
            />
          </section>

          <div className="workspace-grid">
            <section className="panel input-panel">
              <div className="panel-heading">
                <div className="heading-icon">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h2>Simulation parameters</h2>
                  <p>Configure your disk workload</p>
                </div>
                <span className="step">01</span>
              </div>
              <div className="field-grid">
                <label className="field">
                  <span>
                    Initial head position <CircleHelp size={13} />
                  </span>
                  <input
                    value={headText}
                    inputMode="numeric"
                    onChange={(e) => setHeadText(e.target.value)}
                  />
                  <small>Starting cylinder (0 to max)</small>
                </label>
                <label className="field">
                  <span>
                    Maximum cylinder <CircleHelp size={13} />
                  </span>
                  <input
                    value={maxText}
                    inputMode="numeric"
                    onChange={(e) => setMaxText(e.target.value)}
                  />
                  <small>Disk range starts at 0</small>
                </label>
              </div>
              <label className="field queue-field">
                <span>
                  Request queue <b>{parsed.length} requests</b>
                </span>
                <textarea
                  rows={3}
                  value={queueText}
                  onChange={(e) => setQueueText(e.target.value)}
                  placeholder="e.g. 98, 183, 37, 122..."
                />
                <small>Separate cylinder numbers with commas or spaces.</small>
              </label>
              <div className="direction-field">
                <div>
                  <span className="field-title">Initial scan direction</span>
                  <small>Used by SCAN, C-SCAN, LOOK and C-LOOK</small>
                </div>
                <div className="segmented">
                  <button
                    className={direction === "up" ? "selected" : ""}
                    onClick={() => setDirection("up")}
                  >
                    <ArrowUp size={15} /> Upward
                  </button>
                  <button
                    className={direction === "down" ? "selected" : ""}
                    onClick={() => setDirection("down")}
                  >
                    <ArrowDown size={15} /> Downward
                  </button>
                </div>
              </div>
              {errors.length > 0 && (
                <div className="errors">
                  {errors.map((e) => (
                    <div key={e}>• {e}</div>
                  ))}
                </div>
              )}
              <div className="form-actions">
                <button
                  className="primary-btn"
                  disabled={!valid}
                  onClick={() => {
                    document
                      .getElementById("comparison")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <Activity size={16} /> Analyze workload
                </button>
                <button className="reset-btn" onClick={reset}>
                  <RotateCcw size={15} /> Reset
                </button>
              </div>
              <div className="local-note">
                <Check size={14} /> Runs locally in your browser. No data
                uploaded.
              </div>
            </section>

            <section className="panel chart-panel">
              <div className="panel-heading">
                <div className="heading-icon purple">
                  <Activity size={18} />
                </div>
                <div>
                  <h2>Head movement path</h2>
                  <p>
                    Selected algorithm · <b>{selected}</b>
                  </p>
                </div>
                <span className="step">02</span>
              </div>
              <div className="algo-select">
                <span>VISUALIZING</span>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value as AlgorithmKey)}
                >
                  {algorithms.map((a) => (
                    <option key={a} value={a}>
                      {a} — {descriptions[a]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="chart-wrap">
                {chosen && valid ? (
                  <MovementChart
                    path={chosen.path}
                    maxCylinder={maxCylinder}
                    showBoundaries={showBoundaries}
                  />
                ) : (
                  <div className="empty-chart">
                    Enter valid disk parameters to visualize the head path.
                  </div>
                )}
              </div>
              <div className="chart-legend">
                <span>
                  <i className="legend-line" /> Head trajectory
                </span>
                <span>
                  <i className="legend-dot" /> Request / stop
                </span>
                <label>
                  <input
                    type="checkbox"
                    checked={showBoundaries}
                    onChange={(e) => setShowBoundaries(e.target.checked)}
                  />{" "}
                  Show boundaries
                </label>
              </div>
              <div className="path-strip">
                <span>SEQUENCE</span>
                <div>
                  {chosen?.path.map((n, i) => (
                    <span
                      key={`${n}-${i}`}
                      className={i === 0 ? "path-head" : "path-node"}
                    >
                      {n}
                      {i < (chosen?.path.length ?? 0) - 1 && <b> → </b>}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section className="panel comparison-panel" id="comparison">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <span /> PERFORMANCE OVERVIEW
                </div>
                <h2>Algorithm comparison</h2>
                <p>
                  Ranked by total simulated head movement. Lower is better for
                  this metric.
                </p>
              </div>
              <button
                className="outline-btn"
                disabled={!valid}
                onClick={exportCsv}
              >
                <Download size={15} /> Export CSV
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ALGORITHM</th>
                    <th>TOTAL MOVEMENT</th>
                    <th>AVG / REQUEST</th>
                    <th>REQUESTS SERVED</th>
                    <th>RELATIVE MOVEMENT</th>
                    <th>RANK</th>
                  </tr>
                </thead>
                <tbody>
                  {valid ? (
                    [...results]
                      .sort((a, b) => a.movement - b.movement)
                      .map((r, i) => (
                        <tr
                          key={r.key}
                          className={r.key === selected ? "row-selected" : ""}
                          onClick={() => setSelected(r.key)}
                        >
                          <td>
                            <div className="algorithm-cell">
                              <div
                                className={`algo-mark mark-${r.key.replace("-", "").toLowerCase()}`}
                              >
                                {r.key.slice(0, 1)}
                              </div>
                              <div>
                                <strong>{r.key}</strong>
                                <small>{descriptions[r.key]}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong className="movement-number">
                              {fmt(r.movement)}
                            </strong>
                            <span className="unit"> cyl</span>
                          </td>
                          <td>
                            {fmt(r.averageMovement)}{" "}
                            <span className="unit">cyl</span>
                          </td>
                          <td>
                            {r.served} / {parsed.length}
                          </td>
                          <td>
                            <div className="bar-cell">
                              <div className="bar-track">
                                <div
                                  className="bar-fill"
                                  style={{
                                    width: `${Math.max(3, (r.movement / Math.max(...results.map((x) => x.movement), 1)) * 100)}%`,
                                  }}
                                />
                              </div>
                              <span>
                                {bestMovement
                                  ? `${((r.movement / bestMovement - 1) * 100).toFixed(0)}%`
                                  : "0%"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`rank ${i === 0 ? "rank-best" : ""}`}
                            >
                              {i === 0 ? "★ BEST" : `#${i + 1}`}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="table-empty">
                        Fix the input errors to run the comparison.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-foot">
              <span>
                <i className="green-dot" />{" "}
                {valid
                  ? "All requests served in each simulation"
                  : "Waiting for valid input"}
              </span>
              <span>Metric: total head movement (cylinders)</span>
            </div>
          </section>

          <section className="insight-grid" id="recommendation">
            <div className="panel recommendation-panel">
              <div className="recommend-icon">
                <Sparkles size={20} />
              </div>
              <div className="recommend-content">
                <div className="eyebrow">
                  SMART RECOMMENDATION{" "}
                  <span className="rule-tag">RULE-BASED</span>
                </div>
                <h2>
                  {valid
                    ? suggestion.title
                    : "Ready when your inputs are valid"}
                </h2>
                <p>
                  {valid
                    ? suggestion.reason
                    : "Set a valid disk range and request queue to receive a workload-specific recommendation."}
                </p>
                <div className="recommend-bottom">
                  <span>Suggested strategy</span>
                  <strong>
                    {valid ? suggestion.key : "—"} <span>↗</span>
                  </strong>
                </div>
              </div>
            </div>
            <div className="panel selected-panel">
              <div className="panel-heading compact">
                <div className="heading-icon amber">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h2>Selected strategy</h2>
                  <p>{chosen?.name ?? "Choose an algorithm"}</p>
                </div>
              </div>
              <div className="selected-stats">
                <div>
                  <span>TOTAL MOVEMENT</span>
                  <strong>
                    {chosen ? fmt(chosen.movement) : "—"} <small>cyl</small>
                  </strong>
                </div>
                <div>
                  <span>AVG PER REQUEST</span>
                  <strong>
                    {chosen ? fmt(chosen.averageMovement) : "—"}{" "}
                    <small>cyl</small>
                  </strong>
                </div>
              </div>
              <p className="algorithm-note">
                {chosen?.note ?? "Algorithm notes will appear here."}
              </p>
            </div>
          </section>
          <footer className="footer">
            <span>
              DiskScope <b>·</b> Intelligent Disk I/O Scheduling Analyzer
            </span>
            <span>
              Educational simulator <b>·</b> Not a live disk benchmark
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <div className="metric-icon">{icon}</div>
        <span>{label}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}

function MovementChart({
  path,
  maxCylinder,
  showBoundaries,
}: {
  path: number[];
  maxCylinder: number;
  showBoundaries: boolean;
}) {
  const width = 620,
    height = 235,
    left = 35,
    right = 20,
    top = 24,
    bottom = 32;
  const maxX = Math.max(path.length - 1, 1);
  const x = (i: number) => left + (i / maxX) * (width - left - right);
  const y = (n: number) =>
    height - bottom - (n / maxCylinder) * (height - top - bottom);
  const ticks = [
    0,
    Math.round(maxCylinder * 0.25),
    Math.round(maxCylinder * 0.5),
    Math.round(maxCylinder * 0.75),
    maxCylinder,
  ];
  const polyline = path.map((n, i) => `${x(i)},${y(n)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Disk head movement line chart"
      className="movement-svg"
    >
      {ticks.map((n, i) => (
        <g key={`${n}-${i}`}>
          <line
            x1={left}
            y1={y(n)}
            x2={width - right}
            y2={y(n)}
            stroke="rgba(151,165,195,.14)"
            strokeDasharray="4 5"
          />
          <text
            x={left - 8}
            y={y(n) + 4}
            textAnchor="end"
            className="axis-label"
          >
            {n}
          </text>
        </g>
      ))}
      {showBoundaries && (
        <>
          <line
            x1={left}
            y1={y(0)}
            x2={width - right}
            y2={y(0)}
            stroke="#d97757"
            strokeDasharray="3 5"
            opacity=".8"
          />
          <line
            x1={left}
            y1={y(maxCylinder)}
            x2={width - right}
            y2={y(maxCylinder)}
            stroke="#d97757"
            strokeDasharray="3 5"
            opacity=".8"
          />
        </>
      )}
      <polyline
        points={polyline}
        fill="none"
        stroke="#8d7cf6"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {path.map((n, i) => (
        <g key={`${n}-${i}`}>
          <circle
            cx={x(i)}
            cy={y(n)}
            r={i === 0 ? 5 : 3.5}
            fill={i === 0 ? "#a89cff" : "#67d5c0"}
            stroke="#11182a"
            strokeWidth="1.5"
          />
          {(path.length < 13 || i === 0 || i === path.length - 1) && (
            <text
              x={x(i)}
              y={y(n) - 10}
              textAnchor="middle"
              className="point-label"
            >
              {n}
            </text>
          )}
        </g>
      ))}
      <text x={left} y={height - 7} className="axis-label">
        START
      </text>
      <text
        x={width - right}
        y={height - 7}
        textAnchor="end"
        className="axis-label"
      >
        REQUEST ORDER →
      </text>
    </svg>
  );
}

export default App;
