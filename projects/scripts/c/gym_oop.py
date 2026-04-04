'''
**Task (3 min):** Build a tiny library checkout model showing classes, dataclasses, methods, inheritance, and composition.

* Create a `@dataclass Book(title: str, author: str)` and a `@dataclass Member(name: str)`.
* Make base class `Person` with `describe()`; let `Librarian(Person)` inherit and override `describe()`.
* Create `Library` that **composes** a `list[Book]` and has methods `add_book()`, `checkout(book, member)`.
* Ensure `checkout()` removes the book from inventory and returns a confirmation string.
* Briefly print: number of books before/after, and `Librarian().describe()`.


'''
from dataclasses import dataclass

@dataclass
class Book:
    title:str
    author:str

@dataclass
class Member:
    name:str

class Person:
    def __init__(self, name:str, age:int):
        self.name = name
        self.age = age

    def describe(self):
        return f"{self.name}, age {self.age}"

class Librarian(Person):
    def __init__(self, name:str, age:int):
        super().__init__(name, age)

    def describe(self):
        return f"{super().describe()} — Librarian of the library."

class Library:
    book_list:list[Book]
    members:list[Member]

    def __init__(self, book_list:list[Member], members:list[Member]):
        self.book_list = book_list
        self.members = members
    
    def add_book(self, book:Book):
        self.book_list.append(book)

    def checkout(self, book:Book, member:Member):
        if book in self.book_list and member in self.members:
            self.book_list.remove(book)
            print(f"{member.name} checked out '{book.title}' by {book.author}.")
        else:
            print("Either the book or member is not in the system.")


def main():
    '''Main entry point for the script.'''
    # Create books and members
    books = [Book("1984", "George Orwell"), Book("Dune", "Frank Herbert")]
    members = [Member("Ali"), Member("Sara")]

    # Create a librarian (inherits from Person)
    librarian = Librarian("John", 40)
    print(librarian.describe())

    # Create a library (composition of books and members)
    library = Library(books, members)
    print(f"Initial books: {[b.title for b in library.book_list]}")

    # Add a new book
    library.add_book(Book("Foundation", "Isaac Asimov"))

    # Checkout a book
    library.checkout(books[0], members[0])

    # Show remaining books
    print(f"Remaining books: {[b.title for b in library.book_list]}")

if __name__ == "__main__":
    main()
