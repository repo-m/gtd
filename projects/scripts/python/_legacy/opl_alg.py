'''
Task 1 — Algorithmic Core (30 min)
'''


def selection_sort(lst: list) -> list:
    '''Sort the list using selection sort.'''
    sorted_lst = []
    unsorted_lst = lst.copy()
    for _ in range(len(lst)):
        smallest = min(unsorted_lst)
        sorted_lst.append(smallest)
        unsorted_lst.remove(smallest)
    return sorted_lst


def count_occurences(lst: list) -> dict:
    '''Counts occurrences and returns list[dict]'''
    result: dict = {}
    if len(lst) <= 1:
        print("List is empty")
        raise ValueError
    for k, v in enumerate(lst):
        if v not in result:
            result[v] = 1
        else:
            result[v] += 1
    return result


def linear_search(lst: list, x):
    '''Manual linear search.'''
    result: list = []
    if len(lst) <= 1:
        print("List is empty")
        raise ValueError
    for i in range(len(lst)):
        if lst[i] == x:
            result = i
            break
    return result


def main():
    '''Main entry point of the script.'''
    nums = [7, 3, 5, 3, 9, 3, 1, 7, 5, 2]
    words = ["can", "bus", "can", "lin", "can", "uds", "lin", "doip", "uds"]
    pairs = [(3, 4), (1, 9), (5, 2), (3, 1), (9, 0)]

    print(linear_search(nums, 9))
    print(linear_search(words, "uds"))
    print(linear_search(pairs, (5, 2)))

    print(count_occurences(nums))
    print(count_occurences(words))
    print(count_occurences(pairs))

    print(selection_sort(nums))
    print(selection_sort(words))
    print(selection_sort(pairs))


    target_num = 3
    target_word = "lin"
    top_k = 2


if __name__ == "__main__":
    main()