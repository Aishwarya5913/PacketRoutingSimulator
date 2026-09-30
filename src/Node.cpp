#include "Node.h"

Node::Node(const std::string& id, const std::string& name, int x, int y)
    : id(id), name(name), x(x), y(y) {}

std::string Node::getId() const { return id; }
std::string Node::getName() const { return name; }
int Node::getX() const { return x; }
int Node::getY() const { return y; }