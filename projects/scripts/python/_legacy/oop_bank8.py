from abc import ABC, abstractmethod


# -------------------- Abstract Base Class --------------------
class Account(ABC):
    @property
    @abstractmethod
    def balance(self) -> int:
        """Return current balance."""
        pass

    @abstractmethod
    def deposit(self, amount: int) -> None:
        """Deposit money into the account."""
        pass

    @abstractmethod
    def withdraw(self, amount: int) -> bool:
        """Withdraw money from the account."""
        pass


# -------------------- Concrete Base Class --------------------
class BankAccount(Account):
    def __init__(self, balance: int = 0) -> None:
        self._balance = balance

    @property
    def balance(self) -> int:
        return self._balance

    def deposit(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("Deposit must be positive.")
        self._balance += amount

    def withdraw(self, amount: int) -> bool:
        if amount <= 0:
            raise ValueError("Withdraw must be positive.")
        if amount > self._balance:
            print("Insufficient funds")
            return False
        self._balance -= amount
        return True

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(balance={self._balance})"


# -------------------- Subclasses --------------------
class SavingsAccount(BankAccount):
    def __init__(self, balance: int, interest_rate: float) -> None:
        super().__init__(balance)
        self.interest_rate = interest_rate

    def apply_interest(self) -> None:
        interest = self.balance * self.interest_rate
        self.deposit(interest)


class CheckingAccount(BankAccount):
    def __init__(self, balance: int, fee: int) -> None:
        super().__init__(balance)
        self.fee = fee

    def withdraw(self, amount: int) -> bool:
        total = amount + self.fee
        return super().withdraw(total)


# -------------------- Demo --------------------
def main():
    accounts = [
        SavingsAccount(1000, 0.05),
        CheckingAccount(500, 5),
    ]

    for acc in accounts:
        acc.deposit(100)
        acc.withdraw(50)
        print(f"{acc}: balance = {acc.balance}")


if __name__ == "__main__":
    main()
