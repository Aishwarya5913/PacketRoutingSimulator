let graph = {
    nodes: [],
    edges: []
};
const ui = new GraphUI("visualization");

function showToast(msg, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function generateDemoGraph() {
    return {
        nodes: [
            { id: "R1", name: "Router 1", x: 100, y: 100 },
            { id: "R2", name: "Router 2", x: 300, y: 100 },
            { id: "R3", name: "Router 3", x: 500, y: 100 },
            { id: "R4", name: "Router 4", x: 100, y: 300 },
            { id: "R5", name: "Router 5", x: 300, y: 300 },
            { id: "R6", name: "Router 6", x: 500, y: 300 },
            { id: "R7", name: "Router 7", x: 300, y: 500 }
        ],
        edges: [
            { id: "e1", source: "R1", target: "R2", weight: 4, active: true },
            { id: "e2", source: "R2", target: "R3", weight: 3, active: true },
            { id: "e3", source: "R1", target: "R4", weight: 2, active: true },
            { id: "e4", source: "R2", target: "R5", weight: 3, active: true },
            { id: "e5", source: "R3", target: "R6", weight: 2, active: true },
            { id: "e6", source: "R4", target: "R5", weight: 3, active: true },
            { id: "e7", source: "R5", target: "R6", weight: 2, active: true },
            { id: "e8", source: "R4", target: "R7", weight: 4, active: true },
            { id: "e9", source: "R6", target: "R7", weight: 3, active: true }
        ]
    };
}

function updateSelects() {
    const src = document.getElementById("sourceNode");
    const dst = document.getElementById("destNode");
    const srcVal = src.value;
    const dstVal = dst.value;
    
    src.innerHTML = ''; dst.innerHTML = '';
    graph.nodes.forEach(n => {
        src.add(new Option(n.name, n.id));
        dst.add(new Option(n.name, n.id));
    });
    
    if(srcVal) src.value = srcVal;
    if(dstVal) dst.value = dstVal;
    else if (graph.nodes.length > 1) dst.value = graph.nodes[graph.nodes.length-1].id;
    
    ui.drawGraph(graph);
}

document.getElementById("btnLoadDemo").addEventListener("click", () => {
    graph = generateDemoGraph();
    updateSelects();
});

document.getElementById("btnClear").addEventListener("click", () => {
    graph = { nodes: [], edges: [] };
    updateSelects();
    document.getElementById("logContent").innerHTML = "";
});

let appMode = 'idle';
let edgeStartNode = null;

document.getElementById("btnAddNode").addEventListener("click", () => {
    appMode = 'add_node';
    showToast("Click anywhere on the grid to add a node", "info");
});

document.getElementById("btnAddEdge").addEventListener("click", () => {
    appMode = 'add_edge';
    edgeStartNode = null;
    showToast("Click two nodes to connect them", "info");
});

document.getElementById("visualization").addEventListener("click", (e) => {
    if (appMode === 'add_node') {
        if (e.target.tagName !== 'svg' && e.target.tagName !== 'rect') return;
        const rect = document.getElementById("visualization").getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        const id = "R" + (graph.nodes.length + 1);
        graph.nodes.push({ id: id, name: "Router " + (graph.nodes.length + 1), x: x, y: y });
        updateSelects();
        showToast(`Added node ${id}`, "success");
    }
});

window.addEventListener('node-clicked', (e) => {
    if (appMode === 'add_edge') {
        const clickedNodeId = e.detail;
        if (!edgeStartNode) {
            edgeStartNode = clickedNodeId;
            showToast(`Selected ${clickedNodeId}. Now click target node.`, "info");
        } else {
            if (edgeStartNode !== clickedNodeId) {
                const weightStr = prompt("Enter edge weight (e.g. 1-10):", "1");
                if (weightStr !== null) {
                    const weight = parseInt(weightStr) || 1;
                    const edgeId = "e" + (graph.edges.length + 1);
                    graph.edges.push({
                        id: edgeId,
                        source: edgeStartNode,
                        target: clickedNodeId,
                        weight: weight,
                        active: true
                    });
                    updateSelects();
                    showToast(`Added edge between ${edgeStartNode} and ${clickedNodeId}`, "success");
                }
            }
            edgeStartNode = null;
        }
    }
});


[document.getElementById("sourceNode"), document.getElementById("destNode")].forEach(el => {
    el.addEventListener("change", () => ui.drawGraph(graph));
});

window.logTrace = function(msg) {
    const log = document.getElementById("logContent");
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `<span class="log-time">[${new Date().toLocaleTimeString()}]</span> <span class="log-msg">${msg}</span>`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
};

async function runSimulation() {
    if (graph.nodes.length < 2) return showToast("Load a graph first", "error");
    window.cancelAnimation = true; // Stop ongoing animation
    
    const payload = {
        source: document.getElementById("sourceNode").value,
        target: document.getElementById("destNode").value,
        algorithm: document.getElementById("algorithm").value,
        nodes: graph.nodes,
        edges: graph.edges,
        options: {
            congestionAware: document.getElementById("chkCongestion").checked,
            splitHorizon: document.getElementById("chkSplitHorizon").checked
        }
    };
    
    document.getElementById("resStatus").textContent = "Computing...";
    document.getElementById("logContent").innerHTML = "";
    
    try {
        const res = await API.simulate(payload);
        
        if (!res.success || !res.delivered) {
            document.getElementById("resStatus").textContent = "Failed";
            showToast("No route exists (or backend failed)", "error");
            return;
        }
        
        document.getElementById("resStatus").textContent = "Success";
        document.getElementById("resCost").textContent = res.totalCost;
        document.getElementById("resHops").textContent = res.hops;
        const timeMs = Number(res.computationTimeMs);
        if (isNaN(timeMs)) {
            document.getElementById("resTime").textContent = "-";
        } else if (timeMs < 1) {
            const timeUs = Math.round(timeMs * 1000);
            document.getElementById("resTime").textContent = `${timeMs.toFixed(3)} ms (${timeUs} µs)`;
        } else {
            document.getElementById("resTime").textContent = `${timeMs.toFixed(2)} ms`;
        }
        
        ui.animatePacket(res.trace);
        
    } catch (e) {
        showToast("Backend connection failed.", "error");
        document.getElementById("resStatus").textContent = "Error";
    }
}

document.getElementById("btnSimulate").addEventListener("click", runSimulation);

document.getElementById("btnCompare").addEventListener("click", async () => {
    if (graph.nodes.length < 2) return showToast("Load a graph first", "error");
    document.getElementById("btnCompare").textContent = "Comparing...";
    try {
        const payload = {
            source: document.getElementById("sourceNode").value,
            target: document.getElementById("destNode").value,
            nodes: graph.nodes,
            edges: graph.edges
        };
        const res = await fetch('/api/compare', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        }).then(r => r.json());
        
        if (res.success) {
            alert(res.message);
        } else {
            showToast("Comparison failed", "error");
        }
    } catch (e) {
        showToast("Backend connection failed.", "error");
    }
    document.getElementById("btnCompare").textContent = "Compare Algorithms";
});

// Re-run simulation instantly if graph topology changes (an edge is clicked)
window.addEventListener('graph-updated', () => {
    if(document.getElementById("resStatus").textContent === "Success") {
        runSimulation();
    }
});

// Health Checker Loop
setInterval(async () => {
    const isUp = await API.checkHealth();
    const badge = document.getElementById("serverStatus");
    if (isUp) {
        badge.textContent = "● Server Connected";
        badge.className = "status-badge connected";
    } else {
        badge.textContent = "● Server Offline (Start :8080)";
        badge.className = "status-badge offline";
    }
}, 3000);

// Init
graph = generateDemoGraph();
updateSelects();