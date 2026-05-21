import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      login: {
        title: "Sanatan Dharma",
        television: "Television",
        subtitle: "Sign in with Google to unlock free access to all spiritual content.",
        btn_continue: "Continue with Google",
        terms: "Free forever. One time Google Sign in only.",
        privacy_policy: "PRIVACY POLICY",
        terms_of_service: "TERMS OF SERVICE",
        language_select: "Choose Language"
      },
      nav: { home: "Home", shorts: "Shorts", music: "Music", about: "About", account: "Account", admin: "Admin Dashboard", exit_admin: "Exit Admin", premium: "Premium Quality" },
      account: { title: "My Account", subtitle: "Your personal details", save: "Save Profile", saving: "Saving...", saved: "Saved Successfully!", error: "Failed to save.", sign_out: "Sign Out", personal_info: "Personal Info", display_name: "Display Name", contact_number: "Contact Number", dharma_journey: "Dharma Journey & Personalization", motivation: "Deepest Motivation", sacred_time: "Sacred Connection Time", comfort_language: "Comfort Language", stories: "Stories Calling to My Soul" }
    }
  },
  hi: {
    translation: {
      login: {
        title: "सनातन धर्म",
        television: "टेलीविज़न",
        subtitle: "सभी आध्यात्मिक सामग्री तक मुफ्त पहुंच के लिए Google के साथ साइन इन करें।",
        btn_continue: "Google के साथ जारी रखें",
        terms: "हमेशा के लिए मुफ़्त। केवल एक बार Google साइन इन करें।",
        privacy_policy: "गोपनीयता नीति",
        terms_of_service: "सेवा की शर्तें",
        language_select: "भाषा चुनें"
      },
      nav: { home: "होम", shorts: "शॉर्ट्स", music: "संगीत", about: "हमारे बारे में", account: "खाता", admin: "व्यवस्थापक डैशबोर्ड", exit_admin: "एडमिन से बाहर निकलें", premium: "प्रीमियम गुणवत्ता" },
      account: { title: "मेरा खाता", subtitle: "आपका व्यक्तिगत विवरण", save: "प्रोफ़ाइल सहेजें", saving: "सहेज रहा है...", saved: "सफलतापूर्वक सहेजा गया!", error: "सहेजने में विफल।", sign_out: "साइन आउट", personal_info: "व्यक्तिगत जानकारी", display_name: "प्रदर्शन नाम", contact_number: "संपर्क नंबर", dharma_journey: "धर्म यात्रा और वैयक्तिकरण", motivation: "सबसे गहरी प्रेरणा", sacred_time: "पवित्र समय", comfort_language: "सुविधाजनक भाषा", stories: "कहानियाँ जो मेरी आत्मा को बुलाती हैं" }
    }
  },
  kn: {
    translation: {
      login: {
        title: "ಸನಾತನ ಧರ್ಮ",
        television: "ಟೆಲಿವಿಷನ್",
        subtitle: "ಎಲ್ಲಾ ಆಧ್ಯಾತ್ಮಿಕ ವಿಷಯಗಳಿಗೆ ಉಚಿತ ಪ್ರವೇಶವನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಲು Google ನೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.",
        btn_continue: "Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ",
        terms: "ಯಾವಾಗಲೂ ಉಚಿತ. ಕೇವಲ ಒಂದು ಬಾರಿ Google ಸೈನ್ ಇನ್.",
        privacy_policy: "ಗೌಪ್ಯತೆ ನೀತಿ",
        terms_of_service: "ಸೇವಾ ನಿಯಮಗಳು",
        language_select: "ಭಾಷೆಯನ್ನು ಆರಿಸಿ"
      },
      nav: { home: "ಮುಖಪುಟ", shorts: "ಶಾರ್ಟ್ಸ್", music: "ಸಂಗೀತ", about: "ನಮ್ಮ ಬಗ್ಗೆ", account: "ಖಾತೆ", admin: "ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್ಬೋರ್ಡ್", exit_admin: "ನಿರ್ವಾಹಕರಿಂದ ನಿರ್ಗಮಿಸಿ", premium: "ಪ್ರೀಮியம் ಗುಣಮಟ್ಟ" },
      account: { title: "ನನ್ನ ಖಾತೆ", subtitle: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿವರಗಳು", save: "ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ", saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...", saved: "ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!", error: "ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ.", sign_out: "ಸೈನ್ ಔಟ್", personal_info: "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ", display_name: "ಪ್ರದರ್ಶನ ಹೆಸರು", contact_number: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ", dharma_journey: "ಧರ್ಮ ಪ್ರಯಾಣ ಮತ್ತು ವೈಯಕ್ತೀಕರಣ", motivation: "ಆಳವಾದ ಪ್ರೇರಣೆ", sacred_time: "ಪವಿತ್ರ ಸಂಪರ್ಕದ ಸಮಯ", comfort_language: "ಆರಾಮದಾಯಕ ಭಾಷೆ", stories: "ನನ್ನ ಆತ್ಮವನ್ನು ಕರೆಯುವ ಕಥೆಗಳು" }
    }
  },
  te: {
    translation: {
      login: {
        title: "సనాతన ధర్మ",
        television: "టెలివిజన్",
        subtitle: "అన్ని ఆధ్యాత్మిక కంటెంట్‌కి ఉచిత యాక్సెస్‌ని అన్‌లాక్ చేయడానికి Googleతో సైన్ ఇన్ చేయండి.",
        btn_continue: "Googleతో కొనసాగించండి",
        terms: "ఎల్లప్పుడూ ఉచితం. ఒక్కసారి మాత్రమే Google సైన్ ఇన్.",
        privacy_policy: "గోప్యతా విధానం",
        terms_of_service: "సేవా నిబంధనలు",
        language_select: "భాషను ఎంచుకోండి"
      },
      nav: { home: "హోమ్", shorts: "షార్ట్స్", music: "సంగీతం", about: "మా గురించి", account: "ఖాతా", admin: "అడ్మిన్ డాష్బోర్డ్", exit_admin: "అడ్మిన్ నుండి నిష్క్రమించండి", premium: "ప్రీమియం నాణ్యత" },
      account: { title: "నా ఖాతా", subtitle: "మీ వ్యక్తిగత వివరాలు", save: "ప్రొఫైల్ సేవ్ చేయండి", saving: "సేవ్ చేయబడుతోంది...", saved: "విజయవంతంగా సేవ్ చేయబడింది!", error: "సేవ్ చేయడంలో విఫలమైంది.", sign_out: "సైన్ అవుట్", personal_info: "వ్యక్తిగత సమాచారం", display_name: "ప్రదర్శన పేరు", contact_number: "సంప్రదింపు సంఖ్య", dharma_journey: "ధర్మ ప్రయాణం మరియు వ్యక్తిగతీకరణ", motivation: "లోతైన ప్రేరణ", sacred_time: "పవిత్ర కనెక్షన్ సమయం", comfort_language: "సౌకర్యవంతమైన భాష", stories: "నా ఆత్మను పిలిచే కథలు" }
    }
  },
  ta: {
    translation: {
      login: {
        title: "சனாதன தர்மம்",
        television: "தொலைக்காட்சி",
        subtitle: "அனைத்து ஆன்மீக உள்ளடக்கங்களுக்கும் இலவச அணுகலைத் திறக்க Google மூலம் உள்நுழையவும்.",
        btn_continue: "Google மூலம் தொடரவும்",
        terms: "எப்போதும் இலவசம். ஒரு முறை மட்டுமே Google உள்நுழைவு.",
        privacy_policy: "தனியுரிமைக் கொள்கை",
        terms_of_service: "சேவை விதிமுறைகள்",
        language_select: "மொழியைத் தேர்வு செய்க"
      },
      nav: { home: "முகப்பு", shorts: "ஷார்ட்ஸ்", music: "இசை", about: "எங்களை பற்றி", account: "கணக்கு", admin: "நிர்வாகி டாஷ்போர்டு", exit_admin: "நிர்வாகியிலிருந்து வெளியேறு", premium: "பிரீமியம் தரம்" },
      account: { title: "என் கணக்கு", subtitle: "உங்கள் தனிப்பட்ட விவரங்கள்", save: "சுயவிவரத்தை சேமிக்க", saving: "சேமிக்கிறது...", saved: "வெற்றிகரமாக சேமிக்கப்பட்டது!", error: "சேமிக்க முடியவில்லை.", sign_out: "வெளியேறு", personal_info: "தனிப்பட்ட தகவல்", display_name: "காட்சி பெயர்", contact_number: "தொடர்பு எண்", dharma_journey: "தர்ம பயணம் மற்றும் தனிப்பயனாக்கம்", motivation: "ஆழமான உந்துதல்", sacred_time: "புனித தொடர்பு நேரம்", comfort_language: "வசதியான மொழி", stories: "என் ஆத்மாவை அழைக்கும் கதைகள்" }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
