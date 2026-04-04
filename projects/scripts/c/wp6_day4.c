/*
Implement lin_search(a,n,key) and bin_search(a,n,key) with overflow-safe mid (lo + (hi - lo) / 2) and a left-most match policy; keep types consistent (e.g., size_t for indices, fixed-width for data).
Test: keys at first/middle/last, missing (<min, gap, >max), duplicates (expect left-most), n=0/1, negatives, large n, and confirm binary fails predictably on unsorted input.

Binary search (sorted) — A1

arr = [0,3,5,9,12,12,15,18,21], keys = [0,5,12,13,21,22]

key	index
0	0
5	2
12	4
13	-1
21	8
22	-1

*/

#include <stdio.h>

int lin_search(const int* a, size_t size_a, int key);
int bin_search(const int* a, size_t size_a, int key);


int lin_search(const int* a, size_t size_a, int key){
        int return_value = -1;

        for(size_t i = 0; i < size_a && size_a != 0; i++){
                if(*(a+i) == key){
                        return_value = i;
                        break;
                }
        }

        return return_value;
}

int bin_search(const int* a, size_t size_a, int key){
        int return_value = -1;
        size_t high = size_a;
        size_t low = 0;
        size_t mid = 0;

        while (low < high){
                mid = low + (high - low) / 2;
                if (*(a + mid) < key){
                        low = mid + 1;
                }
                else {
                        high = mid;

                }
        }

        if (low < size_a && *(a + low) == key){
                return_value = low;
        }
        else {
                return_value = -1;
        }

        return return_value;
}

int main (void){
        enum { MAX = 9};
        int array[MAX] = {0,3,5,9,12,12,15,18,21};

        printf("lin search:%d\n", lin_search(array, MAX, 0));
        printf("bin search:%d\n", bin_search(array, MAX, 0));

}
