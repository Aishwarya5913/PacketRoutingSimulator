#include "Edge.h"

Edge::Edge(const std::string& id, const std::string& sourceId, const std::string& targetId, double baseWeight, double confidence, double congestion, bool active)
    : id(id), sourceId(sourceId), targetId(targetId), baseWeight(baseWeight), confidence(confidence), congestion(congestion), active(active) {}

std::string Edge::getId() const { return id; }
std::string Edge::getSourceId() const { return sourceId; }
std::string Edge::getTargetId() const { return targetId; }
double Edge::getBaseWeight() const { return baseWeight; }
double Edge::getCongestion() const { return congestion; }
double Edge::getConfidence() const { return confidence; }
bool Edge::isActive() const { return active; }

void Edge::setCongestion(double amount) { congestion = amount; }
void Edge::setConfidence(double conf) { confidence = conf; }
void Edge::setActive(bool isActive) { active = isActive; }

double Edge::getEffectiveCost(bool useCongestion, bool useConfidence) const {
    double cost = baseWeight;
    if (useCongestion) {
        cost += (congestion * 1.5); // Congestion penalty factor
    }
    if (useConfidence) {
        cost += ((1.0 - confidence) * 10.0); // Unreliability penalty factor
    }
    return cost;
}