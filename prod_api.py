from flask import Flask, request, jsonify
import numpy as np
import joblib

# Load model and encoders from D:\Walmart\Model
bundle = joblib.load(r'D:\Walmart\Model\recommendation_model.pkl')
model = bundle['model']
le_job = bundle['le_job']
le_budget = bundle['le_budget']
le_interest = bundle['le_interest']
le_lifestyle = bundle['le_lifestyle']
le_product = bundle['le_product']

# Initialize Flask app
app = Flask(__name__)

# API endpoint
@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        user_input = request.get_json()
        job_enc = le_job.transform([user_input['Job']])[0]
        budget_enc = le_budget.transform([user_input['Budget']])[0]
        interest_enc = le_interest.transform([user_input['Interest']])[0]
        lifestyle_enc = le_lifestyle.transform([user_input['Lifestyle']])[0]

        X_input = np.array([[job_enc, budget_enc, interest_enc, lifestyle_enc]])
        pred = model.predict(X_input)[0]
        product = le_product.inverse_transform([pred])[0]

        return jsonify({'Recommended Product': product})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/')
def index():
    return '✅ Product Recommendation API is running.'

# Run app
if __name__ == '__main__':
    app.run(debug=True)
