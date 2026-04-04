/*Exercise 1-9. Write a program to copy its input to its output, replacing each string of one or more blanks by a single blank*/

#include <stdio.h>

/* replace one or more blanks by a single blank*/

int main() {
  int c, nb = 0;

  while ((c = getchar()) != EOF) {
    if (c == ' ')
        ++nb;
    if (c != ' ')
        nb = 0;
    if (nb > 1)
        ;
    else
        putchar(c);
  } 

  return(0);
}
