# DiskScope — Intelligent Disk I/O Scheduling Analyzer

A client-side React + TypeScript dashboard that simulates FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK disk scheduling.

## Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite, usually `http://localhost:5173`.

## Production build
```bash
npm run build
npm run preview
```

## Features
- Editable disk head, maximum cylinder, request queue, and initial direction
- Interactive head-path visualization
- Six algorithm simulations with total movement and average movement per request
- Ranked comparison table and CSV export
- Rule-based recommendation with a workload-specific explanation
- Responsive dark dashboard; no backend or database required

## Calculation conventions
- The disk range is cylinders `0` through `maximum cylinder`, inclusive.
- Total head movement is the sum of absolute differences between consecutive positions in the simulated path.
- Average movement per request = total head movement / number of requests.
- SCAN and C-SCAN travel to disk boundaries as needed. C-SCAN counts the wraparound travel in total movement.
- LOOK and C-LOOK use the outermost pending requests instead of physical boundaries.
- Duplicate requests are retained and counted as separate requests.
- The visualized path includes boundary/wrap stops, so the displayed sequence reflects actual simulated movement.

## Rule-based recommendation
The analyzer uses transparent heuristics rather than a trained ML model. It considers queue size, request spacing, average distance from the starting head, and measured movement from the six algorithms. The recommendation is specific to the entered workload; it is not a universal claim that one algorithm is always best.

## Important limitations
This is an educational simulator. It does not issue real operating-system disk I/O, model rotational latency, cache effects, request arrival timestamps, SSD behavior, or per-request waiting time. SSTF can starve distant requests. Total movement alone does not capture fairness or latency.
