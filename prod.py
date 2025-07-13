import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# Step 1: Sample form-based dataset
data = pd.DataFrame({
    'Job': ['Student', 'Engineer', 'Doctor', 'Student', 'Artist', 'Engineer'],
    'Budget': ['Low', 'High', 'High', 'Medium', 'Low', 'Medium'],
    'Interest': ['Fitness', 'Technology', 'Health', 'Fitness', 'Art', 'Technology'],
    'Lifestyle': ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Vegetarian', 'Vegan', 'Non-Vegetarian'],
    'Recommended Product': ['Protein Bar', 'Smart Watch', 'Vitamins', 'Yoga Mat', 'Sketch Book', 'Bluetooth Earbuds']
})

# Step 2: Encode features and target
le_job = LabelEncoder().fit(data['Job'])
le_budget = LabelEncoder().fit(data['Budget'])
le_interest = LabelEncoder().fit(data['Interest'])
le_lifestyle = LabelEncoder().fit(data['Lifestyle'])
le_product = LabelEncoder().fit(data['Recommended Product'])

data['Job_enc'] = le_job.transform(data['Job'])
data['Budget_enc'] = le_budget.transform(data['Budget'])
data['Interest_enc'] = le_interest.transform(data['Interest'])
data['Lifestyle_enc'] = le_lifestyle.transform(data['Lifestyle'])
data['Product_enc'] = le_product.transform(data['Recommended Product'])

X = data[['Job_enc', 'Budget_enc', 'Interest_enc', 'Lifestyle_enc']]
y = data['Product_enc']

# Step 3: Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Step 4: Save model and encoders in D:\Walmart\Model
output_path = r'D:\Walmart\Model\recommendation_model.pkl'
os.makedirs(os.path.dirname(output_path), exist_ok=True)

joblib.dump({
    'model': model,
    'le_job': le_job,
    'le_budget': le_budget,
    'le_interest': le_interest,
    'le_lifestyle': le_lifestyle,
    'le_product': le_product
}, output_path)

print(f"✅ Model and encoders saved to '{output_path}'")
