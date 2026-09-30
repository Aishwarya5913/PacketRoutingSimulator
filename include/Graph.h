#pragma once
#include "Node.h"
#include "Edge.h"
#include <vector>
#include <unordered_map>
#include <string>

class Graph {
public:
    Graph() = default;

    void addNode(const Node& node);
    void addEdge(const Edge& edge);

    std::vector<Node> getNodes() const;
    std::vector<Edge> getEdges() const;
    
    Node* getNode(const std::string& id);
    Edge* getEdge(const std::string& id);

    // Returns active edges connected to a node
    std::vector<Edge*> getAdjacentEdges(const std::string& nodeId);

    // Global settings for cost calculation
    void setOptions(bool useCongestion, bool useConfidence);
    bool isCongestionAware() const { return useCongestion; }
    bool isConfidenceAware() const { return useConfidence; }

private:
    std::unordered_map<std::string, Node> nodes;
    std::unordered_map<std::string, Edge> edges;
    bool useCongestion = false;
    bool useConfidence = false;
};