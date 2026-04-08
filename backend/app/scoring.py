def calculate_risk(sensor_data) -> dict:
    score = 0

    if sensor_data.temperature >= 85:
        score += 30
    elif sensor_data.temperature >= 70:
        score += 15

    if sensor_data.vibration >= 0.7:
        score += 35
    elif sensor_data.vibration >= 0.4:
        score += 20

    if sensor_data.runtime_hours >= 2000:
        score += 20
    elif sensor_data.runtime_hours >= 1000:
        score += 10

    if sensor_data.pressure < 4.0 or sensor_data.pressure > 6.0:
        score += 15

    score = min(score, 100)

    if score >= 70:
        status = "critical"
        message = "High maintenance risk detected"
        recommendation = "Inspect machine immediately"
    elif score >= 40:
        status = "warning"
        message = "Elevated maintenance risk detected"
        recommendation = "Schedule maintenance soon"
    else:
        status = "ok"
        message = "Machine operating normally"
        recommendation = "No immediate action required"

    return {
        "risk_score": score,
        "status": status,
        "message": message,
        "recommendation": recommendation
    }