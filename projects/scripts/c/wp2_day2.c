/*
 * WP2 – Struct-Based Parsing Task (Day 2)
 *
 * Goal:
 *   Parse raw sensor data lines into structured records.
 *
 * Input format (per line):
 *   <sensor_id>,<value>
 *   Example:
 *     101,245
 *     102,300
 *     103,180
 *
 * Requirements:
 *   1. Define a struct with:
 *        - uint16_t sensor_id
 *        - int16_t  value
 *   2. Read multiple lines (fgets or predefined array of strings).
 *   3. Split each line into tokens using ',' as delimiter.
 *   4. Convert tokens to integers and store them in an array of structs.
 *   5. Print all stored records in formatted output.
 *
 * Constraints (Embedded Style):
 *   - No malloc (use fixed-size array of structs, e.g. MAX_RECORDS = 10).
 *   - Always check array bounds before storing new records.
 *   - Initialize structs before use.
 */


#include <stdio.h>
#include <stdint.h>

typedef struct {
    uint16_t sensor_id;
    int16_t value;
} record;

int main (void){
    enum { MAX = 10, LEN = 32};
    record sensor[MAX] = {0};
    char buffer[LEN];
    size_t index = 0;
    unsigned int id = 0;
    int value = 0;

    while (fgets(buffer, sizeof(buffer), stdin)){
        if (sscanf (buffer, "%u,%d", &id, &value) >= 2){
            if(index < MAX){
                sensor[index].sensor_id = (uint16_t) id;
                sensor[index].value = (int16_t) value;
                index++;
            }

        }

    }
    printf("\n");
    for(size_t i = 0; i < index; i++){
        printf("id:%u | value:%d\n",(unsigned int)sensor[i].sensor_id, (int)sensor[i].value);
    }
    return 0;
}