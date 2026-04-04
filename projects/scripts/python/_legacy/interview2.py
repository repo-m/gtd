'''
**Task:** 
- implement a per-user **token-bucket rate limiter** that loads events from `events.jsonl`, enforces limits, and reports violations as JSON; 
- design classes `TokenBucket` (capacity, refill_rate_per_sec, `take(n)`) and `RateLimiter` (`load_config`, `process(events)`, `summary`), 
- validate inputs, 
- maintain per-user buckets, 
- and output per-user counts plus first/last violation timestamps.
- Use only stdlib; start when ready—I’ll stay in interviewer mode; sample data below.

**config.json**

```json
{
  "default": {"capacity": 10, "refill_rate_per_sec": 5},
  "overrides": {
    "user_a": {"capacity": 20, "refill_rate_per_sec": 10}
  }
}
```

**events.jsonl**

```json
{"ts": 1000, "user": "user_a", "cost": 3}
{"ts": 1001, "user": "user_b", "cost": 4}
{"ts": 1002, "user": "user_a", "cost": 18}
{"ts": 1003, "user": "user_b", "cost": 8}
{"ts": 1008, "user": "user_a", "cost": 5}
{"ts": 1015, "user": "user_b", "cost": 6}
```

'''
#!/usr/bin/env python3
import json
from dataclasses import dataclass
from typing import Dict, Optional

# ---- Domain classes ---------------------------------------------------------

@dataclass
class TokenBucket:
    capacity: float
    refill_rate_per_sec: float
    tokens: float
    last_ts: Optional[int] = None  # last timestamp we accounted for

    @classmethod
    def from_limits(cls, capacity: int, refill_rate_per_sec: int) -> "TokenBucket":
        return cls(capacity=float(capacity),
                   refill_rate_per_sec=float(refill_rate_per_sec),
                   tokens=float(capacity),
                   last_ts=None)

    def _refill_until(self, ts: int) -> None:
        if self.last_ts is None:
            self.last_ts = ts
            return
        if ts > self.last_ts:
            elapsed = ts - self.last_ts
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate_per_sec)
            self.last_ts = ts

    def take(self, ts: int, cost: int) -> bool:
        """Return True if allowed (tokens deducted), False if violation."""
        self._refill_until(ts)
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False

# ---- Rate limiter orchestrator ---------------------------------------------

class RateLimiter:
    def __init__(self, default_capacity: int, default_refill: int,
                 overrides: Optional[Dict[str, Dict[str, int]]] = None):
        self.default_capacity = default_capacity
        self.default_refill = default_refill
        self.overrides = overrides or {}
        self.buckets: Dict[str, TokenBucket] = {}
        self.violations: Dict[str, Dict[str, int]] = {}

    @staticmethod
    def _validate_event(evt: dict) -> bool:
        try:
            return (
                isinstance(evt["ts"], int) and
                isinstance(evt["user"], str) and
                isinstance(evt["cost"], int) and evt["cost"] >= 0
            )
        except (KeyError, TypeError):
            return False

    def _bucket_for(self, user: str) -> TokenBucket:
        if user not in self.buckets:
            limits = self.overrides.get(user, {})
            cap = int(limits.get("capacity", self.default_capacity))
            ref = int(limits.get("refill_rate_per_sec", self.default_refill))
            self.buckets[user] = TokenBucket.from_limits(cap, ref)
        return self.buckets[user]

    def _record_violation(self, user: str, ts: int) -> None:
        v = self.violations.setdefault(user, {"violations": 0, "first_violation": ts, "last_violation": ts})
        v["violations"] += 1
        if ts < v["first_violation"]:
            v["first_violation"] = ts
        if ts > v["last_violation"]:
            v["last_violation"] = ts

    def process_events(self, events_path: str) -> None:
        with open(events_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    evt = json.loads(line)
                except json.JSONDecodeError:
                    continue  # skip bad lines
                if not self._validate_event(evt):
                    continue  # skip invalid schema

                user = evt["user"]
                ts = evt["ts"]
                cost = evt["cost"]

                bucket = self._bucket_for(user)
                allowed = bucket.take(ts, cost)
                if not allowed:
                    self._record_violation(user, ts)

    def summary(self) -> dict:
        return self.violations

# ---- CLI-ish entrypoint -----------------------------------------------------

def load_config(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    # minimal validation
    default = cfg.get("default", {})
    if not {"capacity", "refill_rate_per_sec"} <= set(default.keys()):
        raise ValueError("config.default must include capacity and refill_rate_per_sec")
    overrides = cfg.get("overrides", {})
    return {
        "default_capacity": int(default["capacity"]),
        "default_refill": int(default["refill_rate_per_sec"]),
        "overrides": overrides,
    }

def main():
    import sys
    cfg_path = "config.json"
    events_path = "events.jsonl"
    if len(sys.argv) >= 2:
        cfg_path = sys.argv[1]
    if len(sys.argv) >= 3:
        events_path = sys.argv[2]

    cfg = load_config(cfg_path)
    rl = RateLimiter(cfg["default_capacity"], cfg["default_refill"], cfg["overrides"])
    rl.process_events(events_path)
    print(json.dumps(rl.summary(), indent=2, sort_keys=True))

if __name__ == "__main__":
    main()
