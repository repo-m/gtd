'''
# ⚙️ **Task — Sensor Statistics Manager (≤ 45 min)**

**Goal:**
Extend your modeling skills with another realistic backend-style problem involving structured data and summaries.

---

**Requirements**

1. **`Sensor` (`@dataclass`)**

   * Fields: `id: str`, `location: str`, `type: str`
   * Method: `to_json()` / `from_json()` (same idea as before)

2. **`SensorStats` (`@dataclass`)**

   * Field: `records: dict[str, list[float]]`  # maps sensor ID → readings
   * Methods:

     * `add_value(sensor_id: str, value: float)`
     * `avg(sensor_id: str) -> float`
     * `overall_avg() -> float` – average of all readings
     * `max_sensor() -> tuple[str, float]` – returns ID + max average

3. **Tests** (`pytest`)

   * Add a few readings to multiple sensors.
   * Assert per-sensor averages, overall average, and correct `max_sensor()` result.
   * Assert JSON round-trip for one `Sensor`.

---

**Deliverables:**

* `sensor_stats.py`
* `test_sensor_stats.py`

⏱️ *Estimated time:* 40–45 minutes.

'''

import json
from dataclasses import dataclass, asdict

@dataclass
class Sensor:
    id: str
    location: str
    type: str

    def to_json(self) -> str:
        return json.dumps(asdict(self))
    
    @staticmethod
    def from_json(data: str) -> 'Sensor':
        return Sensor(**json.load(data))


@dataclass
class SensorStats:
    records: dict[str, list[float]]

    def add_value(self, sensor_id: str, value: float):
        if sensor_id not in self.records:
            self.records[sensor_id] = []
        self.records[sensor_id].append(value)

    def avg(self, sensor_id: str) -> float:
        if sensor_id in self.records:
            average = sum(self.records[sensor_id]) / len(self.records[sensor_id])
            return average
        else: return 0

    def overall_avg(self) -> float:
        all_values = [v for values in self.records.values() for v in values]
        if all_values:
            return sum(all_values) / len(all_values)
        return 0.0

    def max_sensor(self) -> tuple[str, float]:
        max_id = ""
        max_average = 0.0
        for sensor_id, values in self.records.items():
            avg = self.avg(sensor_id)
            if avg > max_average:
                max_average = avg
                max_id = sensor_id
        return (max_id, max_average)
