# WP7 Testing

- header files
  - `.h` = declarations (types, constants, function prototypes)
  - `.c` = definitions (actual code)
  - Include the header with `#include "parser.h"` — nothing else.
  - You can deactivate the original file’s main without editing it by renaming the symbol at compile time:
    - gcc -Dmain=wp2_demo_main -c wp2_day5_CAN_logger.c -o wp2.o
    - gcc wp7_day5_test_parse.c wp2.o -o test_parser

