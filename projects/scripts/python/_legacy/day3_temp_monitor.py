'''
# ⚙️ **Task — Temperature Monitor (≤ 45 min)**

## Goal

Create a small class that collects temperature readings per location and computes useful summaries.

## Requirements

1. **`@dataclass TemperatureMonitor`**

   * Field: `data: dict[str, list[float]]` → maps *location → list of temperatures*
   * Methods:

     * `add_temp(location: str, value: float)` → store temperature
     * `avg_temp(location: str) -> float` → average temperature for one location
     * `overall_avg() -> float` → average temperature of all locations
     * `hottest_location() -> tuple[str, float]` → location with highest average temperature

2. **Tests (`pytest`)**

   * Add several readings for multiple locations.
   * Assert correct per-location average.
   * Assert `hottest_location()` returns the right name and value.
   * Test that missing locations return `0.0` for average.

## Deliverables

* `temperature_monitor.py`
* `test_temperature_monitor.py`

'''

from dataclasses import dataclass

@dataclass
class TemperatureMonitor:
    data: dict[str, list[float]]

    def add_temp(self, location: str, value: float):
        if location not in self.data:
            self.data[location] = []
        self.data[location].append(value)

    def avg_temp(self, location: str) -> float:
        values = self.data.get(location)
        if values:
            return sum(values) / len(values)
        return 0.0
    
    def overall_avg(self) -> float:
        all_values = [v for values in self.data.values() for v in values]
        if all_values:
            return sum(all_values) / len(all_values)
        return 0.0
    
    def hottest_location(self) -> tuple[str, float]:
        max_location = " "
        max_temp = 0.00
        temp = 0.00
        location = " "
        for i in self.data:
            temp = self.avg_temp(i)
            if max_temp < temp:
                max_temp = temp
                max_location = i
        return (max_location, max_temp)
