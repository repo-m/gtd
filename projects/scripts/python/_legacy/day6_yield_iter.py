'''
🧠 Mini Exercise – Temperature Stream Processor

Task:
Implement a generator that simulates reading temperature sensor values and processes them on the fly.

Requirements

Function read_temperatures(n)
→ yields n random float values between -10.0 and 40.0

Function average_temperature(gen)
→ consumes the generator and returns the average rounded to one decimal

Function filter_freezing(gen)
→ yields only temperatures ≤ 0 °C
'''

import random

def read_temperatures(n):
    '''Yield random float values'''
    for i in range(n): yield round(random.uniform(-10.0, +40.0), 1)


def average_temperature(gen):
    '''consume generator and compute average'''
    values = list(gen)
    if not values:                  # handle empty generator
        return 0.0
    return round(sum(values) / len(values), 1)


def filter_freezing(gen):
    for value in gen:
        if value <= 0:
            yield value


def main():
    temps = list(read_temperatures(5))
    print("All:", temps)
    print("Freezing:", list(filter_freezing(iter(temps))))
    print("Average:", average_temperature(iter(temps)))


if __name__ == "__main__":
    main()
