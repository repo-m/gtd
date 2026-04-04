#include <stdio.h>

/* word counting*/

int main() {
    int c, nw = 0, nl = 0, nc = 0, separator = 1;

    while ((c = getchar()) != EOF) {
      nc++;
      if (c == '\n'){
        nl++;
        if (separator == 0){
          nw++;
        }
        separator = 1;
      }
      else if (c == ' ' || c == '\t'){
        if (separator == 0){
          nw++;
        }
        separator = 1;
      }
      else {
        separator = 0;
      }
    }
    printf("lc:\t%d\nwc:\t%d\ncc:\t%d\n", nl, nw, nc);
}
