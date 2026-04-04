#!/usr/bin/env python3
import json
from dataclasses import dataclass
from typing import Dict, Optional

# -----------------------------------------------------------------------------
# CLASS: TokenBucket
# Purpose: Represents one user's token budget.
# Each user has a capacity (max tokens), refill rate (tokens/sec),
# and tracks how many tokens remain + last timestamp for refilling.
# -----------------------------------------------------------------------------
@dataclass
class TokenBucket:
    capacity: float                 # max tokens the bucket can hold
    refill_rate_per_sec: float      # tokens added per second
    tokens: float                   # current available tokens
    last_ts: Optional[int] = None   # last timestamp processed

    # Factory method to create a full bucket
    @classmethod
    def from_limits(cls, capacity: int, refill_rate_per_sec: int) -> "TokenBucket":
        return cls(
            capacity=float(capacity),
            refill_rate_per_sec=float(refill_rate_per_sec),
            tokens=float(capacity),   # start full
            last_ts=None
        )

    # Private helper — refills tokens based on time passed since last event
    def _refill_until(self, ts: int) -> None:
        if self.last_ts is None:
            # First event for this bucket — just set the timestamp
            self.last_ts = ts
            return
        if ts > self.last_ts:
            # Calculate how much time has passed
            elapsed = ts - self.last_ts
            # Add tokens = time * refill rate, but don't exceed capacity
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate_per_sec)
            self.last_ts = ts

    # Public method — consume tokens
    def take(self, ts: int, cost: int) -> bool:
        """
        Try to take 'cost' tokens at timestamp ts.
        Returns True if allowed (enough tokens), False if violation.
        """
        self._refill_until(ts)
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False


# -----------------------------------------------------------------------------
# CLASS: RateLimiter
# Purpose: Manages multiple TokenBuckets (one per user).
# Loads config, processes incoming events, records violations.
# -----------------------------------------------------------------------------
class RateLimiter:
    def __init__(self, default_capacity: int, default_refill: int,
                 overrides: Optional[Dict[str, Dict[str, int]]] = None):
        self.default_capacity = default_capacity
        self.default_refill = default_refill
        self.overrides = overrides or {}
        self.buckets: Dict[str, TokenBucket] = {}  # user -> TokenBucket
        self.violations: Dict[str, Dict[str, int]] = {}  # user -> stats

    # Validates one event line
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

    # Get (or create) the user's bucket
    def _bucket_for(self, user: str) -> TokenBucket:
        if user not in self.buckets:
            # Apply user-specific overrides if available
            limits = self.overrides.get(user, {})
            cap = int(limits.get("capacity", self.default_capacity))
            ref = int(limits.get("refill_rate_per_sec", self.default_refill))
            self.buckets[user] = TokenBucket.from_limits(cap, ref)
        return self.buckets[user]

    # Record a violation with timestamps
    def _record_violation(self, user: str, ts: int) -> None:
        v = self.violations.setdefault(user, {
            "violations": 0,
            "first_violation": ts,
            "last_violation": ts
        })
        v["violations"] += 1
        # Update earliest and latest violation timestamps
        if ts < v["first_violation"]:
            v["first_violation"] = ts
        if ts > v["last_violation"]:
            v["last_violation"] = ts

    # Process each event line from the file
    def process_events(self, events_path: str) -> None:
        with open(events_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    evt = json.loads(line)
                except json.JSONDecodeError:
                    continue  # skip invalid JSON

                if not self._validate_event(evt):
                    continue  # skip schema errors

                user = evt["user"]
                ts = evt["ts"]
                cost = evt["cost"]

                bucket = self._bucket_for(user)
                allowed = bucket.take(ts, cost)
                if not allowed:
                    self._record_violation(user, ts)

    # Return violation summary
    def summary(self) -> dict:
        return self.violations


# -----------------------------------------------------------------------------
# Helpers for loading config and running from CLI
# -----------------------------------------------------------------------------
def load_config(path: str) -> dict:
    """Loads JSON config file and validates required fields."""
    with open(path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
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
    """Entry point — read config, process events, print summary."""
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
