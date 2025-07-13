import numpy as np
import pandas as pd
import joblib
import os
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

# Step 1: Create or load dataset
data = pd.DataFrame({
    'Products': ['iPhone 15', 'Umbrella', 'Coca Cola', 'Parle G', 'Vanilla Ice Cream'],
    'Category': ['Electronics', 'Groceries', 'Groceries', 'Groceries', 'Groceries'],
    'Region': ['North', 'South', 'East', 'West', 'North'],
    'Weather Condition': ['Sunny', 'Rainy', 'Cloudy', 'Sunny', 'Rainy'],
    'Seasonality': ['Autumn', 'Summer', 'Winter', 'Spring', 'Autumn'],
    'Units Sold': [100, 200, 150, 120, 170],
    'Units Ordered': [50, 100, 75, 60, 90],
    'Demand Forecast': [120, 220, 180, 130, 190],
    'Price': [90000.0, 300.0, 50.0, 10.0, 100.0],
    'Discount': [5000, 20, 5, 2, 10],
    'Holiday/Promotion': [1, 1, 0, 1, 0],
    'Competitor Pricing': [89000.0, 280.0, 48.0, 9.5, 95.0],
    'year': [2023, 2023, 2023, 2023, 2023],
    'month': [7, 8, 9, 10, 11],
    'day': [15, 16, 17, 18, 19],
    'Inventory Level': [120, 230, 190, 160, 210]
})

# Step 2: Label encoding
le_products = LabelEncoder().fit(data['Products'])
le_category = LabelEncoder().fit(data['Category'])
le_region = LabelEncoder().fit(data['Region'])
le_weather = LabelEncoder().fit(data['Weather Condition'])
le_season = LabelEncoder().fit(data['Seasonality'])

# Step 3: Feature engineering
def preprocess_row(row):
    product_encoded = le_products.transform([row['Products']])[0]
    category_encoded = le_category.transform([row['Category']])[0]
    region_encoded = le_region.transform([row['Region']])[0]
    weather_encoded = le_weather.transform([row['Weather Condition']])[0]
    season_encoded = le_season.transform([row['Seasonality']])[0]
    units_sold_log = np.log1p(row['Units Sold'])
    demand_forecast_log = np.log1p(row['Demand Forecast'])
    date_obj = datetime(row['year'], row['month'], row['day'])
    weekday = date_obj.weekday()
    weekend = 1 if weekday > 4 else 0
    m1 = np.sin(row['month'] * (2 * np.pi / 12))
    m2 = np.cos(row['month'] * (2 * np.pi / 12))
    price_discount_interaction = row['Price'] * row['Discount']
    sold_ordered_interaction = units_sold_log * row['Units Ordered']

    return [
        product_encoded, category_encoded, region_encoded, units_sold_log, row['Units Ordered'],
        demand_forecast_log, row['Price'], row['Discount'], weather_encoded,
        row['Holiday/Promotion'], row['Competitor Pricing'], season_encoded,
        row['year'], row['month'], row['day'],
        weekend, m1, m2, weekday,
        price_discount_interaction, sold_ordered_interaction
    ]

# Step 4: Create feature matrix and target
X = np.array([preprocess_row(row) for _, row in data.iterrows()])
y = data['Price']

# Step 5: Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# Step 6: Save model and encoders
base_dir = r'D:\Walmart'
target_folder = os.path.join(base_dir, 'Model')
os.makedirs(target_folder, exist_ok=True)

model_bundle = {
    'model': model,
    'label_encoder_products': le_products,
    'label_encoder_category': le_category,
    'label_encoder_region': le_region,
    'label_encoder_weather': le_weather,
    'label_encoder_seasonality': le_season
}

output_path = os.path.join(target_folder, 'pricing_model_bundle.pkl')
joblib.dump(model_bundle, output_path)

print(f"✅ Model and encoders saved to: {output_path}")

# Step 7: Test Prediction
# Load the bundle
bundle = joblib.load(output_path)

# Extract components
model = bundle['model']
le_products = bundle['label_encoder_products']
le_category = bundle['label_encoder_category']
le_region = bundle['label_encoder_region']
le_weather = bundle['label_encoder_weather']
le_season = bundle['label_encoder_seasonality']

# Test input
test_input = {
    'Products': 'iPhone 15',
    'Category': 'Electronics',
    'Region': 'North',
    'Units Sold': 95,
    'Units Ordered': 40,
    'Demand Forecast': 115,
    'Price': 88000.0,
    'Discount': 6000,
    'Weather Condition': 'Sunny',
    'Holiday/Promotion': 1,
    'Competitor Pricing': 87500.0,
    'Seasonality': 'Autumn',
    'year': 2023,
    'month': 7,
    'day': 20
}

# Preprocess test input
def preprocess_input(user):
    product_encoded = le_products.transform([user['Products']])[0]
    category_encoded = le_category.transform([user['Category']])[0]
    region_encoded = le_region.transform([user['Region']])[0]
    weather_encoded = le_weather.transform([user['Weather Condition']])[0]
    season_encoded = le_season.transform([user['Seasonality']])[0]
    units_sold_log = np.log1p(user['Units Sold'])
    demand_forecast_log = np.log1p(user['Demand Forecast'])
    date_obj = datetime(user['year'], user['month'], user['day'])
    weekday = date_obj.weekday()
    weekend = 1 if weekday > 4 else 0
    m1 = np.sin(user['month'] * (2 * np.pi / 12))
    m2 = np.cos(user['month'] * (2 * np.pi / 12))
    price_discount_interaction = user['Price'] * user['Discount']
    sold_ordered_interaction = units_sold_log * user['Units Ordered']

    return np.array([[product_encoded, category_encoded, region_encoded, units_sold_log, user['Units Ordered'],
                      demand_forecast_log, user['Price'], user['Discount'], weather_encoded,
                      user['Holiday/Promotion'], user['Competitor Pricing'], season_encoded,
                      user['year'], user['month'], user['day'],
                      weekend, m1, m2, weekday,
                      price_discount_interaction, sold_ordered_interaction]])

# Predict price
X_test = preprocess_input(test_input)
predicted_price = model.predict(X_test)[0]
print(f"\n💰 Predicted Price for test input: ₹ {round(predicted_price)}")
