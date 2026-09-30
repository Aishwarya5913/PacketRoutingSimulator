#pragma once
#include "RoutingAlgorithm.h"

class DistanceVectorRouter : public RoutingAlgorithm {
public:
    std::unordered_map<std::string, std::unordered_map<std::string, std::string>> 
    computeRoutes(Graph& graph) override;
    
    std::string getName() const override { return "Distance Vector"; }
    int getMetadata() const override { return convergenceRounds; }
    
private:
    int maxIterations = 100;
    bool splitHorizon = true;
    int convergenceRounds = 0;
};