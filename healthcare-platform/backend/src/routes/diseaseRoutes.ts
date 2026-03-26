import { Router, Request, Response } from 'express';

const router = Router();

const diseases = [
  {
    id: 1, name: 'Diabetes Mellitus', category: 'Endocrine',
    overview: 'A chronic condition where the body cannot properly regulate blood sugar levels.',
    symptoms: ['Frequent urination', 'Excessive thirst', 'Unexplained weight loss', 'Fatigue', 'Blurred vision', 'Slow-healing wounds'],
    causes: ['Insulin resistance', 'Autoimmune destruction of beta cells', 'Genetic factors', 'Obesity', 'Sedentary lifestyle'],
    treatment: ['Insulin therapy (Type 1)', 'Oral medications', 'Diet management', 'Regular exercise', 'Blood sugar monitoring'],
    prevention: ['Healthy diet', 'Regular physical activity', 'Maintaining healthy weight', 'Regular health screenings'],
    urgency: 'medium', emoji: '🩺'
  },
  {
    id: 2, name: 'Hypertension', category: 'Cardiovascular',
    overview: 'High blood pressure that can lead to heart disease and stroke if untreated.',
    symptoms: ['Often no symptoms (silent killer)', 'Headaches', 'Shortness of breath', 'Nosebleeds', 'Dizziness'],
    causes: ['Genetic factors', 'Obesity', 'High salt diet', 'Stress', 'Lack of exercise', 'Kidney disease'],
    treatment: ['ACE inhibitors', 'Beta-blockers', 'Diuretics', 'Lifestyle changes', 'Low-sodium diet'],
    prevention: ['DASH diet', 'Regular exercise', 'Limit alcohol', 'Quit smoking', 'Stress management'],
    urgency: 'medium', emoji: '❤️'
  },
  {
    id: 3, name: 'Asthma', category: 'Respiratory',
    overview: 'A chronic lung disease with recurring attacks of breathlessness and wheezing.',
    symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing (especially at night)'],
    causes: ['Allergens', 'Air pollution', 'Respiratory infections', 'Exercise', 'Stress', 'Weather changes'],
    treatment: ['Inhaled corticosteroids', 'Short-acting bronchodilators', 'Long-term control inhalers', 'Avoiding triggers'],
    prevention: ['Avoid known triggers', 'Air purifiers indoors', 'Regular check-ups', 'Vaccination against flu'],
    urgency: 'medium', emoji: '🫁'
  },
  {
    id: 4, name: 'Migraine', category: 'Neurological',
    overview: 'A neurological condition causing severe, debilitating headaches often with nausea and sensitivity to light.',
    symptoms: ['Throbbing headache (usually one side)', 'Nausea and vomiting', 'Sensitivity to light and sound', 'Visual aura', 'Fatigue'],
    causes: ['Hormonal changes', 'Stress', 'Certain foods/drinks', 'Sleep disruption', 'Sensory stimulation', 'Genetic predisposition'],
    treatment: ['Triptans', 'Pain relievers', 'Anti-nausea medications', 'Preventive medications', 'Magnesium supplements'],
    prevention: ['Identify and avoid triggers', 'Regular sleep schedule', 'Stress management', 'Hydration', 'Limit caffeine'],
    urgency: 'low', emoji: '🧠'
  },
  {
    id: 5, name: 'COVID-19', category: 'Infectious',
    overview: 'A respiratory illness caused by the SARS-CoV-2 coronavirus.',
    symptoms: ['Fever or chills', 'Cough', 'Shortness of breath', 'Fatigue', 'Body aches', 'Loss of taste/smell', 'Sore throat'],
    causes: ['SARS-CoV-2 virus', 'Airborne transmission', 'Close contact with infected person'],
    treatment: ['Supportive care', 'Antivirals (Paxlovid)', 'Supplemental oxygen if needed', 'Rest and hydration'],
    prevention: ['Vaccination', 'Masks in crowded areas', 'Hand hygiene', 'Ventilation', 'Social distancing when ill'],
    urgency: 'medium', emoji: '🦠'
  },
  {
    id: 6, name: 'Dengue Fever', category: 'Infectious',
    overview: 'A mosquito-borne tropical disease caused by dengue virus.',
    symptoms: ['High fever', 'Severe headache', 'Eye pain', 'Joint/muscle pain', 'Rash', 'Bleeding gums', 'Fatigue'],
    causes: ['Aedes mosquito bite', 'Dengue virus (4 serotypes)'],
    treatment: ['Supportive care', 'Plenty of fluids', 'Paracetamol for fever', 'Hospitalization if severe', 'Avoid aspirin/NSAIDs'],
    prevention: ['Eliminate standing water', 'Mosquito repellents', 'Long-sleeved clothing', 'Mosquito nets'],
    urgency: 'high', emoji: '🦟'
  },
  {
    id: 7, name: 'Hypothyroidism', category: 'Endocrine',
    overview: 'An underactive thyroid that doesn\'t produce enough thyroid hormone.',
    symptoms: ['Fatigue', 'Weight gain', 'Cold sensitivity', 'Dry skin', 'Hair thinning', 'Depression', 'Slow heart rate'],
    causes: ['Autoimmune disease (Hashimoto\'s)', 'Thyroid surgery', 'Radiation therapy', 'Certain medications', 'Iodine deficiency'],
    treatment: ['Levothyroxine (synthetic thyroid hormone)', 'Regular TSH monitoring', 'Dietary adjustments'],
    prevention: ['Adequate iodine intake', 'Regular thyroid screening', 'Avoid goitrogens in excess'],
    urgency: 'low', emoji: '🦋'
  },
  {
    id: 8, name: 'Anemia', category: 'Blood',
    overview: 'A condition with insufficient healthy red blood cells to carry oxygen to body tissues.',
    symptoms: ['Fatigue and weakness', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Cold hands/feet', 'Chest pain', 'Headache'],
    causes: ['Iron deficiency', 'Vitamin B12 deficiency', 'Chronic disease', 'Blood loss', 'Bone marrow problems'],
    treatment: ['Iron supplements', 'B12 injections or supplements', 'Diet changes', 'Treating underlying cause', 'Blood transfusion if severe'],
    prevention: ['Iron-rich diet', 'Vitamin C to enhance iron absorption', 'Regular blood tests', 'Treat blood loss causes'],
    urgency: 'low', emoji: '🩸'
  },
  {
    id: 9, name: 'PCOS', category: 'Reproductive',
    overview: 'Polycystic Ovary Syndrome - a hormonal disorder common among women of reproductive age.',
    symptoms: ['Irregular periods', 'Excess androgen', 'Polycystic ovaries', 'Weight gain', 'Acne', 'Hair thinning', 'Infertility'],
    causes: ['Insulin resistance', 'Low-grade inflammation', 'Heredity', 'Excess androgen production'],
    treatment: ['Hormonal birth control', 'Metformin', 'Lifestyle changes', 'Fertility treatments', 'Anti-androgen medications'],
    prevention: ['Healthy weight', 'Regular exercise', 'Anti-inflammatory diet', 'Stress management'],
    urgency: 'low', emoji: '🌸'
  },
  {
    id: 10, name: 'Arthritis', category: 'Musculoskeletal',
    overview: 'Inflammation of one or more joints causing pain and stiffness.',
    symptoms: ['Joint pain', 'Stiffness (especially morning)', 'Swelling', 'Reduced range of motion', 'Warmth around joints'],
    causes: ['Autoimmune (rheumatoid)', 'Wear and tear (osteoarthritis)', 'Infection', 'Uric acid crystals (gout)', 'Genetic factors'],
    treatment: ['NSAIDs', 'Corticosteroids', 'DMARDs for rheumatoid', 'Physical therapy', 'Joint replacement in severe cases'],
    prevention: ['Maintain healthy weight', 'Stay active', 'Protect joints', 'Fish oil supplements', 'Avoid joint injuries'],
    urgency: 'low', emoji: '💪'
  },
];

router.get('/', (req: Request, res: Response) => {
  const { search, category } = req.query;
  let filtered = diseases;
  if (search) filtered = filtered.filter(d => d.name.toLowerCase().includes((search as string).toLowerCase()) || d.category.toLowerCase().includes((search as string).toLowerCase()));
  if (category) filtered = filtered.filter(d => d.category === category);
  res.json({ diseases: filtered, categories: [...new Set(diseases.map(d => d.category))] });
});

router.get('/:id', (req: Request, res: Response) => {
  const disease = diseases.find(d => d.id === parseInt(req.params.id));
  if (!disease) return res.status(404).json({ error: 'Disease not found' });
  res.json(disease);
});

export default router;
