'''
# ⚙️ **Task — Diagnostic Collector (≤ 45 min)**

**Goal:**
Build two small dataclasses that collect and process sensor readings efficiently.

---

**Requirements**

1. **`SensorReading` (`@dataclass`)**

   * Fields: `sensor_id: str`, `value: float`, `unit: str`, `timestamp: int`
   * Methods:

     * `to_json() -> str` → return JSON string
     * `@staticmethod from_json(data: str) -> SensorReading`

2. **`DiagnosticCollector` (`@dataclass`)**

   * Field: `readings: list[SensorReading]`
   * Methods:

     * `add_reading(reading: SensorReading)`
     * `avg_by_unit(unit: str) -> float` → average all readings matching `unit`

3. **Tests** (`pytest`)

   * Create two identical readings → assert equality (`__eq__`)
   * Add readings → assert correct average value
   * Round-trip one reading via JSON → assert equality restored

---

**Deliverables:**

* `models.py`
* `test_models.py`

'''
import json
from dataclasses import dataclass, asdict


@dataclass
class SensorReading:
    sensor_id: str
    value: float
    unit: str
    timestamp: int

    def to_json(self) -> str:
        return json.dumps(asdict(self))

    @staticmethod
    def from_json(data: str) -> 'SensorReading':
        return SensorReading(**json.loads(data))

@dataclass
class DiagnosticCollector:
    readings: list[SensorReading]

    def add_reading(self, reading: SensorReading) -> None:
        self.readings.append(reading)

    def avg_by_unit(self, unit: str) -> float:
        unit_readings = [r.value for r in self.readings if r.unit == unit]
        return sum(unit_readings) / len(unit_readings) if unit_readings else 0.0

