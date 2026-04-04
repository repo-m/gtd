#include <stdio.h>
#include <stdint.h>

int sum_array(const int *a, size_t n);
uint8_t readSensor(size_t m);

int sum_array(const int *a, size_t n){
        int sum = 0;
        for(size_t k = 0; k < n; k++){
                sum += *(a + k);
        }
        return sum;
}

uint8_t readSensor(size_t m){
        return (uint8_t)(m + 2);
}

int main (void) {

/* 1. Print elements via pointer arithmetic: *(p+i) */
        enum { MAX = 10 };
        uint8_t array[MAX] ={3,5,4,5};
        uint8_t *p = array;

        for(size_t i = 0; i < MAX; i++){
                printf("%u\n",*(p+i));
        }

/* 2. Swap two integers via pointers */
        uint8_t swap_a = 10;
        uint8_t swap_b = 2;
        uint8_t temp = 0;
        uint8_t *p_a = &swap_a;
        uint8_t *p_b = &swap_b;

        printf("\nBefore swap\na:%u\nb:%u",swap_a, swap_b);
        temp = *p_a;
        *p_a = *p_b;
        *p_b = temp;
        printf("\nAfter swap\na:%u\nb:%u",swap_a, swap_b);

/*3. Write sum_array(const int *a, size_t n) */
        enum { SIZE = 10 };
        int arr[SIZE] = {1,2,3};
        printf("\nsum-array: %d", sum_array(arr, SIZE));



/* 4. Access multi-dim array values via pointers */
        uint8_t multi[3][4] = {{1,2,3,4},{5,6,7,8},{2,5,8,9}};
        uint8_t (*p_multi)[4] = multi;
        printf ("multi[1][2]:%u\n", *(*(p_multi+1)+2));

/* 5. Initialize runtime data (e.g., calibData[i] = readSensor();) */
        enum { LEN = 10 };
        uint8_t calibData[LEN];

        for(size_t k = 0; k < LEN; k++){
                calibData[k] = readSensor(k);
                printf("%u,",calibData[k]);
        }


        return 0;
}