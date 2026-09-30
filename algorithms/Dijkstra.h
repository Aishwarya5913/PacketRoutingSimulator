#pragma once
#include "RoutingAlgorithm.h"

class DijkstraRouter : public RoutingAlgorithm {
public:
    std::unordered_map<std::string, std::unordered_map<std::string, std::string>> 
    computeRoutes(Graph& graph) override;
    
    std::string getName() const override { return "Dijkstra"; }
};