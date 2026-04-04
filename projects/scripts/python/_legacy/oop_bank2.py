'''
Here’s the **goal reminder**: you’ll make a class `BankAccount` that

* starts with a balance given at creation,
* can deposit and withdraw,
* keeps track of its internal state.

Go ahead and implement it.
Once you paste your version here, I’ll review it and explain exactly how OOP state and encapsulation work in this example.
'''

class BankAccount:
    balance: int

    def __init__(self, balance:int = 0):
        self.balance = balance

    def deposit(self, amount: int):
        self.balance += amount

    def withdraw(self, amount: int):
        if amount <= self.balance:
            self.balance -= amount
        else:
            print("Insufficient funds")
    
    def show(self):
        print(self.balance)


def main():
    '''Main entry point for the script'''
    c = BankAccount(7500)
    c.show()
    c.withdraw(50)
    c.deposit(1500)
    c.withdraw(8500)
    c.show()


if __name__ == "__main__":
    main()
