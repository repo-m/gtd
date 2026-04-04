'''
WP2 – Searching: Practice linear and binary search, understand when to use each, and reason about 
their efficiency.
'''

import logging
from bisect import bisect_left
import argparse


def binary_search(lst: list, target: int) -> int:
    '''binary search w. bisect_left'''
    result = -1
    sorted_lst = sorted(lst)
    index = bisect_left(sorted_lst, target)
    if index < len(sorted_lst) and sorted_lst[index] == target:
            result = index
    return result


def linear_search(lst: list, target: int) -> int:
    '''manual linear search'''
    result = -1
    for i, val in enumerate(lst):
        if val == target:
            result = i
            break
    return result


def main():
    '''script w. logger, arg and control logic'''
    logging.basicConfig(level=logging.DEBUG)
    logger = logging.getLogger(__name__)

    numbers = [20, 35, 78, 100, 5, 32, 15, 8, 95, 50, 21, 72, 63, 54, 25, 14, 16, 58, 49, 28]

    parser = argparse.ArgumentParser(description="Practicing Searching")
    parser.add_argument("--target", type= int, help='e.g. "42"')
    parser.add_argument("--print", type=str, help="prints numbers")
    args = parser.parse_args()

    if args.print:
        logger.info(f"numbers = {numbers}")
    if args.target is not None:
        logger.info(f"linear_search(numbers, {args.target}):{linear_search(numbers, args.target)}")
        logger.info(f"binary_search(numbers, {args.target}):{binary_search(numbers, args.target)}")


if __name__ == "__main__":
    main()
