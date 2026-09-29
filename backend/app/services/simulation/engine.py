import random
import math
from typing import List, Dict, Any

def pearson_correlation(x: List[float], y: List[float]) -> float:
    n = len(x)
    if n == 0: return 0.0
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_x_sq = sum(xi * xi for xi in x)
    sum_y_sq = sum(yi * yi for yi in y)
    
    numerator = (n * sum_xy) - (sum_x * sum_y)
    denominator = math.sqrt((n * sum_x_sq - sum_x**2) * (n * sum_y_sq - sum_y**2))
    
    if denominator == 0: return 0.0
    return numerator / denominator

def run_monte_carlo(iterations: int, variables: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Runs a Monte Carlo simulation based on dynamic variables.
    """
    expected_values = []
    
    # Store history of sampled variables for sensitivity analysis
    sampled_history = {v["name"]: [] for v in variables if v.get("distribution") != "fixed"}
    
    for _ in range(iterations):
        sampled_vars = {}
        for var in variables:
            dist = var.get("distribution", "fixed")
            if dist == "normal":
                val = random.gauss(var["mean"], var["std_dev"])
                sampled_vars[var["name"]] = val
                sampled_history[var["name"]].append(val)
            elif dist == "triangular":
                val = random.triangular(var["min"], var["max"], var["mode"])
                sampled_vars[var["name"]] = val
                sampled_history[var["name"]].append(val)
            else:
                sampled_vars[var["name"]] = var.get("value", 0)
        
        # Calculate outcome based on standard formula (mock formula for Market Expansion)
        # We need a robust general calculation based on the dynamic variables if possible.
        # But we'll keep the formula matching the assumptions we send from the UI.
        market_size = sampled_vars.get("Market Size", 2400000000)
        growth = sampled_vars.get("Market Growth", 0.082)
        cac = sampled_vars.get("CAC", 142)
        customers = sampled_vars.get("Customers", 10000)
        gross_margin = sampled_vars.get("Gross Margin", 0.41)
        
        # New robust formula including all assumptions
        # Revenue = Market Size * Growth
        # Profit = (Revenue * Gross Margin) - (CAC * Customers)
        revenue = market_size * growth
        val = (revenue * gross_margin) - (cac * customers)
        
        expected_values.append(val)
    
    # Calculate statistics
    mean_expected_value = sum(expected_values) / iterations
    downside_probability = sum(1 for v in expected_values if v < 0) / iterations
    
    # Calculate Sensitivities (Tornado Chart Data)
    sensitivities = []
    for var_name, values in sampled_history.items():
        corr = pearson_correlation(values, expected_values)
        sensitivities.append({
            "name": var_name,
            "correlation": corr,
            "impact": abs(corr)
        })
    
    # Sort by impact descending
    sensitivities.sort(key=lambda x: x["impact"], reverse=True)
    
    return {
        "expected_value": float(mean_expected_value),
        "downside_probability": float(downside_probability),
        "confidence_range": {
            "low": float(sorted(expected_values)[int(iterations * 0.05)]),
            "high": float(sorted(expected_values)[int(iterations * 0.95)])
        },
        "sensitivities": sensitivities,
        "iterations": iterations
    }
