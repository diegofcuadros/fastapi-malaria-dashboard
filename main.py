from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from typing import Optional
import psycopg2
import pandas as pd
import statistics
import statsmodels.api as sm
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Initial DB constants (optional redundancy)
DB_HOST = "localhost"
DB_PORT = "5436"
DB_NAME = "malaria_db"
DB_USER = "postgres"
DB_PASSWORD = "112714"

import os

# Overwrite with environment variables if set (providing defaults)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5436")
DB_NAME = os.getenv("DB_NAME", "malaria_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "112714")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    return conn

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI connected to PostgreSQL!"}

@app.get("/data")
def get_data():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, monthyear, site, NEWsiteID, region, malinc, propsuspected, TPR FROM malaria_records;")
    rows = cur.fetchall()
    result = []
    for row in rows:
        record = {
            "id": row[0],
            "monthyear": row[1].strftime("%Y-%m-%d") if row[1] else None,
            "site": row[2],
            "NEWsiteID": row[3],
            "region": row[4],
            "malinc": float(row[5]) if row[5] is not None else None,
            "propsuspected": float(row[6]) if row[6] is not None else None,
            "TPR": float(row[7]) if row[7] is not None else None,
        }
        result.append(record)
    cur.close()
    conn.close()
    return JSONResponse(content=result)

@app.get("/summary_stats")
def get_summary_stats(
    column: str = Query(..., description="Name of the numeric column, e.g., 'malinc', 'propsuspected', or 'TPR'"),
    region: Optional[str] = Query(None, description="Optional region filter"),
    site: Optional[str] = Query(None, description="Optional site filter")
):
    conn = get_db_connection()
    cur = conn.cursor()
    query = f"SELECT {column} FROM malaria_records WHERE {column} IS NOT NULL"
    params = []
    if region:
        query += " AND region = %s"
        params.append(region)
    if site:
        query += " AND site = %s"
        params.append(site)
    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    values = [float(row[0]) for row in rows]
    if not values:
        return JSONResponse(content={"error": "No data found for given filters."}, status_code=404)
    mean_val = statistics.mean(values)
    median_val = statistics.median(values)
    min_val = min(values)
    max_val = max(values)
    stdev_val = statistics.pstdev(values)
    result = {
        "column": column,
        "region_filter": region,
        "site_filter": site,
        "count": len(values),
        "mean": round(mean_val, 2),
        "median": round(median_val, 2),
        "min": round(min_val, 2),
        "max": round(max_val, 2),
        "std": round(stdev_val, 2)
    }
    return JSONResponse(content=result)

@app.get("/forecast")
def forecast(
    column: str = Query(..., description="Numeric column to forecast, e.g., 'malinc'"),
    steps: int = Query(12, description="Number of months to forecast")
):
    conn = get_db_connection()
    query = f"SELECT monthyear, {column} FROM malaria_records WHERE {column} IS NOT NULL"
    df = pd.read_sql_query(query, conn)
    conn.close()
    df['monthyear'] = pd.to_datetime(df['monthyear'])
    ts_df = df.groupby("monthyear")[column].mean().reset_index()
    ts_df.sort_values(by="monthyear", inplace=True)
    ts_df.set_index("monthyear", inplace=True)
    try:
        model = sm.tsa.ARIMA(ts_df[column], order=(1, 1, 1))
        results = model.fit()
    except Exception as e:
        return JSONResponse(content={"error": f"Model fitting failed: {str(e)}"}, status_code=500)
    try:
        forecast_results = results.forecast(steps=steps)
    except Exception as e:
        return JSONResponse(content={"error": f"Forecasting failed: {str(e)}"}, status_code=500)
    forecast_dict = {}
    last_date = ts_df.index[-1]
    future_dates = pd.date_range(last_date + pd.offsets.MonthBegin(), periods=steps, freq='MS')
    for date, val in zip(future_dates, forecast_results):
        forecast_dict[date.strftime("%Y-%m-%d")] = round(float(val), 2)
    return JSONResponse(content={
        "column": column,
        "steps": steps,
        "forecast": forecast_dict
    })

# NEW ENDPOINT: Data for Box/Violin Plots
@app.get("/box_data")
def get_box_data(
    column: str = Query(..., description="Name of the numeric column, e.g., 'malinc', 'propsuspected', or 'TPR'"),
    group_by: str = Query("region", description="Grouping variable, e.g., 'region' or 'site'")
):
    conn = get_db_connection()
    query = f"SELECT {group_by}, {column} FROM malaria_records WHERE {column} IS NOT NULL"
    df = pd.read_sql_query(query, conn)
    conn.close()
    # Group data by the grouping variable and collect numeric values into lists
    groups = df.groupby(group_by)[column].apply(list).reset_index()
    return JSONResponse(content=groups.to_dict(orient="records"))

# NEW ENDPOINT: Data for Heatmap Plot
@app.get("/heatmap_data")
def get_heatmap_data(
    column: str = Query(..., description="Name of the numeric column for heatmap, e.g., 'malinc'"),
    group_by: str = Query("region", description="Grouping variable for y-axis (e.g., 'region')"),
    time_extraction: bool = Query(True, description="Whether to extract month from monthyear")
):
    conn = get_db_connection()
    query = f"SELECT monthyear, {group_by}, {column} FROM malaria_records WHERE {column} IS NOT NULL"
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    # Convert 'monthyear' to datetime and extract month if required
    df['monthyear'] = pd.to_datetime(df['monthyear'])
    if time_extraction:
        df['month'] = df['monthyear'].dt.month
    else:
        df['month'] = df['monthyear']  # Use full date if preferred

    # Pivot the table so rows are groups and columns are months, values are averages of the column
    pivot_df = df.groupby([group_by, 'month'])[column].mean().unstack(fill_value=0)
    groups = pivot_df.index.tolist()         # y-axis labels
    months = pivot_df.columns.tolist()         # x-axis labels
    matrix = pivot_df.values.tolist()          # 2D array for z-values

    return JSONResponse(content={
        "groups": groups,
        "months": months,
        "matrix": matrix
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
