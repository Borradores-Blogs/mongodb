import pandas as pd
from pymongo import MongoClient
import numpy as np

# ======================================
# CONEXIÓN
# ======================================
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# LOAD DATA
print("\n📥 Cargando CSV...")
df = pd.read_csv(CSV_PATH)

print(f"Filas originales: {len(df)}")

# DATA CLEANING
print("\n🧹 Data Cleaning...")

def clean_data(df):
    df = df.copy()

    # Normalize column names
    df.columns = df.columns.str.strip().str.lower()

    # Convert numeric types
    df["score"] = pd.to_numeric(df["score"], errors="coerce")
    df["ratings"] = pd.to_numeric(df["ratings"], errors="coerce")

    # Empty strings → NaN
    df["price_range"] = df["price_range"].replace("", np.nan)

    # Delete unnamed records
    df = df.dropna(subset=["name"])

    return df

df = clean_data(df)
print(f"Rows after cleaning: {len(df)}")

# ======================================
# FEATURE ENGINEERING
# ======================================
print("\n⚙️ Feature Engineering...")

# The function converts any category value into a clean list of strings, with no nulls, no extra spaces, and no empty elements.
def clean_category(category):
    if pd.isna(category):
        return []

    return [
        c.strip()
        for c in str(category).split(",") if c.strip()
    ]

def engineer_features(df):
    df = df.copy()

    # Category -> Array
    df["category"] = df["category"].apply(clean_category)

    # Address -> Embedded Document
    # The `.notna()` method returns a Boolean string indicating which values ​​are not null (True if there is data, False if it's NaN).
    # The `.where(condition, value)` method retains the original values ​​where the condition is True. Where the condition is False (i.e., the value was null), it replaces it with `value`.
    # This line takes the `zip_code` column, replaces null (NaN) values ​​with `None`, and ensures that everything is in object format.
    zip_codes = df["zip_code"].where(df["zip_code"].notna(), None).astype("object")

    # In zip(...) the zip function takes two (or more) iterables and combines them in pairs. In this case, each iteration returns a tuple (address, zip_code)
    df["address"] = [
        {
            "full_address": address,
            "zip_code": str(zip_code) if zip_code is not None else None
        }
        for address, zip_code in zip(df["full_address"], zip_codes)
    ]

    # GeoJSON
    # The `pd.isna(lat)` function checks if `lat` is null (`NaN`, `None`, `empty`). It returns `True` if the latitude is missing.
    df["location"] = [
        None if pd.isna(lat) or pd.isna(lng)
        else {
            "type": "Point",
            "coordinates": [float(lng), float(lat)]
        }
        for lat, lng in zip(df["lat"], df["lng"])
    ]

    # Drop obsolete columns
    df.drop(columns=["full_address", "zip_code", "lat", "lng"], inplace=True)

    return df

df = engineer_features(df)
