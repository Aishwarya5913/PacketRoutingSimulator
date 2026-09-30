#include "Dijkstra.h"
#include <queue>
#include <limits>

std::unordered_map<std::string, std::unordered_map<std::string, std::string>> 
DijkstraRouter::computeRoutes(Graph& graph) {
    std::unordered_map<std::string, std::unordered_map<std::string, std::string>> allRoutes;
    auto nodes = graph.getNodes();

    bool useCongestion = graph.isCongestionAware();
    bool useConfidence = graph.isConfidenceAware();

    for (const auto& src : nodes) {
        std::unordered_map<std::string, double> dist;
        std::unordered_map<std::string, std::string> prev;
        
        for (const auto& n : nodes) {
            dist[n.getId()] = std::numeric_limits<double>::infinity();
        }
        dist[src.getId()] = 0;

        using P = std::pair<double, std::string>;
        std::priority_queue<P, std::vector<P>, std::greater<P>> pq;
        pq.push({0, src.getId()});

        while (!pq.empty()) {
            double d = pq.top().first;
            std::string u = pq.top().second;
            pq.pop();

            if (d > dist[u]) continue;

            for (Edge* edge : graph.getAdjacentEdges(u)) {
                std::string v = (edge->getSourceId() == u) ? edge->getTargetId() : edge->getSourceId();
                double alt = dist[u] + edge->getEffectiveCost(useCongestion, useConfidence);
                
                if (alt < dist[v]) {
                    dist[v] = alt;
                    prev[v] = u;
                    pq.push({alt, v});
                }
            }
        }

        // Build routing table for src
        for (const auto& n : nodes) {
            if (n.getId() == src.getId() || dist[n.getId()] == std::numeric_limits<double>::infinity()) continue;
            
            std::string curr = n.getId();
            while (prev.find(curr) != prev.end() && prev[curr] != src.getId()) {
                curr = prev[curr];
            }
            if (prev.find(curr) != prev.end()) {
                allRoutes[src.getId()][n.getId()] = curr;
            }
        }
    }
    return allRoutes;
}