#include "Server.h"
#include "Simulator.h"
#include <iostream>

SimulationServer::SimulationServer(int port) : port(port) {
    setupRoutes();
}

void SimulationServer::setupRoutes() {
    svr.set_mount_point("/", "./web");

    svr.Get("/api/health", [](const httplib::Request&, httplib::Response& res) {
        json j = {{"status", "ok"}, {"version", "1.0"}};
        res.set_content(j.dump(), "application/json");
    });

    svr.Post("/api/simulate", [](const httplib::Request& req, httplib::Response& res) {
        try {
            json body = json::parse(req.body);
            json result = Simulator::runSimulation(body);
            res.set_content(result.dump(), "application/json");
        } catch (const std::exception& e) {
            json err = {{"success", false}, {"error", e.what()}};
            res.set_content(err.dump(), "application/json");
        }
    });

    svr.Post("/api/compare", [](const httplib::Request& req, httplib::Response& res) {
        try {
            json body = json::parse(req.body);
            json result = Simulator::runComparison(body);
            res.set_content(result.dump(), "application/json");
        } catch (const std::exception& e) {
            json err = {{"success", false}, {"error", e.what()}};
            res.set_content(err.dump(), "application/json");
        }
    });
}

void SimulationServer::start() {
    std::cout << "Starting C++ Simulator Server on http://localhost:" << port << std::endl;
    svr.listen("0.0.0.0", port);
}