const fs = require('fs');

function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error('Usage: node ua-arch-analyze.js <input.json> <output.json>');
    process.exit(1);
  }
  const raw = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(raw);
  const fileNodes = data.fileNodes || data.nodes || [];
  const importEdges = data.importEdges || [];
  const allEdges = data.allEdges || [];

  const nodeById = new Map(fileNodes.map((n) => [n.id, n]));

  // A. Directory grouping
  function dirOf(filePath) {
    const parts = filePath.split('/');
    parts.pop();
    return parts;
  }
  const allPaths = fileNodes.map((n) => n.filePath || n.name || '');
  // compute common prefix (by directory segments)
  function commonPrefixSegments(paths) {
    const splitPaths = paths.map((p) => p.split('/').slice(0, -1));
    if (splitPaths.length === 0) return [];
    let prefix = splitPaths[0];
    for (const segs of splitPaths.slice(1)) {
      let i = 0;
      while (i < prefix.length && i < segs.length && prefix[i] === segs[i]) i++;
      prefix = prefix.slice(0, i);
      if (prefix.length === 0) break;
    }
    return prefix;
  }
  const commonPrefix = commonPrefixSegments(allPaths);

  const directoryGroups = {};
  function groupNameFor(filePath) {
    const segs = filePath.split('/');
    const dirSegs = segs.slice(0, -1);
    let rest = dirSegs;
    if (
      commonPrefix.length > 0 &&
      dirSegs.slice(0, commonPrefix.length).join('/') === commonPrefix.join('/')
    ) {
      rest = dirSegs.slice(commonPrefix.length);
    }
    if (rest.length === 0) {
      // flat - group by extension pattern
      const fname = segs[segs.length - 1];
      if (/\.test\.|\.spec\./.test(fname)) return 'test';
      if (/\.config\./.test(fname)) return 'config';
      const ext = fname.includes('.') ? fname.split('.').pop() : 'root';
      return ext || 'root';
    }
    return rest[0];
  }

  for (const n of fileNodes) {
    const fp = n.filePath || n.name || '';
    const g = groupNameFor(fp);
    if (!directoryGroups[g]) directoryGroups[g] = [];
    directoryGroups[g].push(n.id);
  }

  // B. Node type grouping
  const nodeTypeGroups = {};
  for (const n of fileNodes) {
    const t = n.type || 'file';
    if (!nodeTypeGroups[t]) nodeTypeGroups[t] = [];
    nodeTypeGroups[t].push(n.id);
  }

  // C. Import adjacency
  const fileFanOut = {};
  const fileFanIn = {};
  const importAdj = {}; // id -> Set of targets
  for (const e of importEdges) {
    if (!nodeById.has(e.source) || !nodeById.has(e.target)) continue;
    fileFanOut[e.source] = (fileFanOut[e.source] || 0) + 1;
    fileFanIn[e.target] = (fileFanIn[e.target] || 0) + 1;
    if (!importAdj[e.source]) importAdj[e.source] = new Set();
    importAdj[e.source].add(e.target);
  }

  // group lookup
  const idToGroup = {};
  for (const [g, ids] of Object.entries(directoryGroups)) {
    for (const id of ids) idToGroup[id] = g;
  }

  // D. Cross-category dependency analysis (allEdges, non-import types, between different node types)
  const crossCategoryMap = {};
  for (const e of allEdges) {
    const s = nodeById.get(e.source);
    const t = nodeById.get(e.target);
    if (!s || !t) continue;
    if (s.type === t.type) continue;
    const key = `${s.type}|${t.type}|${e.type}`;
    crossCategoryMap[key] = (crossCategoryMap[key] || 0) + 1;
  }
  const crossCategoryEdges = Object.entries(crossCategoryMap).map(([k, count]) => {
    const [fromType, toType, edgeType] = k.split('|');
    return { fromType, toType, edgeType, count };
  });

  // E. Inter-group import frequency
  const interGroupMap = {};
  for (const e of importEdges) {
    if (!nodeById.has(e.source) || !nodeById.has(e.target)) continue;
    const gs = idToGroup[e.source];
    const gt = idToGroup[e.target];
    if (!gs || !gt) continue;
    const key = `${gs}|${gt}`;
    interGroupMap[key] = (interGroupMap[key] || 0) + 1;
  }
  const interGroupImports = Object.entries(interGroupMap).map(([k, count]) => {
    const [from, to] = k.split('|');
    return { from, to, count };
  });

  // F. Intra-group density
  const intraGroupDensity = {};
  for (const g of Object.keys(directoryGroups)) {
    let internalEdges = 0;
    let totalEdges = 0;
    for (const e of importEdges) {
      if (!nodeById.has(e.source) || !nodeById.has(e.target)) continue;
      const gs = idToGroup[e.source];
      const gt = idToGroup[e.target];
      if (gs !== g && gt !== g) continue;
      totalEdges++;
      if (gs === g && gt === g) internalEdges++;
    }
    intraGroupDensity[g] = {
      internalEdges,
      totalEdges,
      density: totalEdges > 0 ? internalEdges / totalEdges : 0,
    };
  }

  // G. Directory pattern matching
  const patternRules = [
    [['routes', 'api', 'controllers', 'endpoints', 'handlers', 'controller', 'routers'], 'api'],
    [
      [
        'services',
        'core',
        'lib',
        'domain',
        'logic',
        'composables',
        'mailers',
        'jobs',
        'channels',
        'signals',
        'internal',
      ],
      'service',
    ],
    [
      [
        'models',
        'db',
        'data',
        'persistence',
        'repository',
        'entities',
        'migrations',
        'entity',
        'sql',
        'database',
        'schema',
      ],
      'data',
    ],
    [['components', 'views', 'pages', 'ui', 'layouts', 'screens'], 'ui'],
    [['middleware', 'plugins', 'interceptors', 'guards'], 'middleware'],
    [['utils', 'helpers', 'common', 'shared', 'tools', 'templatetags', 'pkg'], 'utility'],
    [['config', 'constants', 'env', 'settings', 'management', 'commands'], 'config'],
    [['__tests__', 'test', 'tests', 'spec', 'specs'], 'test'],
    [
      ['types', 'interfaces', 'schemas', 'contracts', 'dtos', 'dto', 'request', 'response'],
      'types',
    ],
    [['hooks'], 'hooks'],
    [['store', 'state', 'reducers', 'actions', 'slices'], 'state'],
    [['assets', 'static', 'public'], 'assets'],
    [['cmd', 'bin'], 'entry'],
    [['serializers', 'blueprints'], 'api'],
    [['docs', 'documentation', 'wiki'], 'documentation'],
    [
      [
        'deploy',
        'deployment',
        'infra',
        'infrastructure',
        'k8s',
        'kubernetes',
        'helm',
        'charts',
        'terraform',
        'tf',
        'docker',
      ],
      'infrastructure',
    ],
    [['.github', '.gitlab', '.circleci'], 'ci-cd'],
  ];
  function matchPattern(dirName) {
    const lower = dirName.toLowerCase();
    for (const [names, label] of patternRules) {
      if (names.includes(lower)) return label;
    }
    return null;
  }
  const patternMatches = {};
  for (const g of Object.keys(directoryGroups)) {
    const m = matchPattern(g);
    if (m) patternMatches[g] = m;
  }

  // H. Deployment topology
  const infraFiles = [];
  let hasDockerfile = false,
    hasCompose = false,
    hasK8s = false,
    hasTerraform = false,
    hasCI = false;
  for (const n of fileNodes) {
    const fp = (n.filePath || '').toLowerCase();
    if (/dockerfile/.test(fp)) {
      hasDockerfile = true;
      infraFiles.push(n.filePath);
    }
    if (/docker-compose/.test(fp)) {
      hasCompose = true;
      infraFiles.push(n.filePath);
    }
    if (
      /\/(k8s|kubernetes|helm|charts)\//.test(fp) ||
      (/\.ya?ml$/.test(fp) && /(k8s|kubernetes)/.test(fp))
    ) {
      hasK8s = true;
      infraFiles.push(n.filePath);
    }
    if (/\.tf$/.test(fp) || /\.tfvars$/.test(fp) || /terraform/.test(fp)) {
      hasTerraform = true;
      infraFiles.push(n.filePath);
    }
    if (/\.github\/workflows/.test(fp) || /\.gitlab-ci/.test(fp) || /jenkinsfile/.test(fp)) {
      hasCI = true;
      infraFiles.push(n.filePath);
    }
  }

  // I. Data pipeline
  const schemaFiles = [],
    migrationFiles = [],
    dataModelFiles = [],
    apiHandlerFiles = [];
  for (const n of fileNodes) {
    const fp = n.filePath || '';
    const lower = fp.toLowerCase();
    if (/\.sql$/.test(lower) && !/migration/.test(lower)) schemaFiles.push(fp);
    if (/schema\.prisma$/.test(lower) || /\.graphql$/.test(lower) || /\.proto$/.test(lower))
      schemaFiles.push(fp);
    if (/migration/.test(lower)) migrationFiles.push(fp);
    if (/\/(models|model)\//.test(lower) || /model\.ts$/.test(lower)) dataModelFiles.push(fp);
    const g = idToGroup[n.id];
    if (patternMatches[g] === 'api') apiHandlerFiles.push(fp);
  }

  // J. Documentation coverage
  const docFilePaths = fileNodes
    .filter((n) => n.type === 'document' || /\.md$/i.test(n.filePath || ''))
    .map((n) => n.filePath);
  let groupsWithDocs = 0;
  const undocumentedGroups = [];
  const totalGroupsForDocs = Object.keys(directoryGroups).length;
  for (const g of Object.keys(directoryGroups)) {
    const hasReadme = directoryGroups[g].some((id) => {
      const n = nodeById.get(id);
      return n && /readme/i.test(n.name || '');
    });
    const hasDocsRef = docFilePaths.some((dp) => dp && dp.toLowerCase().includes(g.toLowerCase()));
    if (hasReadme || hasDocsRef) groupsWithDocs++;
    else undocumentedGroups.push(g);
  }
  const docCoverage = {
    groupsWithDocs,
    totalGroups: totalGroupsForDocs,
    coverageRatio: totalGroupsForDocs > 0 ? groupsWithDocs / totalGroupsForDocs : 0,
    undocumentedGroups,
  };

  // K. Dependency direction
  const dependencyDirection = [];
  const seenPairs = new Set();
  for (const { from, to, count } of interGroupImports) {
    if (from === to) continue;
    const pairKey = [from, to].sort().join('|');
    if (seenPairs.has(pairKey)) continue;
    seenPairs.add(pairKey);
    const reverse = interGroupImports.find((x) => x.from === to && x.to === from);
    const reverseCount = reverse ? reverse.count : 0;
    if (count > reverseCount) {
      dependencyDirection.push({ dependent: from, dependsOn: to });
    } else if (reverseCount > count) {
      dependencyDirection.push({ dependent: to, dependsOn: from });
    }
  }

  // fileStats
  const filesPerGroup = {};
  for (const [g, ids] of Object.entries(directoryGroups)) filesPerGroup[g] = ids.length;
  const nodeTypeCounts = {};
  for (const [t, ids] of Object.entries(nodeTypeGroups)) nodeTypeCounts[t] = ids.length;

  const result = {
    scriptCompleted: true,
    directoryGroups,
    nodeTypeGroups,
    crossCategoryEdges,
    interGroupImports,
    intraGroupDensity,
    patternMatches,
    deploymentTopology: {
      hasDockerfile,
      hasCompose,
      hasK8s,
      hasTerraform,
      hasCI,
      infraFiles: [...new Set(infraFiles)],
    },
    dataPipeline: {
      schemaFiles: [...new Set(schemaFiles)],
      migrationFiles: [...new Set(migrationFiles)],
      dataModelFiles: [...new Set(dataModelFiles)],
      apiHandlerFiles: [...new Set(apiHandlerFiles)],
    },
    docCoverage,
    dependencyDirection,
    fileStats: {
      totalFileNodes: fileNodes.length,
      filesPerGroup,
      nodeTypeCounts,
    },
    fileFanIn,
    fileFanOut,
  };

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log('Analysis complete. Groups:', Object.keys(directoryGroups).length);
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.error('Fatal error:', err.stack || err.message);
  process.exit(1);
}
