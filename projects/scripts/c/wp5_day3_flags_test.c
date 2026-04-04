// wp5_flags_test.c
#include <stdio.h>

int add(int a, int b) {
    int result = a + b;
    return result;
}

int main(void) {
    int sum = add(5, 10);
    int unused;                 // <- triggers -Wunused-variable (from -Wextra)
    int x = 0;
    if (sum = 20) {             // <- single '=' triggers -Wparentheses (from -Wall)
        printf("Sum = %d\n", sum);
    }
    return 0;
}
