const fs = require('fs');
const path = require('path');

const specialties = [
    "Cardiologist", "Dermatologist", "Pediatrician", "Orthopedist", "Gynecologist", 
    "Neurologist", "Endocrinologist", "ENT Specialist", "Oncologist", "Psychiatrist",
    "Urologist", "Gastroenterologist", "Ophthalmologist", "Pulmonologist", "Nephrologist",
    "Dentist", "Physiotherapist", "Ayurveda Specialist", "Homeopathy Specialist",
    "General Physician", "Nutritionist", "Radiologist", "Pathologist", "Surgeon"
];

const qualifications = {
    "Cardiologist": "MBBS, MD, DM Cardiology",
    "Dermatologist": "MBBS, MD Dermatology",
    "Pediatrician": "MBBS, MD Pediatrics",
    "Orthopedist": "MBBS, MS Ortho",
    "Gynecologist": "MBBS, MS, DGO",
    "Neurologist": "MBBS, MD, DM Neuro",
    "Endocrinologist": "MBBS, MD, DM Endo",
    "ENT Specialist": "MBBS, MS ENT",
    "Oncologist": "MBBS, MD, DM Oncology",
    "Psychiatrist": "MBBS, MD Psychiatry",
    "Urologist": "MBBS, MS, MCh",
    "Gastroenterologist": "MBBS, MD, DM Gastro",
    "Ophthalmologist": "MBBS, MS Ophtha",
    "Pulmonologist": "MBBS, MD Pulmonary",
    "Nephrologist": "MBBS, MD, DM Nephro",
    "Dentist": "BDS, MDS",
    "Physiotherapist": "BPT, MPT",
    "Ayurveda Specialist": "BAMS, MD Ayurveda",
    "Homeopathy Specialist": "BHMS",
    "General Physician": "MBBS, MD",
    "Nutritionist": "MSc Nutrition, RD",
    "Radiologist": "MBBS, MD Radio",
    "Pathologist": "MBBS, MD Path",
    "Surgeon": "MBBS, MS Surgery"
};

const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", 
    "Puducherry", "Andaman and Nicobar Islands"
];

const cities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
    "Arunachal Pradesh": ["Itanagar", "Tawang"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur"],
    "Chhattisgarh": ["Raipur", "Bhilai"],
    "Goa": ["Panaji", "Margao"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat"],
    "Himachal Pradesh": ["Shimla", "Manali"],
    "Jharkhand": ["Ranchi", "Jamshedpur"],
    "Karnataka": ["Bangalore", "Mysore", "Hubballi", "Mangalore"],
    "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Manipur": ["Imphal"],
    "Meghalaya": ["Shillong"],
    "Mizoram": ["Aizawl"],
    "Nagaland": ["Kohima"],
    "Odisha": ["Bhubaneswar", "Cuttack"],
    "Punjab": ["Ludhiana", "Amritsar", "Chandigarh"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur"],
    "Sikkim": ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "Telangana": ["Hyderabad", "Warangal"],
    "Tripura": ["Agartala"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Noida"],
    "Uttarakhand": ["Dehradun", "Haridwar"],
    "West Bengal": ["Kolkata", "Siliguri", "Durgapur"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
    "Jammu and Kashmir": ["Srinagar", "Jammu"],
    "Ladakh": ["Leh"],
    "Chandigarh": ["Chandigarh"],
    "Puducherry": ["Puducherry"],
    "Andaman and Nicobar Islands": ["Port Blair"]
};

const firstNames = ["Aarav", "Aanya", "Abhishek", "Aditi", "Aditya", "Akriti", "Amit", "Amrita", "Ananya", "Aniket", "Anjali", "Ankit", "Anshika", "Anushka", "Arjun", "Arpita", "Aryan", "Avni", "Ayush", "Bhavna", "Chaitanya", "Deepa", "Deepak", "Divya", "Gaurav", "Gayatri", "Harsh", "Ishaan", "Jitendra", "Karan", "Kavita", "Komal", "Kunwar", "Lakshay", "Madhav", "Manish", "Meera", "Mitali", "Mukesh", "Nandini", "Naveen", "Neha", "Nikhil", "Nisha", "Nitish", "Pallavi", "Pankaj", "Parul", "Piyush", "Pooja", "Pranshu", "Pratibha", "Praveen", "Preeti", "Rahul", "Rajat", "Rajendra", "Rajesh", "Rakshit", "Rashmi", "Raveena", "Ravi", "Reena", "Rishi", "Ritu", "Rohan", "Rohit", "Ruchi", "Sagar", "Sakshi", "Sameer", "Sandeep", "Sangeeta", "Sanjay", "Sapna", "Saurabh", "Seema", "Shalini", "Shanti", "Shashi", "Sheetal", "Shikha", "Shivam", "Shourya", "Shravan", "Shreya", "Shruti", "Shubham", "Siddharth", "Simran", "Sneha", "Sonali", "Sonia", "Subhash", "Sudhir", "Suman", "Sunil", "Sunita", "Suraj", "Suresh", "Swati", "Tanu", "Tanvi", "Tushar", "Udit", "Ujjwal", "Vaibhav", "Varun", "Vibhanshu", "Vidya", "Vijay", "Vikas", "Vikram", "Vimla", "Vinay", "Vineet", "Vinod", "Vishal", "Vivek", "Yash", "Yogesh", "Yuvraj", "Zoya"];
const lastNames = ["Agarwal", "Ahluwalia", "Bansal", "Bhatia", "Bhatt", "Bhattacharya", "Chakraborty", "Chatterjee", "Chauhan", "Chopra", "Choudhary", "Das", "Deshmukh", "Dutta", "Gaikwad", "Gandhi", "Ganguly", "Garg", "Ghosh", "Goel", "Grover", "Gupta", "Hegde", "Iyer", "Jain", "Jha", "Joshi", "Kapoor", "Kaur", "Khan", "Khanna", "Kulkarni", "Kumar", "Lal", "Mahajan", "Malhotra", "Malik", "Mehta", "Menon", "Mishra", "Mittal", "Mukherjee", "Nair", "Pandey", "Parekh", "Patel", "Patil", "Pillai", "Prasad", "Puri", "Rai", "Rajput", "Rao", "Rastogi", "Reddy", "Roy", "Saini", "Saksena", "Sarkar", "Sarma", "Saxena", "Sen", "Seth", "Shah", "Sharma", "Shetty", "Shukla", "Singh", "Sinha", "Srivastava", "Subramanian", "Taneja", "Thakur", "Tiwari", "Tripathi", "Trivedi", "Tyagi", "Vaidya", "Varma", "Verma", "Vora", "Wadhwa", "Yadav"];

const doctors = [];
const usedEmails = new Set();

for (let i = 0; i < 750; i++) {
    const specialty = specialties[i % specialties.length];
    const state = states[i % states.length];
    const cityList = cities[state] || ["Main Area"];
    const city = cityList[i % cityList.length];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `Dr. ${firstName} ${lastName}`;
    
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@curalink.com`;
    let count = 1;
    while (usedEmails.has(email)) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}_${count}@curalink.com`;
        count++;
    }
    usedEmails.add(email);

    const phone = `+91 ${9100000000 + i}`;
    const qualification = qualifications[specialty];
    const exp = 5 + Math.floor(Math.random() * 25);
    const rating = (4.0 + Math.random() * 1.0).toFixed(1);

    doctors.push({
        name,
        email,
        phone,
        specialty,
        qualifications: qualification,
        experience_years: exp,
        clinic_name: `${lastName} ${specialty.split(' ')[0]} Clinic`,
        clinic_address: `${city} Medical Hub`,
        state,
        district: city,
        locality: "Central Market",
        rating: parseFloat(rating)
    });
}

fs.writeFileSync(path.join(__dirname, 'backend/src/data/doctors.json'), JSON.stringify(doctors, null, 2));
console.log('Successfully generated 750 doctors across all states!');
