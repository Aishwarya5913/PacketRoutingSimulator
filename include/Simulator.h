#pragma once
#include "../third_party/json.hpp"

class Simulator {
public:
    static nlohmann::json runSimulation(const nlohmann::json& request);
    static nlohmann::json runComparison(const nlohmann::json& request);
};
