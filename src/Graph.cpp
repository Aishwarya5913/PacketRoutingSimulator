#include "Graph.h"

void Graph::addNode(const Node& node) {
    nodes[node.getId()] = node;
}

void Graph::addEdge(const Edge& edge) {
    edges[edge.getId()] = edge;
}

std::vector<Node> Graph::getNodes() const {
    std::vector<Node> result;
    for (const auto& pair : nodes) result.push_back(pair.second);
    return result;
}

std::vector<Edge> Graph::getEdges() const {
    std::vector<Edge> result;
    for (const auto& pair : edges) result.push_back(pair.second);
    return result;
}

Node* Graph::getNode(const std::string& id) {
    auto it = nodes.find(id);
    return it != nodes.end() ? &it->second : nullptr;
}

Edge* Graph::getEdge(const std::string& id) {
    auto it = edges.find(id);
    return it != edges.end() ? &it->second : nullptr;
}

std::vector<Edge*> Graph::getAdjacentEdges(const std::string& nodeId) {
    std::vector<Edge*> adjacent;
    for (auto& pair : edges) {
        if (pair.second.isActive() && 
           (pair.second.getSourceId() == nodeId || pair.second.getTargetId() == nodeId)) {
            adjacent.push_back(&pair.second);
        }
    }
    return adjacent;
}

void Graph::setOptions(bool congestion, bool confidence) {
    useCongestion = congestion;
    useConfidence = confidence;
}