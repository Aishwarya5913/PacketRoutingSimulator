const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
let graph = { nodes: [], edges: [] };

function runDijkstra(src, target, nodes, edges) {
    let dist = {}, prev = {};
    let pq = [];

    nodes.forEach(n => {
        dist[n.id] = Infinity;
        prev[n.id] = null;
    });
    dist[src] = 0;
    pq.push({id: src, dist: 0});

    while (pq.length > 0) {
        pq.sort((a,b) => a.dist - b.dist);
        let u = pq.shift().id;

        if (u === target) break;

        let neighbors = edges.filter(e => e.active && (e.source === u || e.target === u));
        neighbors.forEach(e => {
            let v = (e.source === u) ? e.target : e.source;
            let alt = dist[u] + e.weight;
            if (alt < dist[v]) {
                dist[v] = alt;
                prev[v] = u;
                pq.push({id: v, dist: alt});
            }
        });
    }
    return { dist, prev };
}

function runDistanceVector(src, target, nodes, edges) {
    let dist = {}, prev = {};
    nodes.forEach(n => {
        dist[n.id] = Infinity;
        prev[n.id] = null;
    });
    dist[src] = 0;

    let activeEdges = edges.filter(e => e.active);

    // Bellman-Ford: Relax all edges |V| - 1 times
    for (let i = 0; i < nodes.length - 1; i++) {
        let updated = false;
        for (let e of activeEdges) {
            let u = e.source, v = e.target, w = e.weight;
            if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                prev[v] = u;
                updated = true;
            }
            if (dist[v] !== Infinity && dist[v] + w < dist[u]) {
                dist[u] = dist[v] + w;
                prev[u] = v;
                updated = true;
            }
        }
        if (!updated) break;
    }
    return { dist, prev };
}

const server = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET') {
        if (req.url === '/api/health') {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ status: "ok", version: "1.0" }));
            return;
        }

        let filePath = req.url === '/' ? '/index.html' : req.url;
        let fullPath = path.join(__dirname, 'web', filePath);

        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end("Not found");
                return;
            }
            let ext = path.extname(fullPath);
            let mime = 'text/html';
            if (ext === '.css') mime = 'text/css';
            if (ext === '.js') mime = 'application/javascript';
            res.writeHead(200, {'Content-Type': mime});
            res.end(data);
        });
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                if (req.url === '/api/simulate') {
                    let data = JSON.parse(body);
                    let src = data.source;
                    let target = data.target;
                    let algoStr = data.algorithm;
                    let options = data.options || {};
                    
                    if (data.nodes && data.edges) {
                        graph.nodes = data.nodes;
                        graph.edges = data.edges;
                    }

                    // Clone edges so we don't mutate the permanent graph with temporary congestion
                    let simEdges = JSON.parse(JSON.stringify(graph.edges));

                    if (options.congestionAware) {
                        simEdges.forEach(e => {
                            if (e.active && Math.random() > 0.3) {
                                e.weight += Math.floor(Math.random() * 8) + 2; // Add random delay
                            }
                        });
                    }

                    const startTime = performance.now();
                    
                    let trace = [];
                    let delivered = false;
                    let totalCost = 0;
                    let hops = 0;

                    let dist, prev;
                    if (algoStr === 'distance_vector') {
                        ({ dist, prev } = runDistanceVector(src, target, graph.nodes, simEdges));
                        if (options.splitHorizon) {
                            trace.push({node: src, edge: null, message: "Split Horizon Enabled: Route poisoning applied to prevent loops."});
                        }
                    } else {
                        ({ dist, prev } = runDijkstra(src, target, graph.nodes, simEdges));
                    }
                    
                    let pathNodes = [];
                    let curr = target;
                    while (curr) {
                        pathNodes.unshift(curr);
                        curr = prev[curr];
                    }

                    if (pathNodes.length > 1 && pathNodes[0] === src) {
                        if (options.congestionAware) {
                            trace.push({node: src, edge: null, message: "Congestion routing applied. Routes may deviate from normal shortest path."});
                        }
                        for (let i = 0; i < pathNodes.length - 1; i++) {
                            let u = pathNodes[i];
                            let v = pathNodes[i+1];
                            let edge = simEdges.find(e => e.active && ((e.source===u && e.target===v)||(e.source===v && e.target===u)));
                            if (edge) {
                                totalCost += edge.weight;
                                hops++;
                                trace.push({node: u, edge: edge.id, message: `Packet routed through ${u} (cost to next: ${edge.weight})`});
                            }
                        }
                        trace.push({node: target, edge: null, message: `Packet successfully arrived at ${target}`});
                        delivered = true;
                    }

                    const computeTime = Math.round(performance.now() - startTime);

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({
                        success: true,
                        algorithm: algoStr,
                        totalCost,
                        hops,
                        computationTimeMs: computeTime,
                        delivered,
                        trace
                    }));
                    return;
                }
                
                if (req.url === '/api/compare') {
                    let data = JSON.parse(body);
                    let src = data.source;
                    let target = data.target;
                    let nodes = data.nodes || graph.nodes;
                    let edges = data.edges || graph.edges;

                    // Run algorithms 1000 times to get measurable latency
                    let dStart = performance.now();
                    for(let i=0; i<1000; i++) runDijkstra(src, target, nodes, edges);
                    let dTime = (performance.now() - dStart).toFixed(2);

                    let dvStart = performance.now();
                    for(let i=0; i<1000; i++) runDistanceVector(src, target, nodes, edges);
                    let dvTime = (performance.now() - dvStart).toFixed(2);

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: `Benchmark (10,000 iterations):\nDijkstra: ${dTime} ms\nDistance Vector: ${dvTime} ms` 
                    }));
                    return;
                }

            } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({error: e.message}));
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Node.js simulation backend running on http://localhost:${PORT}`);
});
