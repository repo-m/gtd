/* Exercise 1-6. Verify that the expression qetchar () I= EOFis 0 or 1. */

#include <stdio.h>

/* copy input to output; 2nd version */

int main()
{
    int c;

    while (c = (getchar() != EOF)){
        printf("%d\n", c);
    }
    printf("%d\n", c);
}
    