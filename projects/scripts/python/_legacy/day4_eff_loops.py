'''
🧩 WP1 – Efficient Loops: Practice iteration, counting, filtering, and built-ins to extract insights
 from simple datasets. Write a Python script that analyses a list of sensor readings:
'''
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def check_sensors(readings: list[dict]) -> str:
    '''Check if all sensors have a `"status"` key and if *any* have `"fail"`.'''
    result = "Not Checked"
    if all(i["status"] for i in readings): 
        result = "Check: All sensors have a status"
        if any(i["status"] == "fail" for i in readings):
            result += " but at least one has status = fail!"
        else:
            result += " and all status != fail"
    else:
        result = "Check: Not all sensors have a status"
    return result

def find_min_max(readings: list[dict]) -> dict:
    '''Find the minimum, maximum, and average temperature.'''
    if len(readings) != 0:
        min_temp = min(i["temp"] for i in readings)
        max_temp = max(i["temp"] for i in readings)
        average_temp = sum(i["temp"] for i in readings) / len(readings)
    else:
        min_temp = 0
        max_temp = 0
        average_temp = 0
    result = {"Min": min_temp, "Max": max_temp, "Average": average_temp}
    return result


def list_sensor_ids(readings: list[dict]) -> list:
    '''List all sensor IDs where `temp > 30`.'''
    result = []
    for i in readings:
        if i["temp"] > 30:
            result.append(i["id"])
    return result


def count_status(readings: list[dict]) -> dict:
    '''Count how many readings fall into each `status` category.'''
    result = {} 
    for i in readings:
        if i["status"] not in result:
            result[i["status"]] = 1
        else:
            result[i["status"]] += 1
    return result


def main():
    readings = [
    {"id": 1, "temp": 22, "status": "ok"},
    {"id": 2, "temp": 35, "status": "warn"},
    {"id": 3, "temp": 19, "status": "ok"},
    {"id": 4, "temp": 40, "status": "fail"},
    {"id": 5, "temp": 25, "status": "ok"},
    ]
    logger.debug(f"Given readings:{readings}\n")
    logger.info(f"count_status(readings):{count_status(readings)}\n")
    logger.info(f"list_sensor_ids(readings):{list_sensor_ids(readings)}\n")
    logger.info(f"find_min_max(readings):{find_min_max(readings)}\n")
    logger.info(f"check_sensors(readings):{check_sensors(readings)}\n")


if __name__ == "__main__":
    main()


