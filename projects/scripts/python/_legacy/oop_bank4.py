'''
### 🧩 Task

Build a class `Bank` that manages multiple `BankAccount` objects.

'''

class Bank:
    bankname: str
    owner_balance: list[dict]

    def __init__(self, bankname: str):
        self.bankname = bankname
        self.owner_balance = []

    def add_account(self, owner: str, balance: int):
        self.owner_balance.append({owner: balance})


    def show_accounts(self):
        print(f"Bank:{self.bankname}")
        for account in self.owner_balance:
            for owner, balance in account.items():
                print(f"{owner}: {balance}")


def main():
    '''Main entry point for the script'''
    bank = Bank("Volksbank")
    bank.add_account("Alice", 500)
    bank.add_account("Bob", 1000)
    bank.show_accounts()


if __name__ == "__main__":
    main()

