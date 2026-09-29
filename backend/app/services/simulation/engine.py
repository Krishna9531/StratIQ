import random
from typing import List, Dict, Any

def run_monte_carlo(iterations: int, variables: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Runs a Monte Carlo simulation based on dynamic variables.
    """
    expected_values = []
    
    # Extract variables for easier access
    var_map = {v["name"]: v for v in variables}
    
    for _ in range(iterations):
        # Sample each variable based on its distribution
        sampled_vars = {}
        for var in variables:
            dist = var.get("distribution", "fixed")
            if dist == "normal":
                sampled_vars[var["name"]] = random.gauss(var["mean"], var["std_dev"])
            elif dist == "triangular":
                sampled_vars[var["name"]] = random.triangular(var["min"], var["max"], var["mode"])
            else:
                sampled_vars[var["name"]] = var.get("value", 0)
        
        # Calculate outcome based on standard formula (mock formula for Market Expansion)
        # Outcome = (Market Size * Market Growth) - (CAC * Customers Acquired)
        market_size = sampled_vars.get("Market Size", 2400000000)
        growth = sampled_vars.get("Market Growth", 0.082)
        cac = sampled_vars.get("CAC", 142)
        customers = sampled_vars.get("Customers", 10000)
        
        val = (market_size * growth) - (cac * customers)
        expected_values.append(val)
    
    # Calculate statistics
    mean_expected_value = sum(expected_values) / iterations
    downside_probability = sum(1 for v in expected_values if v < 0) / iterations
    
    # Generate a histogram distribution for the frontend UI
    # For a minimal UI, we just need a few buckets to draw the bell curve
    min_val = min(expected_values)
    max_val = max(expected_values)
    
    return {
        "expected_value": float(mean_expected_value),
        "downside_probability": float(downside_probability),
        "confidence_range": {
            "low": float(sorted(expected_values)[int(iterations * 0.05)]),
            "high": float(sorted(expected_values)[int(iterations * 0.95)])
        },
        "iterations": iterations
    }
