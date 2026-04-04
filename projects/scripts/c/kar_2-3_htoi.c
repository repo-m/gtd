/*
Exercise 2·3. Write the function htoi (s), which converts a string of hexa-
decimal digits (including an optional Ox or ox) into its equivalent integer value.
The allowable digits are 0 through 9, a through f, and A through F.
*/

#include <stdio.h>

static unsigned htoi(char *buffer);

static unsigned int htoi(char *buffer){
        int digit = 0;
        unsigned int value = 0;
        for(size_t i = 0; buffer[i] != '\0'; i++){
                if (buffer[i+1] != '\0' && buffer[i] == '0' && (buffer[i+1] == 'x' || buffer[i+1] == 'X')){
                        if (buffer[i +1] != '\0'){
                                i += 2;
                                continue;
                        }
                }
                if (buffer[i] >= '0' && buffer[i] <= '9'){
                        digit = buffer[i] - '0';
                        value = value * 16 + digit;
                } 
                else if (buffer[i] >= 'a' && buffer[i] <= 'f'){
                        digit = 10 + (buffer[i] - 'a');
                        value = value * 16 + digit;
                }
                else if (buffer[i] >= 'A' && buffer[i] <= 'F'){
                        digit = 10 + (buffer[i] - 'A');
                        value = value * 16 + digit;
                }
                else{
                        break;
                }
                
        }
        return value;
}



int main (void){
        enum { MAX = 50};
        char line[MAX];

        while(fgets(line, sizeof(line), stdin)){
                printf("%s->%u\n",line, htoi(line));
        }
        return 0;
}