/*Exercise 1.8. Write a program to count blanks, tabs, and newline*/

#include <stdio.h>

int main (void){
        int c = 0;
        int cnt_blanks = 0;
        int cnt_tabs = 0;
        int cnt_nl = 0;

        while ((c = getchar())!=EOF){
                if (c == ' ') cnt_blanks++;
                else if (c == '\t') cnt_tabs++;
                else if (c == '\n') cnt_nl++;
        }
        printf("number of blanks: %d\nnumber of tabs: %d\nnumber of newlines: %d\n",
                cnt_blanks, cnt_tabs, cnt_nl);
        return 0;
}