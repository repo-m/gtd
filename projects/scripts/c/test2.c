/*
Task: Number Analyzer

Write a C program that:
1. Reads integers from stdin until EOF.
2. Ignores comment lines (starting with '#').
3. Stores each valid number and updates statistics:
   - Count of numbers
   - Minimum value
   - Maximum value
   - Average value
4. At the end, print the statistics in the format:

   Count: <count>
   Min: <min>
   Max: <max>
   Average: <average>
*/

#include <stdio.h>

#define MAX 265

typedef struct {
    int count;
    int min;
    int max;
} range;


int main (){
    char buffer[MAX];
    int number = 0;
    int sum = 0;
    range numbers = {0,0,0};
    double average = 0;

    while(fgets(buffer, sizeof(buffer), stdin)){
        if(buffer[0] == '#') continue;
        if(sscanf(buffer, "%d",&number)==1){
            if(numbers.count == 0){
                numbers.max = number;
                numbers.min = number;
            }
            else{
                if(number > numbers.max) numbers.max = number;
                else if(number < numbers.min) numbers.min = number;
            }
            sum = sum + number;
            numbers.count++;
        }
    }
    average = (double)sum / numbers.count;
    printf("Count: %d\nMin: %d\nMax: %d\nAverage: %.2f\n", numbers.count, numbers.min, numbers.max, average);
    return 0;
}