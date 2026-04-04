/*Exercise 2-6. Write a function setbits(x,p,n,y) that returns x with the n
bits that begin at position p set to the rightmost n bits of y, leaving the other
bits unchanged.

example
x = 0b10101100 (172 decimal)
y = 0b00000101 (5 decimal)
p = 4 (starting position, counting from rightmost bit = 0)
n = 3 (number of bits to set)
*/

#include <stdio.h>

static unsigned int setbits(unsigned int x, int p, int n, unsigned int y);

static unsigned int setbits(unsigned int x, int p, int n, unsigned int y){

        unsigned int mask_x = ((1u << n) - 1u) << (p + 1 - n);
        unsigned int mask_y = (1u << n) - 1u;

        return (x & ~mask_x) | ((y & mask_y) << (p + 1 - n));
}