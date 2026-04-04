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

#define MAX 256
#define MAXWORD 20

typedef struct{
        char word[MAXWORD];
        int count;
} analysis;

int main(void){
        char buffer[MAX];
        int word_found = 0;
        char word[MAXWORD];
        int index = 0;
        int last_index = 0;
        analysis *words = NULL;
        int words_size = 0;
        int known_word = 0;
        int known_index = 0;
        int total_number = 0;
        int count_unique = 0;

        while(fgets(buffer, sizeof(buffer), stdin)){
                if(buffer[0] == '#') continue;
                for(int i=0; buffer[i]; i++){
                        if(buffer[i] == ' ' || buffer[i] == '\n' || buffer[i] == '\t'){
                                word_found = 1;
                                printf("DBG: new word found\n");
                        }
                        if(word_found == 1){
                                total_number++;
                                strncpy(word, &buffer[last_index], index);
                                word[index] = '\0';
                                printf("dbg - word: %s\n", word);
                                for(int j=0; j < words_size; j++){
                                        printf("j: %d\n", j);
                                        printf("Compare word: %s & words.word: %s\n", word, words[j].word);
                                        if(strcmp(word, words[j].word) == 0){
                                                printf("YES\n");
                                                known_word = 1;
                                                known_index = j;
                                                break;
                                        }
                                }
                                if(known_word == 1){
                                        strcpy(words[known_index].word, word);
                                        words[known_index].word[index] = '\0';
                                        words[known_index].count++;
                                        printf("dbg - index: %d, last_index: %d\n",index, last_index);
                                        last_index = last_index + index + 1;
                                        printf("dbg - words.word: %s\n", words[known_index].word);
                                        word_found = 0;
                                        index = 0;
                                        known_word = 0;
                                        known_index = 0;

                                }
                                else{
                                        count_unique++;
                                        words_size++;
                                        printf("dbg - ELSE: words size: %d\n", words_size);
                                        words = realloc(words, words_size * sizeof(analysis));
                                        strncpy(words[words_size-1].word, &buffer[last_index], index);
                                        words[words_size-1].word[index] = '\0';
                                        words[words_size-1].count++;
                                        printf("dbg - ElSE: index: %d, last_index: %d\n",index, last_index);
                                        last_index = last_index + index + 1;
                                        printf("dbg - ELSE: words.word: %s\n", words[words_size-1].word);
                                        word_found = 0;
                                        index = 0;
                                }

                        }
                        else index++;
                        printf("DBG: %c\n", buffer[i]);
                }
                printf("DBG: new iteration-----\n");
                last_index = 0;
                index = 0;
        }
        printf("\nRESULTS\ntotal number of words: %d\nnumber of unique words: %d\n", total_number, count_unique);
        for(int h=0; h<words_size;h++){
                printf("Word: %s\tcount: %d\n", words[h].word, words[h].count);
        }

}

/*
[x] You only scan the first 20 chars (for (i=0; i<20; i++)) and miss/tab or long lines; 
also you never finalize the last word if the line doesn’t end with a space (use isspace() and handle EOL).

You update/insert per character because word_found fires on the delimiter but you don’t guard the dictionary logic to run once per completed word; also index/last_index math is brittle and can overflow word[MAXWORD] (no bounds check).

words[...].count++ is used without initializing to 0, and your “not found → insert” runs inside the search loop (causing duplicates); search with strcmp, set found, then after the loop do a single realloc + strncpy(..., MAXWORD-1) + word[MAXWORD-1]='\0'.
*/