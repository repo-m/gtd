'''
Step 1: your first simple class**.
'''

class Counter:
    counter: int

    def __init__(self) -> None:
        self.counter = 0

    def increment(self):
        self.counter += 1
    
    def reset(self):
        self.counter = 0
    
    def show(self):
        print(self.counter)


def main():
    '''Main entry point of the script'''
    c = Counter()
    c.increment()
    c.increment()
    c.show()   # should print 2
    c.reset()
    c.show()   # should print 0


if __name__ == "__main__":
    main()
