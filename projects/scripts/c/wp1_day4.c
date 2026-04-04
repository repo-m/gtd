/*
1. [x] Struct Practice (15 min)
  - Define a struct Sensor with id, value, and status.
  - Print size and offset using sizeof() and offsetof().

2. [x] Union Demo (15 min)
  - Create a union of uint32_t word and uint8_t bytes[4].
  - Show endian impact when assigning and printing bytes.

3. [x] Bitfield Practice (15 min)
  - Map a 16-bit register using bitfields (e.g., status, error, enable bits).
  - Observe memory layout.

4. [x] Volatile Concept (15 min)
  - Write a simple loop reading a volatile flag that’s changed by another function (simulating ISR).
  - Explain why volatile is needed.
*/

#include <stdio.h>
#include <stdint.h>

volatile uint8_t flag = 0;

typedef struct {
    uint8_t id;
    uint8_t value;
    uint8_t status;
} Sensor;

typedef union {
    uint32_t word;
    uint8_t bytes[4];
} TestUnion;

typedef struct {
    uint16_t status     : 1;
    uint16_t error      : 4;
    uint16_t enable_bits: 1;
    uint16_t data       : 8;
} Register;

void test_volatile (size_t k){
    if (k == 5){
        flag = 1;
    }
}



int main (void) {
    Sensor s = { 23, 16, 0};
    printf("sizeof(s):%d\noffsetof(s):%d\n", sizeof(s), offsetof(Sensor, status));

    TestUnion t;
    t.word = 0x12345678;
    printf("UNION word: 0x%08X\n", (unsigned)t.word);
    printf("bytes: %02X %02X %02X %02X\n",
           t.bytes[0], t.bytes[1], t.bytes[2], t.bytes[3]); // shows endianness


    Register r = {1, 2, 0, 0xAA};
    printf("sizeof(Register): %zu\n", sizeof(r));

    uint8_t *p = (uint8_t *)&r;
    printf("raw bytes: %02X %02X\n", p[0], p[1]);

    printf("flag:%u\n", flag);
    for (size_t i = 0; flag != 1; i++){
        test_volatile(i);
    }
    printf("flag:%u\n", flag);

    return 0;
}
