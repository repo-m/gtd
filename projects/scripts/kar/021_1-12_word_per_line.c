/*Exercise 1-12. Write a program that prints its input one word per line.*/

#include <stdio.h>

#define IN  1
#define OUT 0

int main () {
  int c, state;

  state = IN;

  while ((c = getchar()) != EOF){
    if ((c == ' ' || c == '\t' || c == '\n')){
      state = OUT;
    }
    else if (state == OUT) {
      putchar('\n');
      state = IN;
    }
    if (state == IN){
      putchar(c);
    }
  }
  return 0;
}