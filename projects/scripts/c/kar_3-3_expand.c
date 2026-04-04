/*
 Exercise 3-3 ...
*/

#include <stdio.h>
#include <stdint.h>

uint8_t expand(char *p, char *p_out);
uint8_t is_character_number(char ch_num);

uint8_t is_character_number(char ch_num){
    if((ch_num >= 'a' && ch_num <= 'z') ||
       (ch_num >= 'A' && ch_num <= 'Z') ||
       (ch_num >= '0' && ch_num <= '9')){
        return 1;
    } else return 0;
}

uint8_t expand(char *p, char *p_out){
    enum { LIMIT = 20};
    enum State { INIT , FIRST, CHECK_MULTI_EXPAND, LAST, MULTI_LAST, DONE};
    enum State state = INIT;
    char first = '+';
    char last = '+';
    size_t index = 0;
    char multi_first = '+';
    char multi_last = '+';
    size_t ind = 0;

    while (state != DONE){
        switch (state) {
            case INIT:
                if (p != NULL) {
                    // ok
                } else {
                    printf("ERROR - Pointer is NULL\n");
                    return 1;
                }
                if (p_out == NULL) {
                    return 1;
                }
                state = FIRST;
                break;

            case FIRST:
                printf("State: %d\n", state);
                if (p[0] == '-' && is_character_number(p[1]) == 1 && p[2] == '-'){
                    first = p[1];
                    index = 3;
                    state = CHECK_MULTI_EXPAND;
                }
                else if (is_character_number(p[0]) && p[1] == '-'){
                    first = p[0];
                    index = 2;
                    state = CHECK_MULTI_EXPAND;
                }
                else {
                    printf("ERROR in state: %d\n", state);
                    return 1;
                }
                break;

            case CHECK_MULTI_EXPAND:
                if (is_character_number(p[index]) == 1 && 
                    is_character_number(p[index + 1]) == 1 &&
                    p[index + 2] == '-'){
                    last = p[index];
                    multi_first = p[index + 1];
                    index = index + 3;
                    state = MULTI_LAST;
                }
                else if (is_character_number(p[index]) == 1 && 
                         is_character_number(p[index + 1]) == 0){
                    state = LAST;
                }
                else {
                    printf("ERROR in state: %d\n", state);
                    return 1;
                }
                break;

            case LAST:
                if (is_character_number(p[index]) == 1 && 
                    p[index + 1] == '-'){
                    for(size_t i = index; *(p + i) != '\0' && i < LIMIT; i++){
                        index = i;
                    }
                    last = p[index];
                    state = DONE;
                }
                else if (is_character_number(p[index]) == 1 && 
                         p[index + 1] != '-'){
                    last = p[index];
                    state = DONE;
                }
                else {
                    printf("ERROR in state: %d\n", state);
                    return 1;
                }
                break;

            case MULTI_LAST:
                if (is_character_number(p[index]) == 1 && 
                    p[index + 1] == '-'){
                    for(size_t i = index; *(p + i) != '\0' && i < LIMIT; i++){
                        index = i;
                    }
                    multi_last = p[index];
                    state = DONE;
                }
                else if (is_character_number(p[index]) == 1 && 
                         p[index + 1] != '-'){
                    multi_last = p[index];
                    state = DONE;
                }
                else {
                    printf("ERROR in state: %d\n", state);
                    return 1;
                }
                break;

            default:
                state = DONE;
                break;
        }
    }

    if (first < last){
        for (char c = first; c <= last; c++) {
            if (ind >= LIMIT) return 1;
            *(p_out + ind++) = c;
        }
    }
    else if (first > last){
        for (char c = first; c >= last; c--) {
            if (ind >= LIMIT) return 1;
            *(p_out + ind++) = c;
        }
    }
    if (multi_first < multi_last){
        for (char c = multi_first; c <= multi_last; c++) {
            if (ind >= LIMIT) return 1;
            *(p_out + ind++) = c;
        }
    }
    else if (multi_first > multi_last){
        for (char c = multi_first; c >= multi_last; c--) {
            if (ind >= LIMIT) return 1;
            *(p_out + ind++) = c;
        }
    }

    if(ind <= LIMIT){
        *(p_out + ind) = '\0';
    }

    return 0;
}
