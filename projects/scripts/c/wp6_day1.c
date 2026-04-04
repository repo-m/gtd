/* Mini-Exercises (20 min)

copy string safely into another buffer.*/

#include <stdint.h>
#include <stdio.h>

int main (void){

    /*Reverse an array of unsigned integers.*/
    /*N = 256*/
    /*N = -/+ 127*/
    enum { N = UINT8_MAX + 1u};
    enum { M = INT8_MAX + 1u};
    uint8_t array_source[N];
    uint8_t array_destination[N];
    uint8_t counter_array = 0;
    char buffer[M];
    size_t counter_string_len = 0;

    for (size_t i = 0; i < N; i++){
        array_source[i] = counter_array;
        counter_array++;
    }
    for (size_t j = 0; j < N; j++){
        array_destination[j] = array_source[(size_t)N - 1u - j];
    }

    /*Count length of a string (without strlen).*/

    while(fgets(buffer, sizeof(buffer), stdin)){
        printf("buffer: %s", buffer);
    
        for(size_t k = 0; buffer[k] != '\0'; k++){
            counter_string_len++;
        }
        printf("->len: %zu\n", counter_string_len);
        counter_string_len = 0;
    }

    return 0;
}