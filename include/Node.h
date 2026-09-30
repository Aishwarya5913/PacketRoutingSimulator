#pragma once
#include <string>

class Node {
public:
    Node() = default;
    Node(const std::string& id, const std::string& name, int x = 0, int y = 0);

    std::string getId() const;
    std::string getName() const;
    int getX() const;
    int getY() const;

private:
    std::string id;
    std::string name;
    int x;
    int y;
};