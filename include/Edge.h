#pragma once
#include <string>

class Edge {
public:
    Edge() = default;
    Edge(const std::string& id, const std::string& sourceId, const std::string& targetId, double baseWeight, double confidence = 1.0, double congestion = 0.0, bool active = true);

    std::string getId() const;
    std::string getSourceId() const;
    std::string getTargetId() const;
    double getBaseWeight() const;
    double getCongestion() const;
    double getConfidence() const;
    bool isActive() const;

    void setCongestion(double amount);
    void setConfidence(double conf);
    void setActive(bool active);
    
    // Calculates total cost based on simulator options
    double getEffectiveCost(bool useCongestion, bool useConfidence) const;

private:
    std::string id;
    std::string sourceId;
    std::string targetId;
    double baseWeight;
    double confidence;
    double congestion;
    bool active;
};