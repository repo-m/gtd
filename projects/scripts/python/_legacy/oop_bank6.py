'''
Task: In BankAccount, make balance a read-only property; validate deposit/withdraw (no negatives); raise ValueError on bad input; implement __repr__; and write a tiny demo that shows errors handled gracefully.
'''

class BankAccount:

    def __init__(self, balance: int = 0) -> None:
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount: int) -> None:
        self._balance += amount

    def withdraw(self, amount: int) -> bool:
        if amount <= self.balance:
            self._balance -= amount
            return True
        print("Insufficient funds")
        return False

    def show(self) -> None:
        print(self._balance)


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
