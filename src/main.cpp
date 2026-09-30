#include "Server.h"
#include <iostream>
#include <string>

int main(int argc, char** argv) {
    bool consoleMode = (argc > 1 && std::string(argv[1]) == "--console");
    
    if (consoleMode) {
        std::cout << "========================================" << std::endl;
        std::cout << " PACKET ROUTING SIMULATOR (Console Mode)" << std::endl;
        std::cout << "========================================" << std::endl;
        std::cout << "Start server without args for full UI." << std::endl;
        return 0; // In a full implementation, you'd feed a local JSON file here
    }

    SimulationServer server(8080);
    server.start();

    return 0;
}