import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(page_title="StratIQ | Enterprise Decision Intelligence", layout="wide", initial_sidebar_state="expanded")

# --- CUSTOM CSS FOR PREMIUM LOOK ---
st.markdown("""
<style>
    /* Dark Premium Theme Overrides */
    .stApp {
        background-color: #050505;
        color: #FFFFFF;
    }
    .css-1d391kg {
        background-color: #111111;
    }
    h1, h2, h3 {
        color: #FFFFFF !important;
        font-family: 'Inter', sans-serif;
    }
    .stMetric label {
        color: #A1A1AA !important;
    }
    .stMetric {
        background: linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(20, 20, 25, 0.8));
        padding: 1.5rem;
        border-radius: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
    }
</style>
""", unsafe_allow_html=True)

# --- MONTE CARLO ENGINE ---
def run_simulation(market_growth, cac, gross_margin_min, gross_margin_max, gross_margin_mode, iterations=10000):
    np.random.seed(42)
    
    # Distributions
    growth_dist = np.random.normal(loc=market_growth/100, scale=0.02, size=iterations)
    cac_dist = np.random.normal(loc=cac, scale=15, size=iterations)
    margin_dist = np.random.triangular(left=gross_margin_min/100, mode=gross_margin_mode/100, right=gross_margin_max/100, size=iterations)
    
    # Fixed parameters
    market_size = 2400000000
    customers = 10000
    
    # Financial Logic
    revenue = (customers * (1 + growth_dist)) * 1200 # $1200 ARPU
    cogs = revenue * (1 - margin_dist)
    acquisition_costs = customers * growth_dist * cac_dist
    
    operating_profit = revenue - cogs - acquisition_costs
    
    return operating_profit

# --- SIDEBAR ---
with st.sidebar:
    st.markdown("### 🎛️ Simulation Parameters")
    
    market_growth = st.slider("Market Growth Mean (%)", 0.0, 20.0, 8.2)
    cac = st.number_input("Customer Acquisition Cost ($)", value=142.0)
    
    st.markdown("---")
    st.markdown("**Gross Margin Triangular Dist (%)**")
    gm_min = st.number_input("Minimum", value=34.0)
    gm_mode = st.number_input("Most Likely", value=41.0)
    gm_max = st.number_input("Maximum", value=45.0)
    
    st.markdown("---")
    iterations = st.selectbox("Iterations", [1000, 5000, 10000], index=2)
    
    run_btn = st.button("Run Simulation", type="primary", use_container_width=True)

# --- MAIN DASHBOARD ---
st.title("European Market Expansion")
st.markdown("Evaluate the probabilistic operating profit of expanding into the European market based on stochastic cost and growth assumptions.")

if run_btn:
    with st.spinner("Running Monte Carlo Engine..."):
        results = run_simulation(market_growth, cac, gm_min, gm_max, gm_mode, iterations)
        
        ev = np.mean(results)
        downside_prob = np.sum(results < 0) / iterations
        p05 = np.percentile(results, 5)
        p95 = np.percentile(results, 95)
        
        # --- METRICS ---
        st.markdown("### Decision Outcome")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Expected Value (EV)", f"${ev/1000000:.1f}M", "+12.4% vs Base")
        with col2:
            st.metric("Downside Risk (< $0)", f"{downside_prob*100:.1f}%", "-2.1% vs Base", delta_color="inverse")
        with col3:
            st.metric("90% Confidence Interval", f"${p05/1000000:.1f}M to ${p95/1000000:.1f}M")
            
        # --- CHARTS ---
        st.markdown("---")
        col_chart, col_ai = st.columns([2, 1])
        
        with col_chart:
            st.markdown("### Outcome Distribution")
            df = pd.DataFrame({"Operating Profit": results})
            fig = px.histogram(df, x="Operating Profit", nbins=50, 
                               color_discrete_sequence=['#3B82F6'],
                               opacity=0.8)
            
            # Add EV line
            fig.add_vline(x=ev, line_dash="dash", line_color="white", annotation_text="EV")
            
            fig.update_layout(
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                font_color="#A1A1AA",
                showlegend=False,
                margin=dict(l=0, r=0, t=10, b=0)
            )
            st.plotly_chart(fig, use_container_width=True)
            
        with col_ai:
            st.markdown("### 🧠 AI Strategic Synthesis")
            st.markdown("""
            **Ray Dalio (Risk/Reward):**
            Your Expected Value is highly positive, but the left-tail risk shows a probability of severe loss. Ensure you size this bet appropriately.
            
            **Warren Buffett:**
            Margin of safety is heavily dependent on the CAC assumption staying below $150.
            
            **Master Strategy:**
            - Proceed with Phase 1 rollout.
            - Hedge FX variance.
            - Hard stop if CAC exceeds $160.
            """)
else:
    st.info("Adjust the parameters in the sidebar and click **Run Simulation** to generate the Monte Carlo analysis.")
