class GraphUI {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        this.ns = "http://www.w3.org/2000/svg";
        this.nodes = {};
        this.edges = {};
        this.currentPacket = null;
    }

    clear() {
        this.svg.innerHTML = '';
        this.nodes = {};
        this.edges = {};
        
        // Dot Grid Background
        const defs = document.createElementNS(this.ns, "defs");
        const pattern = document.createElementNS(this.ns, "pattern");
        pattern.setAttribute("id", "grid");
        pattern.setAttribute("width", "30");
        pattern.setAttribute("height", "30");
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        
        const circle = document.createElementNS(this.ns, "circle");
        circle.setAttribute("cx", "15"); circle.setAttribute("cy", "15");
        circle.setAttribute("r", "1"); circle.setAttribute("fill", "#CBD5E1");
        
        pattern.appendChild(circle);
        defs.appendChild(pattern);
        this.svg.appendChild(defs);
        
        const rect = document.createElementNS(this.ns, "rect");
        rect.setAttribute("width", "100%"); rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "url(#grid)");
        this.svg.appendChild(rect);
    }

    drawGraph(graphData) {
        this.clear();
        const srcNodeId = document.getElementById("sourceNode") ? document.getElementById("sourceNode").value : null;
        const dstNodeId = document.getElementById("destNode") ? document.getElementById("destNode").value : null;

        // Draw Edges
        graphData.edges.forEach(e => {
            const source = graphData.nodes.find(n => n.id === e.source);
            const target = graphData.nodes.find(n => n.id === e.target);
            if (source && target) {
                const line = document.createElementNS(this.ns, "line");
                line.setAttribute("x1", source.x); line.setAttribute("y1", source.y);
                line.setAttribute("x2", target.x); line.setAttribute("y2", target.y);
                line.setAttribute("class", e.active ? "edge" : "edge failed");
                this.svg.appendChild(line);
                
                this.edges[e.id] = { line, source, target, model: e };

                const bg = document.createElementNS(this.ns, "rect");
                bg.setAttribute("class", "edge-bg");
                const text = document.createElementNS(this.ns, "text");
                text.setAttribute("class", "edge-text");
                text.textContent = e.weight;
                
                this.svg.appendChild(bg);
                this.svg.appendChild(text);
                
                const updateLabelPos = () => {
                    const mx = (parseFloat(line.getAttribute("x1")) + parseFloat(line.getAttribute("x2"))) / 2;
                    const my = (parseFloat(line.getAttribute("y1")) + parseFloat(line.getAttribute("y2"))) / 2;
                    text.setAttribute("x", mx); text.setAttribute("y", my);
                    text.setAttribute("dominant-baseline", "middle"); text.setAttribute("text-anchor", "middle");
                    const bbox = text.getBBox();
                    bg.setAttribute("x", bbox.x - 4); bg.setAttribute("y", bbox.y - 2);
                    bg.setAttribute("width", bbox.width + 8); bg.setAttribute("height", bbox.height + 4);
                };
                setTimeout(updateLabelPos, 0);
                this.edges[e.id].updateLabelPos = updateLabelPos;

                // Toggle failure state
                line.addEventListener("click", () => {
                    e.active = !e.active;
                    line.setAttribute("class", e.active ? "edge" : "edge failed");
                    window.dispatchEvent(new Event('graph-updated'));
                });
            }
        });

        // Draw Nodes
        graphData.nodes.forEach(n => {
            const group = document.createElementNS(this.ns, "g");
            group.setAttribute("class", "node-group");
            
            const outerCircle = document.createElementNS(this.ns, "circle");
            outerCircle.setAttribute("cx", 0); outerCircle.setAttribute("cy", 0);
            outerCircle.setAttribute("r", 20); outerCircle.setAttribute("class", "node-outer");
            
            const innerCircle = document.createElementNS(this.ns, "circle");
            innerCircle.setAttribute("cx", 0); innerCircle.setAttribute("cy", 0);
            innerCircle.setAttribute("r", 8); innerCircle.setAttribute("class", "node-inner");
            
            if (n.id === srcNodeId) { outerCircle.style.stroke = "var(--source-color)"; innerCircle.style.fill = "var(--source-color)"; }
            else if (n.id === dstNodeId) { outerCircle.style.stroke = "var(--dest-color)"; innerCircle.style.fill = "var(--dest-color)"; }

            const label = document.createElementNS(this.ns, "text");
            label.setAttribute("x", 0); label.setAttribute("y", 35);
            label.setAttribute("class", "node-label"); label.textContent = n.name || n.id;

            group.appendChild(outerCircle); group.appendChild(innerCircle); group.appendChild(label);
            group.setAttribute("transform", `translate(${n.x}, ${n.y})`);
            this.svg.appendChild(group);
            this.nodes[n.id] = { group, x: n.x, y: n.y, model: n };

            // Drag
            let isDragging = false;
            let hasDragged = false;
            outerCircle.addEventListener('mousedown', (e) => { isDragging = true; hasDragged = false; e.stopPropagation(); });
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                hasDragged = true;
                const rect = this.svg.getBoundingClientRect();
                const newX = Math.round(e.clientX - rect.left); const newY = Math.round(e.clientY - rect.top);
                group.setAttribute("transform", `translate(${newX}, ${newY})`);
                this.nodes[n.id].x = newX; this.nodes[n.id].y = newY; n.x = newX; n.y = newY;

                Object.values(this.edges).forEach(ed => {
                    if (ed.source.id === n.id) { ed.line.setAttribute("x1", newX); ed.line.setAttribute("y1", newY); }
                    if (ed.target.id === n.id) { ed.line.setAttribute("x2", newX); ed.line.setAttribute("y2", newY); }
                    if (ed.source.id === n.id || ed.target.id === n.id) ed.updateLabelPos();
                });
            });
            document.addEventListener('mouseup', () => { isDragging = false; });
            outerCircle.addEventListener('click', (e) => {
                if (!hasDragged) {
                    window.dispatchEvent(new CustomEvent('node-clicked', { detail: n.id }));
                }
            });
        });
    }

    clearActiveRoutes() {
        Object.values(this.edges).forEach(e => {
            if (e.model.active) e.line.setAttribute("class", "edge");
        });
        if (this.currentPacket) {
            this.currentPacket.remove();
            this.currentPacket = null;
        }
    }

    async animatePacket(trace) {
        this.clearActiveRoutes();
        if (!trace || trace.length === 0) return;

        this.currentPacket = document.createElementNS(this.ns, "circle");
        this.currentPacket.setAttribute("r", "8");
        this.currentPacket.setAttribute("class", "packet-marker");
        this.svg.appendChild(this.currentPacket);

        let startNode = this.nodes[trace[0].node];
        if (!startNode) return;
        this.currentPacket.setAttribute("cx", startNode.x);
        this.currentPacket.setAttribute("cy", startNode.y);

        return new Promise(async (resolve) => {
            window.cancelAnimation = false;
            const duration = 600;

            for (let i = 0; i < trace.length; i++) {
                if (window.cancelAnimation) break;
                const step = trace[i];
                const targetNode = this.nodes[step.node];
                
                if (i > 0 && targetNode) {
                    if (step.edge && this.edges[step.edge]) {
                        this.edges[step.edge].line.classList.add("active-route");
                    }
                    
                    const startX = parseFloat(this.currentPacket.getAttribute("cx"));
                    const startY = parseFloat(this.currentPacket.getAttribute("cy"));
                    
                    await new Promise(r => {
                        let startTime = performance.now();
                        const frame = (t) => {
                            if (window.cancelAnimation) return r();
                            let p = Math.min((t - startTime) / duration, 1);
                            let eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                            this.currentPacket.setAttribute("cx", startX + (targetNode.x - startX) * eased);
                            this.currentPacket.setAttribute("cy", startY + (targetNode.y - startY) * eased);
                            if (p < 1) requestAnimationFrame(frame);
                            else r();
                        };
                        requestAnimationFrame(frame);
                    });
                }
                
                if (typeof window.logTrace === "function") {
                    window.logTrace(step.message || `Arrived at ${targetNode.model.name}`);
                }
                
                if (i < trace.length - 1) {
                    await new Promise(r => setTimeout(r, 200));
                }
            }
            resolve();
        });
    }
}