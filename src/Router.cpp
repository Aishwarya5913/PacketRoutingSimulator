#include "Router.h"

Router::Router(Graph& graph, std::unique_ptr<RoutingAlgorithm> algo)
    : graph(graph), algorithm(std::move(algo)) {}

void Router::updateRoutingTables() {
    routingTables = algorithm->computeRoutes(graph);
}

std::string Router::getAlgorithmName() const {
    return algorithm->getName();
}

int Router::getMetadata() const {
    return algorithm->getMetadata();
}

void Router::simulatePacket(Packet& packet) {
    std::string current = packet.getSourceId();
    std::string dest = packet.getDestId();
    bool useCong = graph.isCongestionAware();
    bool useConf = graph.isConfidenceAware();

    packet.addStep(current, "", "Packet created at " + current);

    if (current == dest) {
        packet.setDelivered();
        packet.addStep(current, "", "Packet delivered successfully to " + current);
        return;
    }

    while (packet.isAlive() && !packet.isDelivered()) {
        auto srcTable = routingTables.find(current);
        if (srcTable == routingTables.end() || srcTable->second.find(dest) == srcTable->second.end()) {
            packet.addStep(current, "", "Dropped: No route to destination");
            break;
        }

        std::string nextHop = srcTable->second[dest];
        Edge* connectingEdge = nullptr;
        for (Edge* e : graph.getAdjacentEdges(current)) {
            if ((e->getSourceId() == current && e->getTargetId() == nextHop) ||
                (e->getTargetId() == current && e->getSourceId() == nextHop)) {
                connectingEdge = e;
                break;
            }
        }

        if (!connectingEdge || !connectingEdge->isActive()) {
            packet.addStep(current, "", "Dropped: Link to next hop failed during transit");
            break;
        }

        double cost = connectingEdge->getEffectiveCost(useCong, useConf);
        packet.addStep(current, connectingEdge->getId(), "Forwarding " + current + " -> " + nextHop, cost);
        
        current = nextHop;
        packet.decrementTTL();

        if (current == dest) {
            packet.setDelivered();
            packet.addStep(current, "", "Packet delivered successfully");
        } else if (!packet.isAlive()) {
            packet.addStep(current, "", "Dropped: TTL Expired");
        }
    }
}