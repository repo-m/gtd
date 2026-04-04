#include <stdio.h>

/* print Fahrenheit-Celsius table
    for fahr = 0, 20, ..., 300; floating-point version */

float tempconv(float fahr);

int main() {
    float fahrenheit, celsius;
    int lower, upper, step;

    lower = 0;    /* lower limit of temperature table */
    upper = 300;  /* upper limit */
    step = 20;    /* step size */
    fahrenheit = lower;

    printf("Fahrenheit Celsius\n");

    while (fahrenheit <= upper) {
        celsius = tempconv(fahrenheit);
        printf("%3.0f %6.1f\n", fahrenheit, celsius);
        fahrenheit = fahrenheit + step;
    }
}

float tempconv(float fahr){
    float cel;

    cel = (5.0 / 9.0) * (fahr - 32.0);

    return(cel);
}
