import json
import random

regions = ["North", "South", "East", "West", "Central", "North East", "Kashmiri", "Rajasthani", "Kerala", "Hyderabadi", "Konkani", "Punjabi", "Bengali", "Gujarati", "Tamilian"]
methods = ["Steamed", "Sauted", "Boiled", "Roasted", "Baked", "Curried", "Stuffed", "Spiced", "Fermented"]
base_ingredients = ["Paneer", "Lentils", "Chickpeas", "Cauliflower", "Potato", "Rice", "Wheat", "Millet", "Ragi", "Soya", "Mushroom", "Spinach", "Okra", "Brinjal", "Fish", "Chicken", "Egg"]
flavors = ["Masala", "Tadka", "Makhana", "Kadhai", "Haryali", "Achari", "Malvani", "Chettinad", "Udupi", "Jalfrezi"]

dishes = []
categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Beverage"]

# Generate 750 unique-ish dishes
for i in range(750):
    region = random.choice(regions)
    method = random.choice(methods)
    ingredient = random.choice(base_ingredients)
    flavor = random.choice(flavors)
    category = random.choice(categories)
    
    dish_name = f"{region} {flavor} {ingredient} ({method})"
    
    # Simple macro generation based on ingredient
    calories = random.randint(150, 600)
    protein = random.randint(5, 30)
    carbs = random.randint(10, 80)
    fats = random.randint(2, 25)
    
    dishes.append({
        "id": i + 1,
        "name": dish_name,
        "region": region,
        "category": category,
        "diet": "Vegetarian" if ingredient not in ["Fish", "Chicken", "Egg"] else "Non-Vegetarian",
        "macros": {
            "calories": calories,
            "protein": protein,
            "carbs": carbs,
            "fats": fats
        },
        "description": f"A traditional {region} preparation of {ingredient} using {method.lower()} techniques and {flavor.lower()} spices."
    })

with open('backend/src/data/dishes.json', 'w') as f:
    json.dump(dishes, f, indent=2)

print(f"Generated {len(dishes)} dishes.")
