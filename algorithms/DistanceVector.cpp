#include "DistanceVector.h"
#include <limits>

std::unordered_map<std::string, std::unordered_map<std::string, std::string>> 
DistanceVectorRouter::computeRoutes(Graph& graph) {
    auto nodes = graph.getNodes();
    std::unordered_map<std::string, std::unordered_map<std::string, double>> dist;
    std::unordered_map<std::string, std::unordered_map<std::string, std::string>> nextHop;

    bool useCongestion = graph.isCongestionAware();
    bool useConfidence = graph.isConfidenceAware();
    convergenceRounds = 0;

    for (const auto& u : nodes) {
        for (const auto& v : nodes) {
            if (u.getId() == v.getId()) {
                dist[u.getId()][v.getId()] = 0;
                nextHop[u.getId()][v.getId()] = u.getId();
            } else {
                dist[u.getId()][v.getId()] = std::numeric_limits<double>::infinity();
            }
        }
    }

    for (const auto& edge : graph.getEdges()) {
        if (!edge.isActive()) continue;
        std::string u = edge.getSourceId();
        std::string v = edge.getTargetId();
        double w = edge.getEffectiveCost(useCongestion, useConfidence);
        
        dist[u][v] = w; nextHop[u][v] = v;
        dist[v][u] = w; nextHop[v][u] = u;
    }

    bool changed = true;
    while (changed && convergenceRounds < maxIterations) {
        changed = false;
        convergenceRounds++;

        for (const auto& i : nodes) {
            std::string u = i.getId();
            for (Edge* edge : graph.getAdjacentEdges(u)) {
                std::string v = (edge->getSourceId() == u) ? edge->getTargetId() : edge->getSourceId();
                double costToV = edge->getEffectiveCost(useCongestion, useConfidence);
                
                for (const auto& j : nodes) {
                    std::string dest = j.getId();
                    if (dist[v][dest] != std::numeric_limits<double>::infinity()) {
                        if (splitHorizon && nextHop[v].find(dest) != nextHop[v].end() && nextHop[v][dest] == u) {
                            continue;
                        }
                        double newDist = costToV + dist[v][dest];
                        if (newDist < dist[u][dest]) {
                            dist[u][dest] = newDist;
                            nextHop[u][dest] = v;
                            changed = true;
                        }
                    }
                }
            }
        }
    }

    std::unordered_map<std::string, std::unordered_map<std::string, std::string>> finalRoutes;
    for (const auto& u : nodes) {
        for (const auto& v : nodes) {
            if (u.getId() != v.getId() && nextHop.find(u.getId()) != nextHop.end() && nextHop[u.getId()].find(v.getId()) != nextHop[u.getId()].end()) {
                finalRoutes[u.getId()][v.getId()] = nextHop[u.getId()][v.getId()];
            }
        }
    }
    return finalRoutes;
}