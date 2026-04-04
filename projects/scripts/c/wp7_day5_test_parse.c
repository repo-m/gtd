/*
deactivate the original file’s main without editing it by renaming the symbol at compile time:
  - gcc -Dmain=wp2_demo_main -c wp2_day5_CAN_logger.c -o wp2.o
  - gcc wp7_day5_test_parse.c wp2.o -o test_parser
*/

#include "wp2_day5_parser.h"
#include <assert.h>
#include <stdio.h>

void run_test100(const char *input, int expected_ret, uint32_t exp_id, uint8_t exp_dlc) {
    Can msg = {0};
    int ret = parse_message(input, &msg);
    assert(ret == expected_ret);
    if (expected_ret == 0) {
        assert(msg.id == exp_id);
        assert(msg.dlc == exp_dlc);
    }
    printf("test100: sucesfull\n");
}

void run_test200(const char *input, uint8_t exp_dlc) {
    Can msg = {0};
    int ret = parse_message(input, &msg);
    assert(msg.dlc == exp_dlc);
    printf("test200: sucesfull\n");
}


int main (void){

        run_test100("0x7DF 8 01 02 03 04 05 06 07 08", 0, 0x7DF, 8);
        run_test100("0x18FF2A00 9 11 22 33 44 55 66 77 88 99", 1, 0, 0);
        run_test200("0x18FEF100 0", 0);

        return 0;
}