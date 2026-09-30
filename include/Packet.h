#pragma once
#include <string>
#include <vector>

struct PacketStep {
    std::string nodeId;
    std::string edgeId;
    std::string message;
    double currentCost;
    int hopCount;
};

class Packet {
public:
    Packet(const std::string& id, const std::string& sourceId, const std::string& destId, int ttl);

    std::string getId() const;
    std::string getSourceId() const;
    std::string getDestId() const;
    int getTTL() const;
    bool isAlive() const;
    bool isDelivered() const;
    double getTotalCost() const;
    int getHops() const;

    void decrementTTL();
    void setDelivered();
    
    void addStep(const std::string& nodeId, const std::string& edgeId, const std::string& message, double stepCost = 0.0);
    const std::vector<PacketStep>& getTrace() const;

private:
    std::string id;
    std::string sourceId;
    std::string destId;
    int ttl;
    bool delivered;
    double totalCost;
    int hops;
    std::vector<PacketStep> trace;
};