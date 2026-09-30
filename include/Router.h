#pragma once
#include "RoutingAlgorithm.h"
#include "Graph.h"
#include "Packet.h"
#include <memory>
#include <string>

class Router {
public:
    Router(Graph& graph, std::unique_ptr<RoutingAlgorithm> algo);

    void updateRoutingTables();
    void simulatePacket(Packet& packet);
    
    std::string getAlgorithmName() const;
    int getMetadata() const;

private:
    Graph& graph;
    std::unique_ptr<RoutingAlgorithm> algorithm;
    std::unordered_map<std::string, std::unordered_map<std::string, std::string>> routingTables;
};