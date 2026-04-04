/*Exercise 1-13. Write a program to print a histogram of the lengths of words in
its input. It is easy to draw the histogram with the bars horizontal; a vertical
orientation is more challenging*/

#include <stdio.h>
#include <stdint.h>

static inline int iswhitespace(int character);

static inline int iswhitespace(int character){
    if(character == ' ' || character == '\n' || character == '\t' ||
        character == '\r' || character == '\v'|| character =='\f'){
        return 1;
    }
    else return 0;
}

int main (void){
    int c = 0;
    int c_last = ' ';
    size_t cnt_c = 0;
    uint16_t buffer[UINT8_MAX+1u];
    uint8_t line = 0;
    uint8_t last_ws = 0;
    uint8_t current_ws = 0;

    for (size_t i = 0; i < UINT8_MAX+1u; i++){
        buffer[i] = 0;
    }

    while((c=getchar())!=EOF){
        current_ws = iswhitespace(c);
        last_ws = iswhitespace(c_last);
        if (current_ws == 0){
            cnt_c++;
        }
        else if(last_ws == 0  && current_ws == 1){
            if (cnt_c > UINT8_MAX) {
                buffer[UINT8_MAX]++;
            } 
            else {
                buffer[cnt_c]++;
            }
            cnt_c = 0;
        }
        else{
            cnt_c = 0;
        }
        c_last = c;
    }
    for (size_t k = 0; k < UINT8_MAX+1u; k++){
        if (buffer[k] != 0){
            printf("%zu\t",k);
        }
    }
    if (cnt_c > 0) {
            if (cnt_c > UINT8_MAX) {
                buffer[UINT8_MAX]++;
            } 
            else {
                buffer[cnt_c]++;
            }
            cnt_c = 0;
    }
    printf("\n");
    while (line < 10){
        for(size_t j = 0; j < UINT8_MAX+1u; j++){
            if (buffer[j] > line){
                printf("x\t");
            }
            else if(buffer[j] > 0){
                printf("\t");
            }
        }
        line++;
        printf("\n");
    }
    return 0;
}