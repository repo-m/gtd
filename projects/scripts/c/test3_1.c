/*
Task: Word Counter

Write a C program that:
1. Reads lines of text from stdin until EOF.
2. Ignores lines starting with '#'.
3. Splits each line into words (separated by spaces or tabs).
4. Tracks statistics:
	- Total number of words
	- Number of unique words
	- Count of occurrences for each word
5. At the end, print a summary:
	- Total words
	- Unique words
	- Each unique word with its count
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX 265
#define MAXWORD 26

typedef struct{
        char word[MAXWORD];
        int count;
} analysis;

int main(void){
        char buffer[MAX];
        int last_index = 0;
        char word[MAXWORD];
        int final_index = 0;
        int final_last_index = 0;
        analysis *words = NULL;
        int words_size = 0;
        int total_number = 0;
        int count_unique = 0;
        int found = 0;
        int found_index = 0;

        while(fgets(buffer, sizeof(buffer), stdin)){
                if(buffer[0]=='#') continue;
                for(int i=0; buffer[i]!='\0'; i++){
                        if(buffer[i] == ' ' || buffer[i] == '\t' || buffer[i] == '\n'){
                                total_number++;
                                //printf("dbg - new word - index:%d - last index: %d\n",i,last_index);
                                strncpy(word, &buffer[last_index], i-last_index);
                                word[i-last_index]='\0';
                                //printf("dbg - word:%s\n",word);
                                last_index = i+1;
                                final_last_index = last_index;
                                if(words_size == 0){
                                        count_unique++;
                                        words_size++;
                                        //printf("dbg - words-size: %d\n", words_size);
                                        words = realloc(words, words_size * sizeof(analysis));
                                        strcpy(words[words_size-1].word, word);
                                        words[words_size-1].count=1;
                                        //printf("dbg - words.word:%s\n",words[words_size-1].word);
                                }
                                else{
                                        for(int j=0; j<words_size; j++){
                                                if(strcmp(word, words[j].word)==0){
                                                        //printf("dbg - known word\n");
                                                        found = 1;
                                                        found_index = j;
                                                        break;
                                                }
                                        }
                                        if(found == 1){
                                                found = 0;
                                                words[found_index].count++;
                                                //printf("dbg - words.word:%s\n",words[found_index].word);

                                        }
                                        else if(found == 0){
                                                count_unique++;
                                                words_size++;
                                                //printf("dbg - words-size: %d\n", words_size);
                                                words = realloc(words, words_size * sizeof(analysis));
                                                strcpy(words[words_size-1].word, word);
                                                words[words_size-1].count++;
                                                //printf("dbg - words.word:%s\n",words[words_size-1].word);
                                        }
                                }

                        }
                        found = 0;
                        //printf("buffer[%d]:%c\n",i, buffer[i]);
                        final_index = i+1;
                }
                //printf("\n-------next while iteration------\n");
                //printf("buffer: %s\n", buffer);
                last_index = 0;
        }
        //printf("\nlast index:%d\n",final_last_index);
        //printf("\nindex:%d\n", final_index);
        //printf("buffer(last_index):%c\n", buffer[last_index]);

        strncpy(word, &buffer[final_last_index], final_index-final_last_index);
        word[final_index-final_last_index]='\0';
        total_number++;
        //printf("dbg - word:%s\n",word);

        for(int j=0; j<words_size; j++){
                if(strcmp(word, words[j].word)==0){
                        //printf("dbg - known word\n");
                        found = 1;
                        found_index = j;
                        break;
                        }
                }
        if(found == 1){
                found = 0;
                words[found_index].count++;
                //printf("dbg - words.word:%s\n",words[found_index].word);
        }
        else if(found == 0){
                count_unique++;
                words_size++;
                //printf("dbg - words-size: %d\n", words_size);
                words = realloc(words, words_size * sizeof(analysis));
                strcpy(words[words_size-1].word, word);
                words[words_size-1].count++;
                //printf("dbg - words.word:%s\n",words[words_size-1].word);
        }

        printf("\nRESULTS\ntotal number of words: %d\nnumber of unique words: %d\n", total_number, count_unique);
        for(int h=0; h<words_size;h++){
                printf("Word: %s\tcount: %d\n", words[h].word, words[h].count);
        }
        free(words);
        return 0;
}
