/*Exercise 1-9. Write a program to copy its input to its output, replacing each
string of one or more blanks by a single blank.*/

#include <stdio.h>

int main(void){
        int c;
        int c_last = ' ';

        while((c=getchar())!=EOF){
                if(c!=' ' || (c ==' ' && c_last != ' ' && c_last != '\n')){
                        putchar(c);
                }
                c_last = c;
        }
        return 0;
}
