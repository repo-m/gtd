/*
/* Exercise 3-5. Write the function itob (n, s ,b) that converts the integer n into a base b 
/* character representation in the string s. In particular, itob (n, s, 16) formats n as a hexadecimal
/* integer in s.
*/

// string s = integer n / base b -> first digit iterate and build up string

#include <stdio.h>

int itob (int n, char *s, int b);

int itob (int n, char *s, int b){
        enum { LIMIT = 100};
        int remainder = 0;
        int quotient = 0;
        int status = 0;

        for (size_t i = 0; n != 0 && i <= LIMIT; i++) {
                remainder = n % b;
                n = n / b;
                if (b > 10) {
                        *(s + i) = 'A' + (remainder - 10);
                }
                else if ( b <= 10) {
                        *(s + i) = '0' + remainder;
                }
                if (i + 1 < LIMIT){
                        *(s + i + 1) = '\0';
                }
                else {
                        status = 1;
                        break;
                }
        }

        return status;
}

int main (void){
        enum { LIMIT = 100};
        char array[LIMIT] = {0};

        if(itob(45, array, 16) == 0){
                printf("%s",array);
        }
        else {
                printf("ERROR");
        }

        return 0;
}
