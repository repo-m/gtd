#include <stdio.h>

/* count input blanks, tabs and newlines */

int main() {
    int c, nb, nt, nl;

    nb = nt = nl = 0;

    while( (c = getchar()) != EOF){
      if (c ==' ')
          ++nb;
      if (c == '\t')
          ++nt;
      if (c == '\n')
          ++nl; 
    }

    printf("\nCount blanks:\t%d", nb);
    printf("\nCount tabs:\t%d", nt);
    printf("\nCount lines:\t%d\n", nl);

    return(0);
  }