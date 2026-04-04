#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main(void) {
    int result = add(3, 4);
    printf("Result = %d\n", result);
    return 0;
}
