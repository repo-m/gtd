# 🗓️ 6-Day Python Interview Plan

## Day 1 – Python Basics & Syntax

* **1️⃣ Core Syntax & Style (PEP 8)**
  * ✅ Done – Practiced variables, types, control flow, docstrings, `main()` structure.
* **2️⃣ File I/O + Error Handling**
  * ✅ Done – Completed `safe_read()` and logger examples using `with` + `try/except`.
* **3️⃣ Mini-Project: Vehicle CAN Log**
  * ✅ Done – Finished `day1_vehicle_logger.py` writing and reading CAN-style frames.
* **4️⃣ Tooling: pylint + pytest**
  * ✅ In Progress – Installation blocked by MSYS2 `db.lck`; needs fixing to proceed.
* **5️⃣ Deliverable: Script + Test File + Reports**
  * ✅  Pending – Script ready; tests and reports will follow after tooling setup.

---

## 🗓️ **Day 2 – Data Structures & Structured Data**

### 🎯 **Focus & Goals**

* Master **lists**, **tuples**, **sets**, and **dictionaries**
* Format text using **f-strings** and understand `repr` vs `str`
* Differentiate between **`bytes`** and **`str`**
* Write pythonic loops with **`enumerate`**, **`zip`**, **`any`**, **`all`**
* Use **`defaultdict`** and `setdefault` for dictionary defaults
* Apply **set operations** — union (`|`), intersection (`&`), difference (`-`)
* Handle structured data with **`json.dumps()`**, **`json.loads()`**, **`json.dump()`**, **`json.load()`**
* 🧩 Mini-Project: Build a **CAN log parser** that summarizes messages and exports a CSV

### ✅ **Tasks Completed**

* Lists / Tuples / Sets / Dicts — implemented and tested
* f-strings + `repr` vs `str` — covered
* `bytes` vs `str` — understood
* Pythonic loops (`enumerate`, `zip`, `any`, `all`) — exercised
* Dictionary defaults — conceptually covered
* Set operations — implemented with 3 functions
* JSON I/O — implemented (`student.json` example)
* 🧩 Mini-Project `day2_can_parser.py` — functional version complete with validation, delta-time, and CSV export

## Day 3 – Functions & OOP

| Block          | Focus                     | Tasks                                                                                                                                           | Deliverables            |
| -------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **1 ✅** | **Data models**           | Use `@dataclass` with type hints; implement `__init__`, `__repr__`, `__eq__`; serialize/deserialize via `json`; apply composition where useful. | `models.py`             |
| **2 ✅** | **Core operations speed** | Compare list, set, and dict performance (insert/search/delete) using `timeit`; practice comprehension optimizations.                            | `ops.py` + tests        |
| **3 ✅** | **Benchmarking**          | Create small `timeit` and `perf_counter` scripts; show how algorithmic complexity scales; apply `lru_cache` to memoize.                         | `benchmarks.md`         |
| **4 ✅** | **Searching & sorting**   | Implement binary search (`bisect`), counting (`Counter.most_common`), and sorting with custom keys.                                             | `algos.py` + tests      |
| **5 ✅* | **Robustness & logging**  | Add clear exception handling, context managers, and structured logging setup (`logging` module).                                                | `robust.py`             |
| **6 ✅** | **CLI + profiling**       | Wrap main functionality in a simple `argparse` CLI; run a short `cProfile` trace.                                                               | `cli.py`, `profile.txt` |
| **7 ✅** | **Review & Reflection**   | Summarize Big-O insights, key syntax, and optimization takeaways.                                                                               | `README.md`             |

---

## Day 4 – Algorithms I

| WP    | Focus                 | Goal                                                    | Deliverable             |
| ----- | --------------------- | ------------------------------------------------------- | ----------------------- |
| **1✅** | Efficient Loops       | Practice counting, min/max, filtering without built-ins | `loops_basics.py`       |
| **2✅** | Searching             | Implement linear + binary search; measure with `timeit` | `search_algos.py`       |
| **3✅** | Fault Counter Project | Parse multiple JSON files and summarize fault codes     | `day4_fault_counter.py` |
| **4✅** | Complexity Report     | Summarize O-notation and runtime comparison             | `complexity.md`         |

---

## Day 5 – Algorithms II

**Focus:** Sorting, recursion, data transformation
**Tasks:**

* ✅Compare recursive and iterative solutions
* ✅**Mini-Project:** Build a *log aggregator* that merges multiple sensor streams into chronological order
* ✅**Tooling:** Add Makefile for build/test automation; verify correctness via `pytest`

---

## Day 6 – Advanced Python

**Focus:** Generators, decorators, concurrency, backend traceability
**Tasks:**

* ✅Explore iterators, decorators, `asyncio` basics
* ✅**Mini-Project:** Create a *concurrent log processor* that processes large files using threads or async
* ✅**Tooling:** Add structured logging + exception hierarchy
* ✅**Deliverable:** `day6_concurrent_processor.py` + unit tests

## Mapping

12: Day6 + Day7 + 8pm: Interview (2/20) + refactor doc_python.md
13: 6x Interviews (8/20) + refactor doc_python.md
14: 6x Interviews (14/20) + refactor doc_python.md
15: 6x Interviews (20/20) + refactor doc_python.md
16: Check doc_python.md

## TODO

- h gift
- compare plan and find gaps
