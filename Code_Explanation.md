# In-Depth Technical Architecture & Code Explanation

This document provides a highly detailed, line-by-line conceptual breakdown of the Packet Routing Simulator. It is designed to explain the exact mechanics, data structures, and computer science principles used to make the application function.

---

## 1. Deep Dive: C++ Concepts & Implementation
The C++ backend is designed for high-performance computing. It uses Modern C++ (C++17) to process complex network graphs in microseconds.

### A. The Adjacency List (Graph Representation)
In computer science, networks are represented as graphs. Rather than creating a massive 2D matrix of every router, the code uses an **Adjacency List** for memory efficiency.
*   **The Code:** `std::unordered_map<string, vector<pair<string, int>>> adj;`
*   **Explanation:** 
    *   `std::unordered_map`: This is a Hash Table. It allows O(1) instant lookup. The "Key" is the Router ID (a `string` like "R1").
    *   The "Value" is a `std::vector` (a dynamic array) containing pairs. 
    *   `std::pair<string, int>`: Represents the neighbor's ID and the weight of the cable connecting them.
    *   *Result:* We can instantly ask, "Who is R1 connected to?" and get a lightweight list of neighbors.

### B. Min-Heap Priority Queue (Dijkstra's Engine)
Dijkstra's algorithm requires us to always process the closest unvisited router first.
*   **The Code:** `std::priority_queue<pair<int, string>, vector<pair<int, string>>, greater<pair<int, string>>> pq;`
*   **Explanation:** 
    *   A standard queue is "First In, First Out". A *Priority Queue* automatically sorts items so the "most important" is always at the front.
    *   We use `std::greater` to reverse the default sorting, turning it into a **Min-Heap**. This ensures that the router with the *smallest* current distance (`int`) is always popped first, guaranteeing mathematical accuracy for the shortest path.

### C. Memory Management (Pass-by-Reference)
*   **The Code:** `json Simulator::runSimulation(const json& request)`
*   **Explanation:** When the web server receives a massive JSON payload (maybe containing 10,000 routers), passing it to the simulator normally would create a complete clone of the data in the RAM, slowing down the server.
    *   The `&` symbol means **Pass-by-Reference**. We just pass the memory address of the JSON.
    *   The `const` keyword ensures the Simulator is physically blocked from altering the original data. This guarantees memory safety while maximizing speed.

---

## 2. Deep Dive: Node.js Backend (`server.js`)
Because the user may not have a C++ compiler, a fallback backend was written in raw Node.js.

### A. Raw HTTP Server (No Frameworks)
Unlike typical web apps that use bulky frameworks like Express.js, this project uses Node's bare-metal `http` module.
*   **CORS Management:** `res.setHeader('Access-Control-Allow-Origin', '*');` is manually injected. This tells the browser, "It is safe to accept data from this server," bypassing strict browser security policies that normally block cross-origin requests.
*   **Data Streaming:** When the frontend sends a large network graph, it doesn't arrive all at once. It arrives in packets (chunks).
    *   **The Code:** `req.on('data', chunk => body += chunk.toString());`
    *   **Explanation:** The server listens for data streams, stitching the chunks of text together until `req.on('end')` fires, at which point it parses the full string into a JSON object.

---

## 3. Deep Dive: Frontend Architecture (`web/js/`)

### A. SVG DOM Manipulation (`graph-ui.js`)
The visualization does not use an HTML `<canvas>`. It uses **SVG (Scalable Vector Graphics)**.
*   **The Concept:** SVGs are mathematically defined shapes. Unlike a canvas (which is just pixels), every router and wire in the SVG is a real HTML element that the mouse can interact with.
*   **Namespace (`createElementNS`):** Standard HTML tags (`<div>`, `<p>`) use the standard DOM. SVGs exist in a different XML namespace. To create a circle via JavaScript, the code *must* use `document.createElementNS("http://www.w3.org/2000/svg", "circle")`.
*   **Dragging Math:** When you drag a node, the code uses `getBoundingClientRect()` to figure out where the SVG canvas exists relative to your monitor screen. It subtracts this offset from your mouse's `clientX` position to perfectly map your screen pixel to the internal SVG coordinate system.

### B. The Animation Physics
When a packet travels, it doesn't just teleport; it slides smoothly.
*   **The Code:** `requestAnimationFrame(frame)`
*   **Explanation:** Using `setTimeout` for animation causes screen tearing and stuttering. `requestAnimationFrame` tells the user's graphics card (GPU) and monitor to sync the animation exactly to the monitor's refresh rate (e.g., 60 frames per second).
*   **Easing Functions:** To make the packet look natural, it doesn't move at a linear speed. The code uses a mathematical polynomial easing function (`2 * p * p`) so the packet gently accelerates out of the router and decelerates as it approaches the next one.

---

## 4. The Client-Server Connection (The JSON Contract)
How do the UI and the math engine actually talk to each other? They use a strict data contract called JSON.

### Step 1: The Request (Frontend -> Backend)
When you click "Run Simulation", `app.js` bundles the entire state of the UI into a text string and POSTs it to the server.
```json
{
  "source": "R1",
  "target": "R3",
  "algorithm": "distance_vector",
  "options": {
    "congestionAware": true,
    "splitHorizon": true
  },
  "nodes": [ {"id":"R1", "x":100, "y":100}, {"id":"R3", "x":500, "y":100} ],
  "edges": [ {"id":"e1", "source":"R1", "target":"R3", "weight":4, "active":true} ]
}
```

### Step 2: The Computation
The backend server receives this text, parses it, executes the Bellman-Ford or Dijkstra algorithm, and creates a step-by-step trace of exactly what happened.

### Step 3: The Response (Backend -> Frontend)
The server responds with a strictly formatted answer.
```json
{
  "success": true,
  "algorithm": "distance_vector",
  "totalCost": 4,
  "hops": 1,
  "computationTimeMs": 2,
  "delivered": true,
  "trace": [
    { "node": "R1", "edge": "e1", "message": "Packet routed through R1 (cost to next: 4)" },
    { "node": "R3", "edge": null, "message": "Packet successfully arrived at R3" }
  ]
}
```
Upon receiving this, `app.js` reads `res.totalCost` to update the scoreboard, and hands the `trace` array to the `GraphUI.animatePacket()` function, which begins the visual rendering loop.
