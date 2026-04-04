/*
**WP2 – Mid-size Project (CAN/Log Parser)**

Goal: Implement a small but realistic **log parser** that processes CAN-like frames and extracts key info safely.

### **Task Overview**

Write a C program that:

1. Reads lines like

   ```
   0x18FF50E5 8 11 22 33 44 55 66 77 88
   ```

| Field      | Value             | Meaning                            |
| ---------- | ------------------------- | -------------------------------------------------------------- |
| **CAN ID** | `0x18FF50E5`          | 29-bit **extended identifier** (CAN FD or extended CAN frame). |
| **DLC**    | `8`               | Data Length Code → 8 bytes of payload.             |
| **DATA**   | `11 22 33 44 55 66 77 88` | 8 data bytes in hexadecimal notation.              |


2. Parses the CAN ID (hex), DLC (0–8), and data bytes.
3. Stores results in a struct array.
4. Prints a formatted summary.

### **Constraints**

* Use **fixed-size arrays** (no dynamic memory).
* Validate all fields (hex, DLC, data range).
* Follow **safe embedded style** (`enum` for limits, return codes).


0x18FF50E5 8 11 22 33 44 55 66 77 88
*/

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "wp2_day5_parser.h"


int8_t parse_message (const char *buffer, Can *mes){
    uint32_t tmp_id = 0;
    uint8_t tmp_dlc = 0;
    uint8_t tmp_data[PL_BUFFER_SIZE] = {0};
    int trailing = 0;
    size_t index = 0;
    uint8_t value = 0;
    int n = 0;

    if (sscanf(buffer,"0x%X %hhu %n", &tmp_id, &tmp_dlc, &trailing) >= 2){
        if(tmp_dlc <= MAX_DLC){
            while (index < tmp_dlc && sscanf(buffer + trailing, "%hhX %n", &value, &n) == 1){
                tmp_data[index] = (uint8_t)value;
                trailing += n;
                index++;
                value = 0;
                n = 0;
            }
        }
        else{
            return 1;
        }
        mes->id = tmp_id;
        mes->dlc = tmp_dlc;
        memcpy(mes->data, tmp_data, tmp_dlc);
    }
    else{
        return 1;
    }

    return 0;
}

int main (void) {
    char data [LIMIT];
    Can temp;
    Can message[LIMIT] = {0};
    size_t message_count = 0;

    if(message_count <= LIMIT){
        while (fgets (data, sizeof(data), stdin)){
            if(parse_message (data, &temp) == 0 && message_count <= LIMIT){
                message[message_count].id = temp.id;
                message[message_count].dlc = temp.dlc;
                memcpy(message[message_count].data, temp.data, temp.dlc);
                message_count++;
            }
            else{
                printf("ERROR");
            }
        }

        for(size_t i = 0; i < message_count; i++){
            printf("id:%X dlc:%u data:", message[i].id,message[i].dlc);
            for(size_t k = 0; k < message[i].dlc; k++){
                printf(" %02X", message[i].data[k]);
            }
            printf("\n");
        }
    }
    else{
        return 1;
    }

    return 0;
}
