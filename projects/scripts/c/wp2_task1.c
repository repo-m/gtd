/*
Task: Character Frequency Counter (Safe Embedded Style)

Write a C program that:
1. Reads text lines from stdin until EOF.
2. Ignores lines starting with '#'.
3. Counts how often each character (A–Z, a–z, 0–9) appears.
   - Use only arrays and loops (no malloc, no realloc).
   - Use only <stdio.h> (and optionally <string.h>).
4. At the end, print:
   - Count of total characters processed
   - Frequency of each character that appeared at least once

Example input:
#ignore
Hello123
HelloC

Example output:
Total characters: 11
H: 2
e: 2
l: 3
o: 2
1: 1
2: 1
3: 1
C: 1
*/

#include <stdio.h>
#include <limits.h>


int main(void){
        int c;
        int c_last = '\n';
        int comment = 0;
        /*Array size is UCHAR_MAX+1 to cover the full range of possible byte values (0..255 on most platforms).*/
        int buffer[UCHAR_MAX + 1];

        int cnt_char = 0;

        for(size_t i=0; i <= UCHAR_MAX; i++){
                buffer[i]=0;
        }

        while((c = getchar()) != EOF){
                if(c == '#' && c_last == '\n'){
                        comment = 1;
                }
                else if(comment == 1 && c == '\n'){
                        comment = 0;
                }
                else if(comment == 0 && (('A' <= c && c <= 'Z') ||
                                        ('a' <= c && c <= 'z') ||
                                        ('0' <= c && c <= '9'))){
                        cnt_char++;
                        buffer[c]++;
                }
                c_last = c;
        }
        printf("Total characters: %d\n", cnt_char);
        for(size_t i=0; i <= UCHAR_MAX; i++){
                if(buffer[i]!=0){
                        /*Use (unsigned char) for indexing to avoid negative values if char is signed.*/
                        printf("%c:%d\n",(unsigned char)i, buffer[i]);
                }
        }
        return 0;
}
