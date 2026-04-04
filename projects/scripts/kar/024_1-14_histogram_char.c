/* Write a program to print a histogram of the frequencies of different characters in its input. */

#include <stdio.h>

#define MAX 255
#define TRUE 1
#define FALSE 0

int main (){
    int c, hist[MAX], newc, index;
    newc = TRUE;
    index = 0;

    for (int i = 0; i < MAX; i++){
        hist[i] = 0;
    }

    while ((c = getchar()) != EOF){
        hist[c]++;
        }
    printf("\n\n**HISTOGRAM OF CHARACTER FREQUENCIES**\n");
    for (int i = 0; i < MAX; i++){
        if (hist[i] != 0){
            if (i == ' '){
                printf("\' \':\t");
            }
            else if (i == '\t'){
                printf("\\t:\t");
            }
            else if (i == '\n'){
                printf("\\n:\t");
            }
            else{
                printf("%c:\t",i);
            }
            for (int j = 0; j < hist[i]; j++){
                printf("x");
            }
            printf("\n");
        }
    }
}