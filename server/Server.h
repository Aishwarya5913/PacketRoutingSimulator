#pragma once
#include "httplib.h"

class SimulationServer {
public:
    SimulationServer(int port);
    void start();
private:
    void setupRoutes();
    httplib::Server svr;
    int port;
};