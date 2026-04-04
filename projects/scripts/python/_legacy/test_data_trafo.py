from day5_data_trafo import normalize_event, transform_stream, merge_stream, write_csv

def test_normalize_event():
    evt = {
    "ts": 172839123,          # alias for timestamp_ms
    "id": 257,                # int format, should become "0x101"
    "data": [12, 34, 56, 78]  # valid 0–255 values
    }

    expected_result = {
    "timestamp_ms": 172839123,
    "id": "0x101",
    "len": 4,
    "data": [12, 34, 56, 78]
    }

    assert normalize_event(evt) == expected_result


def test_transform_stream():
    records = [
    {"ts": 1000, "id": 0x101, "data": [1, 2, 3]},          # ✅ valid (alias key)
    {"timestamp": 1010, "id": "0x102", "data": [4, 5]},    # ✅ valid (string id)
    {"timestamp_ms": 1020, "id": 0x103, "data": [256]},    # ❌ invalid (data > 255)
    {"timestamp_ms": "1030", "id": 0x104, "data": [7]},    # ❌ invalid (timestamp not int)
    {"timestamp_ms": 1040, "data": [8, 9]},                # ❌ invalid (missing id)
    ]

    expected_result = [
    {"timestamp_ms": 1000, "id": "0x101", "len": 3, "data": [1, 2, 3]},
    {"timestamp_ms": 1010, "id": "0x102", "len": 2, "data": [4, 5]}
    ]

    assert transform_stream(records) == expected_result

def test_merge_stream():
    stream1 = [
    {"timestamp_ms": 1000, "id": "0x101", "len": 3, "data": [1, 2, 3]},
    {"timestamp_ms": 1030, "id": "0x102", "len": 2, "data": [4, 5]},
    ]

    stream2 = [
    {"timestamp_ms": 1015, "id": "0x201", "len": 1, "data": [9]},
    {"timestamp_ms": 1040, "id": "0x202", "len": 3, "data": [7, 8, 9]},
    ]

    expected_result = [
    {"timestamp_ms": 1000, "id": "0x101", "len": 3, "data": [1, 2, 3]},
    {"timestamp_ms": 1015, "id": "0x201", "len": 1, "data": [9]},
    {"timestamp_ms": 1030, "id": "0x102", "len": 2, "data": [4, 5]},
    {"timestamp_ms": 1040, "id": "0x202", "len": 3, "data": [7, 8, 9]},
    ]

    assert merge_stream(stream1, stream2) == expected_result
