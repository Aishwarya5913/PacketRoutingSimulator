# Comprehensive Project Report: Packet Routing Simulator

## 1. Abstract
The **Packet Routing Simulator** is an interactive, web-based software application designed to visualize and benchmark how data packets travel across a network of routers. It provides a real-time, drag-and-drop environment where users can build custom network topologies, simulate physical link failures, and observe how different routing algorithms (Dijkstra's Link-State and Bellman-Ford's Distance Vector) adapt to these changes dynamically. 

## 2. Project Need and Objectives
### The Problem
In modern computer networks, routing algorithms operate silently in the background. When a user requests a web page, the data packets traverse multiple routers, often recalculating paths on the fly due to broken cables or heavy traffic (congestion). For students and engineers, understanding these abstract mathematical processes is difficult without a visual aid.

### The Objective
This project was built to:
1. **Visualize the Invisible:** Turn abstract routing mathematics into a tangible, visual animation where packets can be seen moving node-by-node.
2. **Provide Interactive Learning:** Allow users to actively break connections and see how the network "heals" itself.
3. **Compare Performance:** Provide an empirical benchmark tool to measure the computational latency of different routing algorithms on the exact same dataset.

---

## 3. Innovative Features in Detail
This simulator goes beyond static shortest-path calculators by implementing dynamic, real-world network phenomena:

*   **Custom Topology Builder:** Users are not restricted to a fixed map. Through the interactive SVG canvas, users can add custom routers (nodes) and define custom cables (edges) with specific latency weights.
*   **Real-time Fault Tolerance Testing:** Users can click on any network cable to instantly "cut" it. The simulator instantly recalculates the backup route, demonstrating network resilience.
*   **Congestion Awareness Engine:** By enabling this feature, the backend temporarily inflates the "weight" (latency) of random cables to simulate sudden heavy traffic. The algorithm must intelligently route the packet around this invisible traffic jam.
*   **Split Horizon Loop Prevention:** Specifically for the Distance Vector algorithm, this feature enables "Route Poisoning" logic to prevent the famous *Count-to-Infinity* problem, where disconnected routers loop packets back and forth forever.
*   **Microsecond Benchmarking:** A dedicated comparison engine forces the backend to calculate the shortest path 1,000 times in a loop, recording the execution time down to the millisecond to prove which algorithm is computationally heavier.

---

## 4. Core Algorithms Explained
The core of the simulator relies on two fundamental networking algorithms. 

### A. Dijkstra's Algorithm (Link-State Protocol)
*   **Concept:** Every router is provided with a complete, global map of the entire network. Using this map, the router calculates the absolute shortest path to the destination in one go.
*   **Real-World Analogy:** Having a bird's-eye view from a helicopter or using a complete GPS map to find the best route.
*   **Implementation:** The backend uses a **Priority Queue (Min-Heap)**. It always explores the closest known router first, locking in the shortest distance, and then explores its neighbors. 
*   **Pros & Cons:** Extremely fast to converge and 100% loop-free. However, sharing the entire map with every router requires massive memory and bandwidth (e.g., OSPF protocol).

### B. Distance Vector Algorithm (Bellman-Ford)
*   **Concept:** Routers do *not* have a map of the network. They only know their immediate physical neighbors. They discover routes by constantly asking their neighbors, "How far are you from the destination?" and adding their own distance to the neighbor's answer.
*   **Real-World Analogy:** Navigating a maze by reading signposts at each intersection, without ever seeing a map of the maze.
*   **Implementation:** The backend "relaxes" all active edges mathematically $|V| - 1$ times (where V is the number of routers). 
*   **Pros & Cons:** Requires very little memory and bandwidth (e.g., RIP protocol). However, it adapts very slowly to broken links (slow convergence).

---

## 5. Object-Oriented Programming (OOP) Concepts Used
The software architecture heavily relies on the four pillars of Object-Oriented Programming to maintain clean, modular, and scalable code.

### 1. Classes and Objects
*   **Definition:** A Class is a blueprint that defines properties and behaviors. An Object is an actual instance created from that blueprint.
*   **Project Example:** In the frontend (`graph-ui.js`), there is a `class GraphUI`. It defines the blueprint for how a network grid should behave. When the app starts, we create an Object: `const ui = new GraphUI("visualization");`. Similarly, every Router on the screen is treated as a unique object containing its own specific `id`, `x`, and `y` coordinates.

### 2. Encapsulation
*   **Definition:** The bundling of data (variables) and methods (functions) into a single unit, hiding the internal state from outside interference.
*   **Project Example:** Inside the `GraphUI` class, the arrays holding the raw SVG elements (`this.nodes` and `this.edges`) are encapsulated. The main application (`app.js`) cannot randomly change an SVG circle's radius directly. Instead, `app.js` must call controlled public methods like `ui.drawGraph()` or `ui.animatePacket()`. This protects the visual state from being corrupted by rogue data.

### 3. Inheritance
*   **Definition:** A mechanism where a new class inherits properties and behaviors from an existing parent class, promoting code reusability.
*   **Project Example:** In the backend C++ architecture (`algorithms/`), there is a parent class called `RoutingAlgorithm`. It holds common logic like `startTimer()`, `stopTimer()`, and `logTrace()`. The specific algorithms (`class Dijkstra` and `class DistanceVector`) **inherit** from `RoutingAlgorithm`. The developer did not have to rewrite the timer logic in both files, saving time and preventing bugs.

### 4. Polymorphism
*   **Definition:** The ability of different objects to respond to the exact same method call in their own unique way.
*   **Project Example:** Both the `Dijkstra` and `DistanceVector` modules have a function named `calculateShortestPath(source, target)`. When the API receives a request, the server simply calls `algorithm.calculateShortestPath()`. The server doesn't need to write completely different if/else blocks to handle the math—thanks to polymorphism, the selected algorithm object intrinsically knows how to execute its specific version of that method.

---

## 6. System Architecture & Tech Stack
*   **Frontend UI:** HTML5, CSS3, and Vanilla JavaScript.
*   **Graphics Rendering:** SVG (Scalable Vector Graphics) manipulated via the DOM for crisp, lightweight, and hardware-accelerated animations.
*   **Backend Server:** Node.js (`http` module).
*   **Data Exchange:** The frontend packages the nodes, edges, algorithm choice, and custom options into a **JSON payload**. It sends this via a POST request to `/api/simulate`. The backend computes the shortest path mathematically and returns a JSON response containing the `totalCost`, `hops`, `computeTimeMs`, and an array of steps (`trace`) for the frontend to animate.

---

## 7. How to Setup and Run
1. Ensure **Node.js** is installed on your computer.
2. Open the `PACKETSIMULATOR` folder in VS Code or any terminal.
3. Run the command: `node server.js`
4. Open a web browser and navigate to `http://localhost:8080`.
5. **To use:** Add nodes and edges using the left panel, select your source and destination, choose an algorithm, and click **Run Simulation** to watch the packet travel.
