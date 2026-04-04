#include <stdio.h>


int my_swap(int *a, int *b){
    int temp_a = *a;
    int temp_b = *b;
    *a = temp_b;
    *b = temp_a;
    return 0;
}

int main(){

    char c;
    int a = 44;
    int b = 66;

    while((c = getchar()) != EOF){
        printf("Here is the tric: look at a and b! a is %i and b is %i \n",a,b);
        printf("Now I will cal the function swap(a,b)... and say AbraCadabra\n");
        my_swap(&a, &b);
        printf("Tadaaa! Now a is %i & b is %i\n",a,b);
    }

    return 0;
}