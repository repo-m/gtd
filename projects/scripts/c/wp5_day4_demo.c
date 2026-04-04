// demo.c
#include <stdio.h>
#include <stdint.h>
#include <stddef.h>

static volatile int g_flag = 0;

static int bin_search_left(const int *a, size_t n, int key) {
    size_t lo = 0, hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (a[mid] < key) lo = mid + 1; else hi = mid; // left-most
    }
    return (lo < n && a[lo] == key) ? (int)lo : -1;
}

static size_t sum_array(const int *a, size_t n) {
    size_t s = 0;
    for (size_t i = 0; i <= n; ++i) {      // BUG: should be i < n
        s += a[i];
    }
    return s;
}

static void fill_buf(unsigned char *buf, size_t n) {
    for (size_t i = 0; i < n; ++i) buf[i] = (unsigned char)i;
}

static void mutate(int *x) { *x += 42; }

static int chain3(int v) { return v * 2 + 1; }
static int chain2(int v) { return chain3(v - 1); }
static int chain1(int v) { return chain2(v + 2); }

static void toggle_flag(void) { g_flag = 1; }

int main(void) {
    static int data[] = {0,3,5,9,12,12,15,18,21};
    enum { N = sizeof data / sizeof data[0] };

    int key = 12;
    int idx = bin_search_left(data, N, key);     // step/next here
    size_t total = sum_array(data, N);           // find the off-by-one bug
    unsigned char buf[16]; fill_buf(buf, sizeof buf); // x/16xb &buf
    int x = 0; mutate(&x);                       // watch x
    int y = chain1(5);                           // backtrace bt
    toggle_flag();                               // watch g_flag

    printf("idx=%d total=%zu x=%d y=%d flag=%d buf0=%u\n",
           idx, total, x, y, g_flag, (unsigned)buf[0]);
    return 0;
}
