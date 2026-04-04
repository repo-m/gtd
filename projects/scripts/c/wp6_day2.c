/*
 * WP6 – Bubble Sort Task (Day 2)
 *
 * Goal:
 *   Implement bubble sort to sort an array of integers in ascending order.
 *
 * Requirements:
 *   1. Use a fixed-size array of integers (e.g., length 10).
 *   2. Initialize it with unsorted values (hardcoded).
 *   3. Implement bubble sort using nested loops:
 *        - repeatedly swap adjacent elements if out of order.
 *   4. Print the array before and after sorting.
 *
 * Constraints (Embedded Style):
 *   - No malloc (use static/fixed arrays).
 *   - Use only integer types (e.g., int32_t).
 *   - Keep functions small and clear (consider writing a swap helper).
 */

void bubble_sort(char *buffer, int size){
        int temp = 0;
        for(int k = 0; k < size - 1; k++){
                for (int i = 0; i < size - 1 - k; i++){
                        if (buffer[i] > buffer[i + 1]){
                                temp = buffer[i];
                                buffer[i] = buffer[i + 1];
                                buffer[i + 1] = temp;
                        }
                }
        }
}