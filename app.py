import numpy as np
import pandas as pd
import joblib
import os
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

# Step 1: Create dataset
data = pd.DataFrame({
    'Products': ['Iphone 15', 'Umbrella', 'Coca Cola', 'Parle G', 'Vanilla Ice Cream'],
    'Category': ['Groceries', 'Electronics', 'Clothing', 'Groceries', 'Clothing'],
    'Region': ['North', 'South', 'East', 'West', 'North'],
    'Weather Condition': ['Sunny', 'Rainy', 'Cloudy', 'Sunny', 'Rainy'],
    'Seasonality': ['Autumn', 'Summer', 'Winter', 'Spring', 'Autumn'],
    'Units Sold': [100, 200, 150, 120, 170],
    'Units Ordered': [50, 100, 75, 60, 90],
    'Demand Forecast': [120, 220, 180, 130, 190],  # Now this is the target
    'Price': [30.0, 50.0, 40.0, 35.0, 45.0],
    'Discount': [10, 5, 20, 15, 10],
    'Holiday/Promotion': [0, 1, 0, 1, 0],
    'Competitor Pricing': [28.0, 49.0, 38.0, 33.0, 44.0],
    'year': [2023, 2023, 2023, 2023, 2023],
    'month': [7, 8, 9, 10, 11],
    'day': [15, 16, 17, 18, 19],
    'Inventory Level': [120, 230, 190, 160, 210]
})

# Step 2: Label encoding
le_product = LabelEncoder().fit(data['Products'])
le_category = LabelEncoder().fit(data['Category'])
le_region = LabelEncoder().fit(data['Region'])
le_weather = LabelEncoder().fit(data['Weather Condition'])
le_season = LabelEncoder().fit(data['Seasonality'])

# Step 3: Feature engineering
def preprocess_row(row):
    product_encoded = le_product.transform([row['Products']])[0]
    category_encoded = le_category.transform([row['Category']])[0]
    region_encoded = le_region.transform([row['Region']])[0]
    weather_encoded = le_weather.transform([row['Weather Condition']])[0]
    season_encoded = le_season.transform([row['Seasonality']])[0]
    units_sold_transformed = np.log1p(row['Units Sold'])
    demand_forecast_transformed = np.log1p(row['Demand Forecast'])  # For consistency
    date_obj = datetime(row['year'], row['month'], row['day'])
    weekday = date_obj.weekday()
    weekend = 1 if weekday > 4 else 0
    m1 = np.sin(row['month'] * (2 * np.pi / 12))
    m2 = np.cos(row['month'] * (2 * np.pi / 12))
    price_discount = row['Price'] * row['Discount']
    sold_ordered_interaction = units_sold_transformed * row['Units Ordered']

    return [
        product_encoded, category_encoded, region_encoded, units_sold_transformed, row['Units Ordered'],
        demand_forecast_transformed, row['Price'], row['Discount'], weather_encoded,
        row['Holiday/Promotion'], row['Competitor Pricing'], season_encoded,
        row['year'], row['month'], row['day'],
        weekend, m1, m2, weekday,
        price_discount, sold_ordered_interaction
    ]

# Step 4: Create features and new target (Demand Forecast)
X = np.array([preprocess_row(row) for _, row in data.iterrows()])
y = data['Demand Forecast']  # 🔥 Target changed to demand

# Step 5: Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# Step 6: Save model
base_dir = r'D:\Walmart'
target_folder = os.path.join(base_dir, 'Model')
os.makedirs(target_folder, exist_ok=True)

model_bundle = {
    'model': model,
    'label_encoder_products': le_product,
    'label_encoder_category': le_category,
    'label_encoder_region': le_region,
    'label_encoder_weather': le_weather,
    'label_encoder_seasonality': le_season
}

output_path = os.path.join(target_folder, 'demand_model_bundle.pkl')
joblib.dump(model_bundle, output_path)

print(f"✅ Model and encoders saved to: {output_path}")

# Step 7: Load and test
bundle = joblib.load(output_path)
model = bundle['model']
le_product = bundle['label_encoder_products']
le_category = bundle['label_encoder_category']
le_region = bundle['label_encoder_region']
le_weather = bundle['label_encoder_weather']
le_season = bundle['label_encoder_seasonality']

# Test input
test_input = {
    'Products': 'Iphone 15',
    'Category': 'Electronics',
    'Region': 'North',
    'Units Sold': 110,
    'Units Ordered': 55,
    'Demand Forecast': 130,
    'Price': 32.0,
    'Discount': 12,
    'Weather Condition': 'Sunny',
    'Holiday/Promotion': 1,
    'Competitor Pricing': 30.0,
    'Seasonality': 'Autumn',
    'year': 2023,
    'month': 7,
    'day': 20
}

# Preprocess input
def preprocess_input(user):
    units_sold_trans = np.log1p(user['Units Sold'])
    demand_forecast_trans = np.log1p(user['Demand Forecast'])
    product_encoded = le_product.transform([user['Products']])[0]
    category_encoded = le_category.transform([user['Category']])[0]
    region_encoded = le_region.transform([user['Region']])[0]
    weather_encoded = le_weather.transform([user['Weather Condition']])[0]
    season_encoded = le_season.transform([user['Seasonality']])[0]
    date_obj = datetime(user['year'], user['month'], user['day'])
    weekday = date_obj.weekday()
    weekend = 1 if weekday > 4 else 0
    m1 = np.sin(user['month'] * (2 * np.pi / 12))
    m2 = np.cos(user['month'] * (2 * np.pi / 12))
    price_discount = user['Price'] * user['Discount']
    sold_ordered_interaction = units_sold_trans * user['Units Ordered']

    return np.array([[product_encoded, category_encoded, region_encoded, units_sold_trans, user['Units Ordered'],
                      demand_forecast_trans, user['Price'], user['Discount'], weather_encoded,
                      user['Holiday/Promotion'], user['Competitor Pricing'], season_encoded,
                      user['year'], user['month'], user['day'],
                      weekend, m1, m2, weekday,
                      price_discount, sold_ordered_interaction]])

# Predict
X_test = preprocess_input(test_input)
predicted_demand = model.predict(X_test)[0]
print(f"\n📈 Predicted Demand Forecast for test input : {round(predicted_demand)}")
