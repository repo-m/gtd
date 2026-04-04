'''
**Step 3: multiple independent objects**.

### 🎯 Goal

Understand that every object created from a class keeps **its own state**.

### 🧩 Task

Expand your `BankAccount` example:

1. Create **two** accounts — one for *Alice* and one for *Bob*.
2. Give them different starting balances.
3. Make a few deposits and withdrawals on each.
4. Show their balances separately (they must not affect each other).

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
    alice = BankAccount(500)
    bob = BankAccount(1000)

    alice.deposit(200)
    bob.withdraw(300)

    alice.show()  # → 700
    bob.show()    # → 700


if __name__ == "__main__":
    main()
