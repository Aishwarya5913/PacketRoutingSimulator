#pragma once
#include "Graph.h"
#include <unordered_map>
#include <string>

class RoutingAlgorithm {
public:
    virtual ~RoutingAlgorithm() = default;
    
    // source -> (dest -> next_hop)
    virtual std::unordered_map<std::string, std::unordered_map<std::string, std::string>> 
    computeRoutes(Graph& graph) = 0;
    
    virtual std::string getName() const = 0;
    virtual int getMetadata() const { return 0; } // e.g., convergence rounds for DV
};