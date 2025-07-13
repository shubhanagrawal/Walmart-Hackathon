from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
from datetime import datetime, timedelta
import random

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for frontend communication

# Load demand prediction model
try:
    model_bundle = joblib.load(r'D:\Walmart\Model\demand_model_bundle.pkl')
    model = model_bundle['model']
    le_products = model_bundle['label_encoder_products']
    le_category = model_bundle['label_encoder_category']
    le_region = model_bundle['label_encoder_region']
    le_weather = model_bundle['label_encoder_weather']
    le_season = model_bundle['label_encoder_seasonality']
except Exception as e:
    raise RuntimeError(f"❌ Failed to load model or encoders: {str(e)}")

# Mock data for dashboard (replace with actual database queries)
def get_mock_dashboard_data():
    return {
        'totalSales': 1250,
        'totalOrders': 89,
        'lowStock': [
            {'_id': '1', 'name': 'Wireless Headphones', 'stock': 5},
            {'_id': '2', 'name': 'Smartphone Case', 'stock': 8},
            {'_id': '3', 'name': 'USB Cable', 'stock': 12}
        ],
        'topProducts': [
            {'_id': '1', 'name': 'Wireless Headphones', 'totalQuantity': 150, 'product': {'_id': '1', 'name': 'Wireless Headphones'}},
            {'_id': '2', 'name': 'Smartphone Case', 'totalQuantity': 120, 'product': {'_id': '2', 'name': 'Smartphone Case'}},
            {'_id': '3', 'name': 'USB Cable', 'totalQuantity': 95, 'product': {'_id': '3', 'name': 'USB Cable'}},
            {'_id': '4', 'name': 'Bluetooth Speaker', 'totalQuantity': 80, 'product': {'_id': '4', 'name': 'Bluetooth Speaker'}}
        ]
    }

def generate_demand_forecast_data(product_id='all'):
    """Generate mock demand forecast data"""
    base_date = datetime.now()
    data = []
    
    for i in range(14):  # 14 days of data
        date = base_date + timedelta(days=i)
        actual_demand = random.randint(50, 100) if i < 7 else None  # Only past 7 days have actual data
        predicted_demand = random.randint(45, 105)
        
        data.append({
            'day': date.strftime('%Y-%m-%d'),
            'demand': actual_demand,
            'predicted': predicted_demand
        })
    
    return data

def generate_price_optimization_data(product_id='all'):
    """Generate mock price optimization data"""
    price_points = [250, 275, 300, 325, 350, 375, 400]
    data = []
    
    for price in price_points:
        # Simple demand curve - higher price = lower demand
        demand = max(30, 120 - (price - 250) * 0.2)
        revenue = price * demand
        
        data.append({
            'price': price,
            'demand': int(demand),
            'revenue': int(revenue)
        })
    
    return data

def generate_restock_suggestions():
    """Generate mock restock suggestions"""
    return [
        {
            'name': 'Wireless Headphones',
            'stock': 5,
            'predictedDemand': 25.5,
            'restock': 20
        },
        {
            'name': 'Smartphone Case',
            'stock': 8,
            'predictedDemand': 18.3,
            'restock': 15
        },
        {
            'name': 'USB Cable',
            'stock': 12,
            'predictedDemand': 22.1,
            'restock': 18
        }
    ]

# Feature preprocessing (existing function)
def preprocess_input(user):
    try:
        units_sold_trans = np.log1p(user['Units Sold'])
        demand_forecast_trans = np.log1p(user['Demand Forecast'])

        product_encoded = le_products.transform([user['Products']])[0]
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
    except Exception as e:
        raise ValueError(f"Preprocessing Error: {str(e)}")

# 🔮 Demand Forecast Prediction (existing endpoint)
@app.route('/predict/demand', methods=['POST'])
def predict_demand():
    try:
        user_input = request.get_json(force=True)
        X_input = preprocess_input(user_input)
        predicted_demand = model.predict(X_input)[0]
        return jsonify({'predicted_demand_forecast': round(predicted_demand, 2)})
    except Exception as e:
        print(f"[ERROR - Demand]: {str(e)}")
        return jsonify({'error': str(e)}), 400

# 💰 Dynamic Price Estimation (existing endpoint)
@app.route('/predict/price', methods=['POST'])
def predict_price():
    try:
        user_input = request.get_json(force=True)
        X_input = preprocess_input(user_input)
        predicted_demand = model.predict(X_input)[0]

        base_price = user_input['Price']
        dynamic_price = base_price + (0.05 * predicted_demand) - (0.01 * user_input['Units Ordered'])
        dynamic_price = round(max(dynamic_price, 1), 2)

        return jsonify({
            'predicted_demand_forecast': round(predicted_demand, 2),
            'predicted_dynamic_price': dynamic_price
        })
    except Exception as e:
        print(f"[ERROR - Price]: {str(e)}")
        return jsonify({'error': str(e)}), 400

# 📊 Dashboard Metrics (NEW)
@app.route('/api/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    try:
        metrics = get_mock_dashboard_data()
        return jsonify(metrics)
    except Exception as e:
        print(f"[ERROR - Dashboard Metrics]: {str(e)}")
        return jsonify({'error': str(e)}), 400

# 📈 Demand Forecast Data (NEW)
@app.route('/api/forecast/<product_id>', methods=['GET'])
def get_demand_forecast(product_id):
    try:
        demand_data = generate_demand_forecast_data(product_id)
        return jsonify({'demandData': demand_data})
    except Exception as e:
        print(f"[ERROR - Demand Forecast]: {str(e)}")
        return jsonify({'error': str(e)}), 400

# 💰 Price Optimization Data (NEW)
@app.route('/api/price-optimization/<product_id>', methods=['GET'])
def get_price_optimization(product_id):
    try:
        price_data = generate_price_optimization_data(product_id)
        return jsonify({'priceData': price_data})
    except Exception as e:
        print(f"[ERROR - Price Optimization]: {str(e)}")
        return jsonify({'error': str(e)}), 400

# 📦 Restock Suggestions (NEW)
@app.route('/api/restock', methods=['GET'])
def get_restock_suggestions():
    try:
        suggestions = generate_restock_suggestions()
        return jsonify(suggestions)
    except Exception as e:
        print(f"[ERROR - Restock Suggestions]: {str(e)}")
        return jsonify({'error': str(e)}), 400

# 📅 Events Data (NEW)
@app.route('/api/events', methods=['GET'])
def get_events():
    try:
        # Mock events data
        events = [
            {'id': 1, 'name': 'Summer Sale', 'date': '2025-07-15', 'type': 'promotion'},
            {'id': 2, 'name': 'Back to School', 'date': '2025-08-01', 'type': 'seasonal'},
            {'id': 3, 'name': 'Flash Sale', 'date': '2025-07-20', 'type': 'flash_sale'}
        ]
        return jsonify(events)
    except Exception as e:
        print(f"[ERROR - Events]: {str(e)}")
        return jsonify({'error': str(e)}), 400

# ✅ Health check
@app.route('/', methods=['GET'])
def index():
    return '✅ Walmart Demand Forecast & Pricing API is running.'

# Run Flask app
if __name__ == '__main__':
    app.run(debug=True)