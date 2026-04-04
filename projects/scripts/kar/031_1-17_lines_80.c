#include <stdio.h>
#define MAX 1000
#define THRESHOLD 5

/* Exercise 1-17. Write a program to print all input lines that are longer than 80
characters. */

int get_line(char selectline[], int maxline);
void copy(char from[], int offset, char to[]);

int main() {
        int c;
        char line[MAX];
        char result[MAX];
        int index;
        int line_length;

        index = 0;

        while ((line_length = get_line(line, MAX)) > 0){
                if (line_length >= THRESHOLD && (index + line_length) < MAX){
                        copy(line, index, result);
                        index = index + line_length;
                }
        }

        if (index > 0){
                result[index] = '\0';
                printf("\n%s\n", result);
        }
        return 0;
}

int get_line(char selectline[], int maxline){
        int c;
        int i;

        c = 0;
        i = 0;

        while((c = getchar()) !=EOF && c != '\n' && i < maxline-1){
                selectline[i]=c;
                i++;
        }

        if (c == '\n'){
                selectline[i]= c;
                i++;
        }
        selectline[i] = '\0';
        return i;
}

void copy(char from[], int offset, char to[]) {
    int i = 0;
    while (from[i] != '\0') {
        to[offset + i] = from[i];
        i++;
    }
}