from collections import Counter



def main() -> None:
    '''Main entry point for the script.'''

    lst = ["Max", "Peter", "Max", "Orhan", "Max", "Orhan", "Peter", "John", "Yahya", "Yahya", "Orhan"]
    d_lst = Counter(lst)
    d_lst_top3 = d_lst.most_common(3)
    print(d_lst)
    print(d_lst_top3)
    print(d_lst["Yahya"])
    print(sum(d_lst.values()))
    print(dict(d_lst))

if __name__ == "__main__":
    main()


