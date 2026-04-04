#ifndef CAN_PARSER_H
#define CAN_PARSER_H

#include <stdint.h>

#define LIMIT 60
#define MAX_DLC 8
#define PL_BUFFER_SIZE 8

typedef struct {
    uint32_t id;
    uint8_t dlc;
    uint8_t data[PL_BUFFER_SIZE];
} Can;

int8_t parse_message(const char *buffer, Can *mes);

#endif /* CAN_PARSER_H */