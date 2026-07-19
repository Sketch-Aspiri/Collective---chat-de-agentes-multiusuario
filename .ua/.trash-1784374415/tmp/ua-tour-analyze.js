#!/usr/bin/env node
'use strict';

function fail(msg) {
  process.stderr.write('ERROR: ' + msg + '\n');
  process.exit(1);
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath || !outputPath) fail('usage: node ua-tour-analyze.js <input.json> <output.json>');

let data;
try {
  data = JSON.parse(require('fs').readFileSync(inputPath, 'utf8'));
} catch (e) {
  fail('failed to read/parse input: ' + e.message);
}

const fs = require('fs');
const path = require('path');

const nodes = data.nodes || [];
const edges = data.edges || [];
const layers = data.layers || [];

const nodeById = new Map();
nodes.forEach(n => nodeById.set(n.id, n));

// A/B: fan-in / fan-out
const fanIn = new Map();
const fanOut = new Map();
nodes.forEach(n => { fanIn.set(n.id, 0); fanOut.set(n.id, 0); });
edges.forEach(e => {
  if (fanOut.has(e.source)) fanOut.set(e.source, fanOut.get(e.source) + 1);
  if (fanIn.has(e.target)) fanIn.set(e.target, fanIn.get(e.target) + 1);
});

const fanInRanking = [...fanIn.entries()]
  .map(([id, v]) => ({ id, fanIn: v, name: nodeById.get(id) ? nodeById.get(id).name : id }))
  .sort((a, b) => b.fanIn - a.fanIn)
  .slice(0, 20);

const fanOutRanking = [...fanOut.entries()]
  .map(([id, v]) => ({ id, fanOut: v, name: nodeById.get(id) ? nodeById.get(id).name : id }))
  .sort((a, b) => b.fanOut - a.fanOut)
  .slice(0, 20);

// C: entry point candidates
const ENTRY_FILENAMES = new Set([
  'index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js', 'server.ts', 'server.js',
  'mod.rs', 'main.go', 'main.py', 'main.rs', 'manage.py', 'app.py', 'wsgi.py', 'asgi.py',
  'run.py', '__main__.py', 'Application.java', 'Main.java', 'Program.cs', 'config.ru',
  'index.php', 'App.swift', 'Application.kt', 'main.cpp', 'main.c'
]);

const fanOutVals = [...fanOut.values()].sort((a, b) => a - b);
const fanInVals = [...fanIn.values()].sort((a, b) => a - b);
function percentileThreshold(sortedVals, pct) {
  if (sortedVals.length === 0) return 0;
  const idx = Math.floor(sortedVals.length * pct);
  return sortedVals[Math.min(idx, sortedVals.length - 1)];
}
const fanOutTop10Threshold = percentileThreshold(fanOutVals, 0.9);
const fanInBottom25Threshold = percentileThreshold(fanInVals, 0.25);

function depthOfPath(filePath) {
  if (!filePath) return 99;
  const parts = filePath.split('/').filter(Boolean);
  return parts.length;
}

const entryScores = [];
nodes.forEach(n => {
  let score = 0;
  const fp = n.filePath || '';
  const base = path.basename(fp);
  if (n.type === 'document') {
    if (base === 'README.md' && depthOfPath(fp) <= 1) score += 5;
    else if (fp.endsWith('.md') && depthOfPath(fp) <= 1) score += 2;
  } else if (n.type === 'file') {
    if (ENTRY_FILENAMES.has(base)) score += 3;
    if (depthOfPath(fp) <= 2) score += 1;
    if (fanOut.get(n.id) >= fanOutTop10Threshold && fanOut.get(n.id) > 0) score += 1;
    if (fanIn.get(n.id) <= fanInBottom25Threshold) score += 1;
  }
  if (score > 0) entryScores.push({ id: n.id, score, name: n.name, summary: n.summary });
});
entryScores.sort((a, b) => b.score - a.score);
const entryPointCandidates = entryScores.slice(0, 5);

// D: BFS from top code entry point (skip document nodes)
const topCodeEntry = entryScores.find(e => {
  const nd = nodeById.get(e.id);
  return nd && nd.type !== 'document';
});

const adjacency = new Map();
nodes.forEach(n => adjacency.set(n.id, []));
edges.forEach(e => {
  if ((e.type === 'imports' || e.type === 'calls') && adjacency.has(e.source)) {
    adjacency.get(e.source).push(e.target);
  }
});

let bfsTraversal = { startNode: null, order: [], depthMap: {}, byDepth: {} };
if (topCodeEntry) {
  const start = topCodeEntry.id;
  const visited = new Set([start]);
  const order = [start];
  const depthMap = { [start]: 0 };
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift();
    const d = depthMap[cur];
    const neighbors = adjacency.get(cur) || [];
    for (const nb of neighbors) {
      if (!visited.has(nb) && nodeById.has(nb)) {
        visited.add(nb);
        depthMap[nb] = d + 1;
        order.push(nb);
        queue.push(nb);
      }
    }
  }
  const byDepth = {};
  Object.entries(depthMap).forEach(([id, d]) => {
    byDepth[d] = byDepth[d] || [];
    byDepth[d].push(id);
  });
  bfsTraversal = { startNode: start, order, depthMap, byDepth };
}

// E: non-code file inventory
const nonCodeFiles = { documentation: [], infrastructure: [], data: [], config: [] };
nodes.forEach(n => {
  if (n.type === 'document') {
    nonCodeFiles.documentation.push({ id: n.id, name: n.name, summary: n.summary });
  } else if (n.type === 'service' || n.type === 'pipeline' || n.type === 'resource') {
    nonCodeFiles.infrastructure.push({ id: n.id, name: n.name, type: n.type, summary: n.summary });
  } else if (n.type === 'table' || n.type === 'schema' || n.type === 'endpoint') {
    nonCodeFiles.data.push({ id: n.id, name: n.name, type: n.type, summary: n.summary });
  } else if (n.type === 'config') {
    nonCodeFiles.config.push({ id: n.id, name: n.name, summary: n.summary });
  }
});

// F: tightly coupled clusters
const edgeSet = new Set();
const undirectedPairEdges = new Map(); // key "a|b" sorted -> count
edges.forEach(e => {
  edgeSet.add(e.source + '>' + e.target + ':' + e.type);
});

function hasEdge(a, b, type) {
  return edgeSet.has(a + '>' + b + ':' + type);
}

const bidirPairs = [];
const seenPair = new Set();
edges.forEach(e => {
  if (e.type !== 'imports' && e.type !== 'calls') return;
  const a = e.source, b = e.target;
  const key = [a, b].sort().join('|') + '|' + e.type;
  if (seenPair.has(key)) return;
  if (hasEdge(b, a, e.type)) {
    seenPair.add(key);
    bidirPairs.push([a, b]);
  }
});

// Union-find to group bidir pairs into base clusters
const parent = new Map();
function find(x) {
  if (!parent.has(x)) parent.set(x, x);
  let r = x;
  while (parent.get(r) !== r) r = parent.get(r);
  parent.set(x, r);
  return r;
}
function union(a, b) {
  const ra = find(a), rb = find(b);
  if (ra !== rb) parent.set(ra, rb);
}
bidirPairs.forEach(([a, b]) => { find(a); find(b); union(a, b); });

const clusterGroups = new Map();
[...parent.keys()].forEach(id => {
  const root = find(id);
  if (!clusterGroups.has(root)) clusterGroups.set(root, new Set());
  clusterGroups.get(root).add(id);
});

// Expand clusters: add nodes connecting to 2+ existing members (cap size 5)
function edgeCountBetween(setNodes) {
  let count = 0;
  edges.forEach(e => {
    if (setNodes.has(e.source) && setNodes.has(e.target)) count++;
  });
  return count;
}

let clusters = [];
clusterGroups.forEach(set => {
  let members = new Set(set);
  if (members.size < 2) return;
  // try expansion
  let changed = true;
  while (changed && members.size < 5) {
    changed = false;
    const connectCounts = new Map();
    edges.forEach(e => {
      if (members.has(e.target) && !members.has(e.source)) {
        connectCounts.set(e.source, (connectCounts.get(e.source) || 0) + 1);
      }
      if (members.has(e.source) && !members.has(e.target)) {
        connectCounts.set(e.target, (connectCounts.get(e.target) || 0) + 1);
      }
    });
    for (const [cand, cnt] of connectCounts.entries()) {
      if (cnt >= 2 && members.size < 5) {
        members.add(cand);
        changed = true;
        break;
      }
    }
  }
  const nodesArr = [...members].slice(0, 5);
  clusters.push({ nodes: nodesArr, edgeCount: edgeCountBetween(new Set(nodesArr)) });
});
clusters.sort((a, b) => b.edgeCount - a.edgeCount);
clusters = clusters.slice(0, 10);

// G: layers
const layersOut = { count: layers.length, list: layers.map(l => ({ id: l.id, name: l.name, description: l.description })) };

// H: node summary index
const nodeSummaryIndex = {};
nodes.forEach(n => { nodeSummaryIndex[n.id] = { name: n.name, type: n.type, summary: n.summary }; });

const result = {
  scriptCompleted: true,
  entryPointCandidates,
  fanInRanking,
  fanOutRanking,
  bfsTraversal,
  nonCodeFiles,
  clusters,
  layers: layersOut,
  nodeSummaryIndex,
  totalNodes: nodes.length,
  totalEdges: edges.length
};

try {
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
} catch (e) {
  fail('failed to write output: ' + e.message);
}

process.exit(0);
