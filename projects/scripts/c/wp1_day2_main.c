/*Exercise: split a program into two files:

main.c uses extern int shared;

module.c defines int shared = 42;.*/

#include <stdio.h>
#include "wp1_day2.h"

int main (void){
        printf("%zu", shared);
        return 0;
}
