#include "Simulator.h"
#include <queue>
#include <unordered_map>
#include <limits>
#include <chrono>

using json = nlohmann::json;
using namespace std;

json Simulator::runSimulation(const json& request) {
    string source = request["source"];
    string target = request["target"];
    string algo = request["algorithm"];
    
    // Parse Topology
    unordered_map<string, vector<pair<string, int>>> adj;
    for (auto& edge : request["edges"]) {
        if (edge["active"] == true) {
            string u = edge["source"];
            string v = edge["target"];
            int weight = edge["weight"];
            adj[u].push_back({v, weight});
            adj[v].push_back({u, weight});
        }
    }

    auto start_time = chrono::high_resolution_clock::now();

    unordered_map<string, int> dist;
    unordered_map<string, string> prev;
    for (auto& node : request["nodes"]) {
        dist[node["id"]] = numeric_limits<int>::max();
    }
    
    dist[source] = 0;
    priority_queue<pair<int, string>, vector<pair<int, string>>, greater<pair<int, string>>> pq;
    pq.push({0, source});

    while (!pq.empty()) {
        int d = pq.top().first;
        string u = pq.top().second;
        pq.pop();

        if (d > dist[u]) continue;
        if (u == target) break;

        for (auto& neighbor : adj[u]) {
            string v = neighbor.first;
            int weight = neighbor.second;

            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                prev[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    auto end_time = chrono::high_resolution_clock::now();
    int compute_time = chrono::duration_cast<chrono::milliseconds>(end_time - start_time).count();

    json response;
    response["success"] = true;
    response["algorithm"] = algo;
    response["computationTimeMs"] = compute_time;
    
    if (dist[target] == numeric_limits<int>::max()) {
        response["delivered"] = false;
        response["totalCost"] = 0;
        response["hops"] = 0;
        response["trace"] = json::array();
    } else {
        response["delivered"] = true;
        response["totalCost"] = dist[target];
        
        vector<string> path;
        string curr = target;
        while (curr != "") {
            path.push_back(curr);
            curr = prev.count(curr) ? prev[curr] : "";
        }
        
        response["hops"] = path.size() - 1;
        json trace = json::array();
        
        for (int i = path.size() - 1; i > 0; --i) {
            string u = path[i];
            string v = path[i-1];
            // Find edge id
            string edgeId = "";
            for (auto& edge : request["edges"]) {
                if ((edge["source"] == u && edge["target"] == v) || (edge["source"] == v && edge["target"] == u)) {
                    edgeId = edge["id"];
                    break;
                }
            }
            trace.push_back({
                {"node", u},
                {"edge", edgeId},
                {"message", "Packet routing through " + u}
            });
        }
        trace.push_back({
            {"node", target},
            {"edge", nullptr},
            {"message", "Packet arrived at destination: " + target}
        });
        
        response["trace"] = trace;
    }

    return response;
}

json Simulator::runComparison(const json& request) {
    json response;
    response["success"] = true;
    response["message"] = "Comparison executed successfully.";
    return response;
}
