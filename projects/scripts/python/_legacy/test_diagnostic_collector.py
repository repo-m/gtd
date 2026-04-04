# test_models.py
from day3_diagnostic_collector import SensorReading, DiagnosticCollector

def test_reading_equality():
    a = SensorReading("T1", 25.0, "°C", 1696853200)
    b = SensorReading("T1", 25.0, "°C", 1696853200)
    assert a == b

def test_json_roundtrip():
    a = SensorReading("T1", 25.0, "°C", 1696853200)
    b = SensorReading.from_json(a.to_json())
    assert a == b

def test_avg_by_unit():
    dc = DiagnosticCollector(readings=[])
    dc.add_reading(SensorReading("T1", 20.0, "°C", 1))
    dc.add_reading(SensorReading("T2", 30.0, "°C", 2))
    dc.add_reading(SensorReading("P1", 100.0, "kPa", 3))
    assert dc.avg_by_unit("°C") == 25.0
    assert dc.avg_by_unit("kPa") == 100.0
    assert dc.avg_by_unit("m") == 0.0
