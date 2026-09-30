cmake_minimum_required(VERSION 3.17)
project(PacketRoutingSimulator)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include algorithms third_party server)

file(GLOB SOURCES 
    "src/*.cpp" 
    "algorithms/*.cpp" 
    "server/*.cpp"
)

add_executable(PacketRoutingSimulator ${SOURCES})

if(WIN32)
    target_link_libraries(PacketRoutingSimulator ws2_32)
elseif(APPLE)
    target_link_libraries(PacketRoutingSimulator pthread)
elseif(UNIX)
    target_link_libraries(PacketRoutingSimulator pthread)
endif()