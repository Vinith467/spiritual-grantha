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
      }
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
      }
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
      }
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
      }
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
      }
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
