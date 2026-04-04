from day3_sensor_stats import Sensor, SensorStats

'''
   * Assert per-sensor averages, overall average, and correct `max_sensor()` result.
   * Assert JSON round-trip for one `Sensor`.
'''



def test_reading_multiple_sensors():
    a = Sensor("100", "back", "temp")
    b = Sensor("200", "front", "voltage")
    assert a != b
    assert a.id == "100"
    assert b.location == "front"

def test_sensor_stats():
    c = SensorStats(records={"100": [18.00, 20.00]})
    assert c.records["100"] == [18.00, 20.00]

    c.add_value("100", 17.00)
    assert c.records["100"] == [18.00, 20.00, 17.00]

    overall_avg = c.overall_avg()
    assert overall_avg != 0

    d = SensorStats(records={"200": [20.00, 30.00]})
    d.add_value("300", 40.00)
    d.add_value("300", 55.00)
    d.add_value("300", 96.00)
    max_id, avrg= d.max_sensor()
    assert max_id == "300"