# Packet Routing Simulator - Complete Project Details

## 1. What is this Project and Why do we Need it? (Project Need)
**The Problem:** 
In the real world, when you send a message on WhatsApp or load a YouTube video, your data is chopped into tiny pieces called "packets". These packets travel across the world through physical wires and routers. However, the internet is unpredictable—wires get cut, routers get overloaded with traffic (congestion), and paths fail. How do routers instantly know the fastest backup route to send your data?

**The Need (Why we built this):**
Routing algorithms are invisible and hard to understand. We need this project to **visually demonstrate** how networks survive failures. This tool allows students, educators, and network engineers to see exactly how data finds its way through a maze of routers using complex mathematics, making the invisible world of networking visible and interactive.

---

## 2. Innovative Features
This project isn't just a static calculator; it has several innovative and interactive features:
1. **Interactive Drag-and-Drop Canvas:** You can physically drag routers around the screen to design your own custom network geography.
2. **Real-time Link Failure Simulation:** By simply clicking on a connecting line (edge), you can "cut" the wire. The system will instantly recalculate a backup route, simulating a real-world disaster.
3. **Congestion Awareness:** Networks aren't always empty. By turning on "Congestion Aware", the simulator adds random invisible traffic jams to the wires, forcing the packet to take a longer, less obvious route to save time.
4. **Algorithm Benchmarking:** The "Compare Algorithms" feature forces the backend engine to race Dijkstra and Distance Vector against each other 1,000 times to see which one computes faster down to the millisecond.
5. **Live Packet Animation:** You literally watch a visual packet travel node-by-node from the source to the destination, accompanied by a trace log of its journey.

---

## 3. Core Algorithms (In Simple English)
The project relies on two famous network algorithms to find the shortest path:

*   **Dijkstra's Algorithm (Link-State):**
    *   **Example:** Imagine you have a complete GPS map of a city in your car. You can see every single road and traffic jam globally.
    *   **How it works:** Every router is given a full map of the entire network. Because it knows everything, it can instantly calculate the absolute shortest path to the destination. It is very fast but uses a lot of computer memory.
*   **Distance Vector Algorithm (Bellman-Ford):**
    *   **Example:** Imagine you are lost in a city without a map. You stand at an intersection and ask a police officer, "How far to the hospital?" They say, "I don't know the exact roads, but the next guy is 5 minutes away, and he told me he is 10 minutes from the hospital."
    *   **How it works:** Routers do not know the full map. They only know their direct neighbors. They constantly whisper their distances to their neighbors until everyone slowly figures out the best way to go. It requires very little memory but takes longer to react to broken wires.

---

## 4. Object-Oriented Programming (OOP) Concepts Used
This project uses Object-Oriented Programming (OOP) extensively, particularly in the C++ backend (and the JavaScript UI). OOP is a way of writing code where we map real-world objects into computer code.

Here is how the 4 pillars of OOP are used in this project:

### A. Classes and Objects
*   **Concept:** A `Class` is a blueprint. An `Object` is the actual thing built from the blueprint.
*   **Example in Project:** 
    *   We have a blueprint called `class Router`. It dictates that every router must have an ID, an X/Y coordinate, and a list of neighbors.
    *   When you click "+ Add Node", the code creates a brand new **Object** from that blueprint (e.g., `Router 5`).

### B. Encapsulation
*   **Concept:** Hiding the internal data and only letting the outside world interact with it through safe, controlled methods. (Like a capsule hiding the medicine inside).
*   **Example in Project:**
    *   In the C++ backend, a router's "Routing Table" (its list of distances) is marked as `private`. 
    *   Another router cannot just hack in and change Router 1's table. It must use a public method like `updateRoutingTable()`. This keeps the network secure and prevents buggy code from ruining the data.

### C. Inheritance
*   **Concept:** Creating a "Parent" category, and letting "Child" categories inherit its traits so we don't have to rewrite code.
*   **Example in Project:**
    *   We have a generic parent class called `class RoutingAlgorithm`. It contains basic properties like "Start Time" and "End Time".
    *   We then create two child classes: `class Dijkstra` and `class DistanceVector`. Both of these inherit from `RoutingAlgorithm`. We don't have to rewrite the time-tracking code because the children inherited it automatically from the parent!

### D. Polymorphism
*   **Concept:** Meaning "many forms." It allows a single instruction to do different things depending on who is receiving it.
*   **Example in Project:**
    *   Both our `Dijkstra` class and `DistanceVector` class have a function named `calculatePath()`.
    *   In the main server, the code simply says `algorithm.calculatePath()`. 
    *   Because of Polymorphism, the computer knows exactly which version of the calculation to run based on what the user selected in the UI dropdown. The single command takes "many forms".

---

## 5. Technology Stack Summary
*   **Frontend User Interface:** HTML, CSS, JavaScript (SVG for Graphics).
*   **Backend Server:** Node.js (and C++ httplib).
*   **Data Exchange:** JSON (JavaScript Object Notation) is used to pass the network graph from the frontend to the backend engine for calculation.
