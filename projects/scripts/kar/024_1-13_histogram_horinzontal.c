/*Write a program to print a histogram of the lengths of words in its input. It is easy to draw the histogram with the bars horizontal; a vertical orientation is more challenging. */

#include <stdio.h>

#define IN 1
#define OUT 0
#define MAX 10

int main(){
    int c, state, wc, hist[MAX], cc;

    state = OUT;
    wc = 0;
    for (int i = 0; i < MAX; i++ ){
      hist[i] = 0;
    }
    cc = 0;

    while((c = getchar()) != EOF){
        if(c == ' ' || c == '\n' || c == '\t'){
            state = OUT;
            if (cc != 0){
                hist[cc]++;
            }
            cc = 0;
        }
        else if (state == OUT){
            state = IN;
            wc++;
        }
        if (state == IN){
            cc++;
        }
    }
    for (int i = 0; i < MAX; i++ ){
        printf("%d:%d\n",i,hist[i]);
    }
    printf("\n");
    for (int i = 0; i < MAX; i++ ){
        printf("%d:",i);
        for (int n = 0; (n <= hist[i] && hist[i] != 0); n++){
            printf("x");
        }
        printf("\n");
    }
    printf("\nwc: %d\n", wc);


}