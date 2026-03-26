'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'ta' | 'kn' | 'te';

type Translations = {
  [key in Language]: Record<string, string>;
};

const translations: Translations = {
  en: {
    'Clinical Care': 'Clinical Care',
    'Find Doctors': 'Find Doctors',
    'Health History': 'Health History',
    'Appointments': 'Appointments',
    'AI Wellness': 'AI Wellness',
    'Symptom Checker': 'Symptom Checker',
    'AI Doctor': 'AI Doctor',
    'Nutrition Coach': 'Nutrition Coach',
    'Mental Health': 'Mental Health',
    'Fertility Tracking': 'Fertility Tracking',
    'Insights & Tools': 'Insights & Tools',
    'Risk Analytics': 'Risk Analytics',
    'Medical Alerts': 'Medical Alerts',
    'Disease Library': 'Disease Library',
    'Device & Account': 'Device & Account',
    'Dashboard': 'Dashboard',
    'Profile Setup': 'Profile Setup',
    'Wearable Mode': 'Wearable Mode',
    'Help & Legal': 'Help & Legal',
    'Privacy Policy': 'Privacy Policy',
    'Terms of Service': 'Terms of Service',
    'Contact Support': 'Contact Support',
    'Logout': 'Logout',
    'Premium Wellness': 'Premium Wellness',
    'Get AI Risk Scores & Indian Diet Plans.': 'Get AI Risk Scores & Indian Diet Plans.',
    'Upgrade Now': 'Upgrade Now'
  },
  hi: {
    'Clinical Care': 'क्लिनिकल देखभाल',
    'Find Doctors': 'डॉक्टर खोजें',
    'Health History': 'स्वास्थ्य इतिहास',
    'Appointments': 'नियुक्तियां',
    'AI Wellness': 'एआई वेलनेस',
    'Symptom Checker': 'लक्षण जाँचकर्ता',
    'AI Doctor': 'एआई डॉक्टर',
    'Nutrition Coach': 'पोषण कोच',
    'Mental Health': 'मानसिक स्वास्थ्य',
    'Fertility Tracking': 'प्रजनन क्षमता ट्रैकिंग',
    'Insights & Tools': 'अंतर्दृष्टि और उपकरण',
    'Risk Analytics': 'जोखिम विश्लेषिकी',
    'Medical Alerts': 'चिकित्सा अलर्ट',
    'Disease Library': 'रोग पुस्तकालय',
    'Device & Account': 'उपकरण और खाता',
    'Dashboard': 'डैशबोर्ड',
    'Profile Setup': 'प्रोफ़ाइल सेटअप',
    'Wearable Mode': 'पहनने योग्य मोड',
    'Help & Legal': 'सहायता और कानूनी',
    'Privacy Policy': 'गोपनीयता नीति',
    'Terms of Service': 'सेवा की शर्तें',
    'Contact Support': 'संपर्क सहायता',
    'Logout': 'लॉग आउट',
    'Premium Wellness': 'प्रीमियम वेलनेस',
    'Get AI Risk Scores & Indian Diet Plans.': 'एआई रिस्क स्कोर और भारतीय डाइट प्लान पाएं।',
    'Upgrade Now': 'अभी अपग्रेड करें'
  },
  ta: {
    'Clinical Care': 'மருத்துவ பராமரிப்பு',
    'Find Doctors': 'மருத்துவர்களைக் கண்டறியவும்',
    'Health History': 'சுகாதார வரலாறு',
    'Appointments': 'நியமனங்கள்',
    'AI Wellness': 'AI ஆரோக்கியம்',
    'Symptom Checker': 'அறிகுறி சரிபார்ப்பு',
    'AI Doctor': 'AI மருத்துவர்',
    'Nutrition Coach': 'ஊட்டச்சத்து பயிற்சியாளர்',
    'Mental Health': 'மன ஆரோக்கியம்',
    'Fertility Tracking': 'கருவுறுதல் கண்காணிப்பு',
    'Insights & Tools': 'நுண்ணறிவு மற்றும் கருவிகள்',
    'Risk Analytics': 'ஆபத்து பகுப்பாய்வு',
    'Medical Alerts': 'மருத்துவ எச்சரிக்கைகள்',
    'Disease Library': 'நோய் நூலகம்',
    'Device & Account': 'சாதனம் மற்றும் கணக்கு',
    'Dashboard': 'டாஷ்போர்டு',
    'Profile Setup': 'சுயவிவர அமைப்பு',
    'Wearable Mode': 'அணியக்கூடிய பயன்முறை',
    'Help & Legal': 'உதவி மற்றும் சட்டம்',
    'Privacy Policy': 'தனியுரிமைக் கொள்கை',
    'Terms of Service': 'சேவை விதிமுறைகள்',
    'Contact Support': 'ஆதரவைத் தொடர்பு கொள்ளவும்',
    'Logout': 'வெளியேறு',
    'Premium Wellness': 'பிரீமியம் ஆரோக்கியம்',
    'Get AI Risk Scores & Indian Diet Plans.': 'AI ரிஸ்க் ஸ்கோர்கள் & இந்திய உணவுத் திட்டங்களைப் பெறுங்கள்.',
    'Upgrade Now': 'இப்போதே மேம்படுத்துங்கள்'
  },
  kn: {
    'Clinical Care': 'ವೈದ್ಯಕೀಯ ಆರೈಕೆ',
    'Find Doctors': 'ವೈದ್ಯರನ್ನು ಹುಡುಕಿ',
    'Health History': 'ಆರೋಗ್ಯ ಇತಿಹಾಸ',
    'Appointments': 'ನೇಮಕಾತಿಗಳು',
    'AI Wellness': 'AI ಸ್ವಾಸ್ಥ್ಯ',
    'Symptom Checker': 'ರೋಗಲಕ್ಷಣ ತಪಾಸಕ',
    'AI Doctor': 'AI ವೈದ್ಯ',
    'Nutrition Coach': 'ಪೋಷಣೆ ತರಬೇತುದಾರ',
    'Mental Health': 'ಮಾನಸಿಕ ಆರೋಗ್ಯ',
    'Fertility Tracking': 'ಫಲವತ್ತತೆ ಟ್ರ್ಯಾಕಿಂಗ್',
    'Insights & Tools': 'ಒಳನೋಟಗಳು ಮತ್ತು ಪರಿಕರಗಳು',
    'Risk Analytics': 'ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ',
    'Medical Alerts': 'ವೈದ್ಯಕೀಯ ಎಚ್ಚರಿಕೆಗಳು',
    'Disease Library': 'ರೋಗಗಳ ಗ್ರಂಥಾಲಯ',
    'Device & Account': 'ಸಾಧನ ಮತ್ತು ಖಾತೆ',
    'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'Profile Setup': 'ಪ್ರೊಫೈಲ್ ಸೆಟಪ್',
    'Wearable Mode': 'ಧರಿಸಬಹುದಾದ ಮೋಡ್',
    'Help & Legal': 'ಸಹಾಯ ಮತ್ತು ಕಾನೂನು',
    'Privacy Policy': 'ಗೌಪ್ಯತಾ ನೀತಿ',
    'Terms of Service': 'ಸೇವಾ ನಿಯಮಗಳು',
    'Contact Support': 'ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ',
    'Logout': 'ಲಾಗ್ ಔಟ್',
    'Premium Wellness': 'ಪ್ರೀಮಿಯಂ ಸ್ವಾಸ್ಥ್ಯ',
    'Get AI Risk Scores & Indian Diet Plans.': 'AI ಅಪಾಯದ ಅಂಕಗಳು ಮತ್ತು ಭಾರತೀಯ ಆಹಾರ ಯೋಜನೆಗಳನ್ನು ಪಡೆಯಿರಿ.',
    'Upgrade Now': 'ಈಗ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ'
  },
  te: {
    'Clinical Care': 'క్లినికల్ కేర్',
    'Find Doctors': 'వైద్యులను కనుగొనండి',
    'Health History': 'ఆరోగ్య చరిత్ర',
    'Appointments': 'అపాయింట్‌మెంట్లు',
    'AI Wellness': 'AI వెల్నెస్',
    'Symptom Checker': 'లక్షణాల తనిఖీ',
    'AI Doctor': 'AI డాక్టర్',
    'Nutrition Coach': 'న్యూట్రిషన్ కోచ్',
    'Mental Health': 'మానసిక ఆరోగ్యం',
    'Fertility Tracking': 'సంతానోత్పత్తి ట్రాకింగ్',
    'Insights & Tools': 'అంతర్దృష్టులు & సాధనాలు',
    'Risk Analytics': 'రిస్క్ అనలిటిక్స్',
    'Medical Alerts': 'వైద్య హెచ్చరికలు',
    'Disease Library': 'వ్యాధి లైబ్రరీ',
    'Device & Account': 'పరికరం & ఖాతా',
    'Dashboard': 'డ్యాష్‌బోర్డ్',
    'Profile Setup': 'ప్రొఫైల్ సెటప్',
    'Wearable Mode': 'ధరించగలిగే మోడ్',
    'Help & Legal': 'సహాయం & చట్టపరమైన',
    'Privacy Policy': 'గోప్యతా విధానం',
    'Terms of Service': 'సేవా నిబంధనలు',
    'Contact Support': 'మద్దతును సంప్రదించండి',
    'Logout': 'లాగ్ అవుట్',
    'Premium Wellness': 'ప్రీమియం వెల్నెస్',
    'Get AI Risk Scores & Indian Diet Plans.': 'AI రిస్క్ స్కోర్‌లు & భారతీయ డైట్ ప్లాన్‌లను పొందండి.',
    'Upgrade Now': 'ఇప్పుడే అప్‌గ్రేడ్ చేయండి'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
