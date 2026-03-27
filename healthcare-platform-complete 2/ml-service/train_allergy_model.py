import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
import joblib
from faker import Faker
import random
import os

fake = Faker()

# Configuration
ALLERGIES = ['peanuts', 'penicillin', 'dust', 'pollen', 'shellfish', 'latex', 'dairy', 'gluten', 'eggs', 'soy']
MEDICINES = {
    'Amoxicillin': ['penicillin'],
    'Augmentin': ['penicillin'],
    'Benadryl': ['diphenhydramine'],
    'Advil': ['ibuprofen'],
    'Tylenol': ['acetaminophen'],
    'Aspirin': ['salicylic_acid'],
    'Claritin': ['loratadine']
}
FOODS = ['bread', 'milk', 'peanut butter', 'shrimp', 'pasta', 'eggs', 'tofu', 'salad', 'pizza', 'cookies']
SEASONS = ['summer', 'winter', 'monsoon', 'spring']
CONDITIONS = ['asthma', 'eczema', 'rhinitis', 'none']

def generate_data(n=1000):
    data = []
    for _ in range(n):
        age = random.randint(5, 80)
        season = random.choice(SEASONS)
        condition = random.choice(CONDITIONS)
        
        # Random inputs
        known_allergies = random.sample(ALLERGIES, random.randint(0, 3))
        prescribed = random.sample(list(MEDICINES.keys()), random.randint(0, 2))
        food_intake = random.sample(FOODS, random.randint(1, 4))
        
        # Calculate reaction labeling (Logic for training)
        reaction = 0
        
        # Rules:
        # 1. Penicillin allergy + Amoxicillin/Augmentin
        if 'penicillin' in known_allergies and any(m in ['Amoxicillin', 'Augmentin'] for m in prescribed):
            reaction = 1
        
        # 2. Peanut allergy + peanut butter
        if 'peanuts' in known_allergies and 'peanut butter' in food_intake:
            reaction = 1
            
        # 3. Gluten allergy + bread/pasta/pizza
        if 'gluten' in known_allergies and any(f in ['bread', 'pasta', 'pizza'] for f in food_intake):
            reaction = 1
            
        # 4. Dairy allergy + milk
        if 'dairy' in known_allergies and 'milk' in food_intake:
            reaction = 1
            
        # 5. Aspirin + Asthma
        if condition == 'asthma' and 'Aspirin' in prescribed:
            reaction = 1
            
        # 6. Pollen/Dust + Monsoon/Spring (Environmental triggers)
        if ('pollen' in known_allergies or 'dust' in known_allergies) and season in ['monsoon', 'spring']:
            if random.random() > 0.5: reaction = 1
            
        # Random noise
        if random.random() > 0.95: reaction = 1
        
        data.append({
            'age': age,
            'season': season,
            'condition': condition,
            'known_allergies': '|'.join(known_allergies),
            'prescribed_medicines': '|'.join(prescribed),
            'food_intake': '|'.join(food_intake),
            'reaction': reaction
        })
    
    return pd.DataFrame(data)

def train_model():
    print("Generating synthetic data...")
    df = generate_data(2000)
    
    # Feature Engineering
    # One-hot encode multi-label columns
    mlb_allergies = MultiLabelBinarizer(classes=ALLERGIES)
    allergy_features = mlb_allergies.fit_transform(df['known_allergies'].str.split('|').apply(lambda x: [i for i in x if i]))
    
    # One-hot encode medicines
    all_meds = list(MEDICINES.keys())
    mlb_meds = MultiLabelBinarizer(classes=all_meds)
    med_features = mlb_meds.fit_transform(df['prescribed_medicines'].str.split('|').apply(lambda x: [i for i in x if i]))
    
    # One-hot encode foods
    mlb_foods = MultiLabelBinarizer(classes=FOODS)
    food_features = mlb_foods.fit_transform(df['food_intake'].str.split('|').apply(lambda x: [i for i in x if i]))
    
    # Simple encode categorical
    df['season_code'] = df['season'].astype('category').cat.codes
    df['condition_code'] = df['condition'].astype('category').cat.codes
    
    X = np.hstack([
        df[['age', 'season_code', 'condition_code']].values,
        allergy_features,
        med_features,
        food_features
    ])
    y = df['reaction'].values
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Save model and meta
    os.makedirs('ml-service/models', exist_ok=True)
    joblib.dump(model, 'ml-service/models/allergy_model.pkl')
    
    # Save metadata for prediction mapping
    meta = {
        'allergies': ALLERGIES,
        'medicines': all_meds,
        'foods': FOODS,
        'seasons': sorted(df['season'].unique().tolist()),
        'conditions': sorted(df['condition'].unique().tolist())
    }
    joblib.dump(meta, 'ml-service/models/metadata.pkl')
    print("Model and metadata saved to ml-service/models/")

if __name__ == "__main__":
    train_model()
