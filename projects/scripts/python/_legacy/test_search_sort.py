'''
Tests (`pytest`)
   * Verify correct index for binary search (found/missing).
   * Check top-k returns sorted results.
   * Validate frequency counts.
   * Ensure products are ordered by category and descending price.
'''

from day3_search_sort import find_index, top_k, most_common, sort_products


def test_find_index():
    '''Test binary search index finding.'''
    nums = [1, 3, 5, 7, 9]
    assert find_index(nums, 7) == 3


def test_top_k():
    '''Test top-k elements extraction.'''
    nums2 = [5, 1, 8, 3, 10]
    assert top_k(nums2, 3) == [10, 8, 5]


def test_most_common():
    '''Test frequency counting and top-k extraction.'''
    items = ["VW", "Audi", "VW", "BMW", "VW", "BMW"]
    assert most_common(items, 2) == [('VW', 3), ('BMW', 2)]


def test_sort_products():
    '''Test sorting products by category and descending price.'''
    products = [{"category": "A", "price": 100}, {"category": "A", "price": 300},
                {"category": "B", "price": 150}, {"category": "B", "price": 90}]


    assert sort_products(products) == [{'category': 'A', 'price': 300},
                                       {'category': 'A', 'price': 100},
                                       {'category': 'B', 'price': 150},
                                       {'category': 'B', 'price': 90}]
