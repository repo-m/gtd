#include <iostream.>

using namespace std;

double square(double x);
void print_square(double x);

double square(double x){
        return x*x;
}

void print_square(double x){
        cout << "the square of " << x << " is " << square(x) << "\n";
}

int main (void) {
        cout << "Hello, world!\n";
        print_square(1.234);

}