/*Exercise: split a program into two files:

main.c uses extern int shared;

module.c defines int shared = 42;.*/

#ifndef WP1_DAY2_H
#define WP1_DAY2_H

#include <stddef.h>
extern size_t shared;

#endif