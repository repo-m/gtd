/* Exercise 1-18. Write a program to remove trailing blanks and tabs from each line of input, and to delete entirely blank lines. */

#include <stdio.h>
#define MAX 1000

int removeblanks(char in[], char out[]);
int copy(char to[], int offset, char from[]);

int main(){
        char *line = NULL;
        size_t len = 0;
        ssize_t nread;
        char all_lines[MAX];
        char result[MAX];
        int index = 0;
        int length = 0;

        while((nread = getline(&line, &len, stdin)) != -1){
                if (removeblanks(line, result) > 0){
                        length = copy(all_lines, index, result);
                        index = index + length + 1;
                }

        }
        all_lines[index] = '\0';
        printf("\nRESULT\n%s\n", all_lines);
        return 0;
}

int removeblanks(char in[], char out[]){
        int j;
        int trailing;

        j = 0;
        trailing = 1;

        for(int i = 0; i < MAX-1 && in[i] != '\n'; i++){
                if(trailing == 0 || (in[i] != ' ' && in[i] != '\t')){
                        out[j]=in[i];
                        j++;
                        trailing = 0;
                }
                if(in[i] == ' ' || in[i]=='\t'){
                        trailing = 1;
                }
        }
        if(j > 0){
                out[j] = '\n';
        }
        return j;
}


int copy(char to[], int offset, char from[]){
        int i = 0;

        while(from[i] != '\n'){
                to[i+offset] = from [i];
                i++;
        }
        to[i+offset] = '\n';
        return i;
}

