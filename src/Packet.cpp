#include "Packet.h"

Packet::Packet(const std::string& id, const std::string& sourceId, const std::string& destId, int ttl)
    : id(id), sourceId(sourceId), destId(destId), ttl(ttl), delivered(false), totalCost(0.0), hops(0) {}

std::string Packet::getId() const { return id; }
std::string Packet::getSourceId() const { return sourceId; }
std::string Packet::getDestId() const { return destId; }
int Packet::getTTL() const { return ttl; }
bool Packet::isAlive() const { return ttl > 0; }
bool Packet::isDelivered() const { return delivered; }
double Packet::getTotalCost() const { return totalCost; }
int Packet::getHops() const { return hops; }

void Packet::decrementTTL() { if (ttl > 0) ttl--; }
void Packet::setDelivered() { delivered = true; }

void Packet::addStep(const std::string& nodeId, const std::string& edgeId, const std::string& message, double stepCost) {
    totalCost += stepCost;
    if (!edgeId.empty()) hops++;
    trace.push_back({nodeId, edgeId, message, totalCost, hops});
}

const std::vector<PacketStep>& Packet::getTrace() const { return trace; }