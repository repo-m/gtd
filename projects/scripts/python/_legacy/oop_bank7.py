'''
**`CheckingAccount`**
     * Overrides `withdraw()` to automatically subtract the fee.
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


class SavingsAccount(BankAccount):
    def __init__(self, balance: int, interest_rate: float):
        self.interest_rate = interest_rate
        super().__init__(balance)

    def apply_interest(self):
        interest = self.balance * self.interest_rate
        self.deposit(interest)


class CheckingAccount(BankAccount):
    def __init__(self, balance: int, fee: int):
        self.fee = fee
        super().__init__(balance)

    def withdraw(self, amount: int) -> bool:
        total = amount + self.fee
        return super().withdraw(total)


def main():
    '''Main entry point for the script'''
    s = SavingsAccount(1000, 0.05)
    s.apply_interest()          # balance → 1050
    c = CheckingAccount(500, fee=5)
    c.withdraw(100)             # balance → 395
    print(s.balance, c.balance)


if __name__ == "__main__":
    main()
