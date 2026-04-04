#include <stdio.h>
#include <string.h>

#define MAX 256
#define MAXWORD 25

int main(void){
        char buffer[MAX];
        char c;
        int last = 0;
        int total_number = 0;
        int last_index = 0;
        char word[MAXWORD];

        while(fgets(buffer,sizeof(buffer),stdin)){
                if(buffer[0]=='#') continue;
                printf("buffer:%s\n", buffer);
                for(int i=0; buffer[i] != '\0' ;i++){
                        c = buffer[i];
                        if(i<0) last = buffer[i-1];

                        if(c != ' ' && c != '\t' && c != '\n' && (last == 0 || last == '\n' || last == '\t')){
                                total_number++;
                                printf("dbg - new word - index:%d - last index: %d\n",i,last_index);
                                strncpy(word, &buffer[last_index], i-last_index);
                                word[i-last_index]='\0';
                                printf("dbg - word:%s\n",word);
                                last_index = i+1;
                                //final_last_index = last_index;
                        }

                }
        }
        return 0;
}