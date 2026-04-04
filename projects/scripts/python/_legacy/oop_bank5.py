'''
**Step 5 – Real Composition**

**Goal:**
Refactor your previous design so that `Bank` actually manages *real `BankAccount` objects*, not just dictionaries.

**Requirements:**

1. Create a class `BankAccount` (like before) with `deposit()`, `withdraw()`, and `show()` methods.
2. Create a class `Bank` that:
   * has a name;
   * stores multiple `BankAccount` objects (one per owner);
   * can add new accounts via `add_account(owner, balance)`;
   * can transfer money between accounts via `transfer(src_owner, dst_owner, amount)`;
   * can print all accounts with `show_accounts()`.

Expected output:

```
Bank: Volksbank
Alice: 300
Bob: 1200
```


'''

class BankAccount:

    def __init__(self, balance: int = 0) -> None:
        self.balance = balance

    def deposit(self, amount: int) -> None:
        self.balance += amount

    def withdraw(self, amount: int) -> bool:
        if amount <= self.balance:
            self.balance -= amount
            return True
        print("Insufficient funds")
        return False

    def show(self) -> None:
        print(self.balance)


class Bank:
    def __init__(self, bankname: str) -> None:
        self.bankname = bankname
        self.accounts: dict[str, BankAccount] = {}
    def add_account(self, owner: str, balance: int) -> None:
        self.accounts[owner] = BankAccount(balance)
    def transfer(self, src_owner: str, dst_owner: str, amount: int) -> None:
        if src_owner in self.accounts and dst_owner in self.accounts:
            if self.accounts[src_owner].withdraw(amount):
                self.accounts[dst_owner].deposit(amount)
        else:
            print("Unknown account(s)")
    def show_accounts(self) -> None:
        print(f"Bank: {self.bankname}")
        for owner, acc in self.accounts.items():
            print(f"{owner}: {acc.balance}")


class Bank:
    def __init__(self, bankname: str) -> None:
        self.bankname = bankname
        self.accounts: dict[str, BankAccount] = {}
    
    def add_account(self, owner: str, balance: int) -> None:
        self.accounts[owner] = BankAccount(balance)
    
    def transfer(self, src_owner: str, dst_owner: str, amount: int):
        if src_owner in self.accounts and dst_owner in self.accounts:
            if self.accounts[src_owner].withdraw(amount):
                self.accounts[dst_owner].deposit(amount)


    def show_accounts(self) -> None:
        print(f"Bank:{self.bankname}")
        for owner, acc in self.accounts.items():
            print(f"{owner}: {acc.balance}")


def main():
    '''Main entry point for the script'''
    bank = Bank("Volksbank")
    bank.add_account("Alice", 500)
    bank.add_account("Bob", 1000)
    bank.show_accounts()
    bank.transfer("Alice", "Bob", 200)
    bank.show_accounts()

if __name__ == "__main__":
    main()
