export type AlgorithmKey =
  | "FCFS"
  | "SSTF"
  | "SCAN"
  | "C-SCAN"
  | "LOOK"
  | "C-LOOK";
export type Direction = "up" | "down";
export type AlgorithmResult = {
  key: AlgorithmKey;
  name: string;
  path: number[];
  movement: number;
  averageMovement: number;
  served: number;
  note: string;
};

const names: Record<AlgorithmKey, string> = {
  FCFS: "First Come, First Served",
  SSTF: "Shortest Seek Time First",
  SCAN: "SCAN (Elevator)",
  "C-SCAN": "Circular SCAN",
  LOOK: "LOOK",
  "C-LOOK": "Circular LOOK",
};

function totalMovement(path: number[]) {
  return path
    .slice(1)
    .reduce((sum, cylinder, i) => sum + Math.abs(cylinder - path[i]), 0);
}

export function runAlgorithm(
  key: AlgorithmKey,
  requests: number[],
  head: number,
  maxCylinder: number,
  direction: Direction,
): AlgorithmResult {
  const lower = [...requests].filter((n) => n < head).sort((a, b) => b - a);
  const upper = [...requests].filter((n) => n >= head).sort((a, b) => a - b);
  let path = [head];
  let note = "";

  switch (key) {
    case "FCFS":
      path = [head, ...requests];
      note =
        "Serves requests in arrival order; simple and fair, but may cause large head movement.";
      break;
    case "SSTF": {
      const pending = [...requests];
      let current = head;
      path = [head];
      while (pending.length) {
        let best = 0;
        for (let i = 1; i < pending.length; i++) {
          const d = Math.abs(pending[i] - current);
          const bestD = Math.abs(pending[best] - current);
          if (d < bestD || (d === bestD && pending[i] < pending[best]))
            best = i;
        }
        current = pending.splice(best, 1)[0];
        path.push(current);
      }
      note =
        "Chooses the nearest pending request. Usually lowers movement, but distant requests can starve.";
      break;
    }
    case "SCAN":
      if (direction === "up") path = [head, ...upper];
      else path = [head, ...lower];
      if (direction === "up") {
        if (path[path.length - 1] !== maxCylinder) path.push(maxCylinder);
        path.push(...lower.slice().reverse());
      } else {
        if (path[path.length - 1] !== 0) path.push(0);
        path.push(...upper.slice().reverse());
      }
      note =
        "Moves to the disk boundary, then reverses direction. Gives more predictable wait times.";
      break;
    case "C-SCAN":
      if (direction === "up") {
        path = [head, ...upper];
        if (path[path.length - 1] !== maxCylinder) path.push(maxCylinder);
        if (path[path.length - 1] !== 0) path.push(0);
        path.push(...lower.slice().reverse());
      } else {
        path = [head, ...lower];
        if (path[path.length - 1] !== 0) path.push(0);
        if (path[path.length - 1] !== maxCylinder) path.push(maxCylinder);
        path.push(...upper.slice().reverse());
      }
      note =
        "Services in one direction and wraps to the opposite end. The wrap movement is included in total movement.";
      break;
    case "LOOK":
      if (direction === "up") path = [head, ...upper, ...lower];
      else path = [head, ...lower, ...upper];
      note =
        "Like SCAN, but reverses at the last request instead of travelling to the physical boundary.";
      break;
    case "C-LOOK":
      if (direction === "up")
        path = [head, ...upper, ...lower.slice().reverse()];
      else path = [head, ...lower, ...upper.slice().reverse()];
      note =
        "Like C-SCAN, but wraps between the outermost pending requests rather than disk boundaries.";
      break;
  }

  const movement = totalMovement(path);
  return {
    key,
    name: names[key],
    path,
    movement,
    averageMovement: requests.length ? movement / requests.length : 0,
    served: requests.length,
    note,
  };
}

export function recommend(
  results: AlgorithmResult[],
  requests: number[],
  head: number,
  direction: Direction,
) {
  if (!requests.length)
    return {
      key: "FCFS" as AlgorithmKey,
      title: "Add requests to get a recommendation",
      reason:
        "Enter at least one disk request to compare scheduling strategies.",
    };
  const spread = Math.max(...requests, head) - Math.min(...requests, head);
  const avgDistance =
    requests.reduce((s, n) => s + Math.abs(n - head), 0) / requests.length;
  const sorted = [...requests].sort((a, b) => a - b);
  const gaps = sorted.slice(1).map((n, i) => n - sorted[i]);
  const uneven =
    gaps.length > 1 &&
    Math.max(...gaps) > Math.max(1, (Math.min(...gaps) || 1) * 4);
  const best = [...results].sort((a, b) => a.movement - b.movement)[0];
  if (requests.length <= 4) {
    return {
      key: best.key,
      title: `${best.key} is a strong fit for this small queue`,
      reason: `With only ${requests.length} requests, the analyzer prioritizes the lowest simulated head movement (${best.movement} cylinders).`,
    };
  }
  if (uneven && avgDistance > spread * 0.35) {
    const sstf = results.find((r) => r.key === "SSTF")!;
    return {
      key: "SSTF" as AlgorithmKey,
      title: "Consider SSTF for nearby clusters",
      reason: `The requests are unevenly spaced and average ${avgDistance.toFixed(1)} cylinders from the initial head. SSTF can reduce immediate seeks, but monitor distant requests for starvation.`,
    };
  }
  const circular = results.find((r) => r.key === "C-SCAN")!;
  const scan = results.find((r) => r.key === "SCAN")!;
  if (
    requests.length >= 8 &&
    Math.abs(circular.movement - scan.movement) / Math.max(scan.movement, 1) <
      0.25
  ) {
    return {
      key: "C-SCAN" as AlgorithmKey,
      title: "Consider C-SCAN for steadier wait times",
      reason: `There are ${requests.length} requests. C-SCAN services in one direction, which can make waiting times more uniform; its wraparound movement is counted in the total.`,
    };
  }
  return {
    key: best.key,
    title: `${best.key} has the lowest movement in this simulation`,
    reason: `For this exact queue and ${direction === "up" ? "upward" : "downward"} initial direction, ${best.key} moves ${best.movement} cylinders, the lowest among the six simulated algorithms. This is a workload-specific result, not a universal ranking.`,
  };
}
