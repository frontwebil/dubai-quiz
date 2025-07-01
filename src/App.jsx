import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

const translations = {
  ru: {
    startButton: "Начать подбор",
    experience: "10 лет опыта работы на рынке",
    title:
      "Элитная недвижимость в Дубае от 250000$ от агенства Prime Dubai Estates",
    quiz: {
      formTitle: "Заполните форму и получите подборку!",
      nameLabel: "Ваше Имя *",
      phoneLabel: "Ваш телефон *",
      submitButton: "Получить подборку",
      errorSelect: "Пожалуйста, выберите хотя бы один вариант, чтобы продолжить.",
      successMessage: "Заявка успешно отправлена! Мы скоро с вами свяжемся.",
      close: "×",
      back: "←",
      next: "Далее",
      progress: (current, total) => `${current} / ${total}`,
      phoneInvalid: "Введите корректный номер телефона для выбранной страны.",
      nameEmpty: "Пожалуйста, введите имя.",
      countryEmpty: "Пожалуйста, выберите страну.",
    },
    questions: [
      {
        name: "Цель покупки",
        options: ["Для инвестиций", "Для безопасной жизни в комфорте", "Другое"],
      },
      {
        name: "Когда планируете покупку?",
        options: [
          "В ближайшее время",
          "До трех месяцев",
          "В течение полугода",
          "В течение года, пока присматриваюсь",
        ],
      },
    ],
  },

  en: {
    startButton: "Start Selection",
    experience: "10 years of market experience",
    title:
      "Elite real estate in Dubai from $250,000 by Prime Dubai Estates agency",
    quiz: {
      formTitle: "Fill out the form and get your selection!",
      nameLabel: "Your Name *",
      phoneLabel: "Your Phone *",
      submitButton: "Get Selection",
      errorSelect: "Please select at least one option to continue.",
      successMessage: "Request sent successfully! We will contact you soon.",
      close: "×",
      back: "←",
      next: "Next",
      progress: (current, total) => `${current} / ${total}`,
      phoneInvalid: "Please enter a valid phone number for the selected country.",
      nameEmpty: "Please enter your name.",
      countryEmpty: "Please select a country.",
    },
    questions: [
      {
        name: "Purpose of purchase",
        options: ["For investment", "For safe comfortable living", "Other"],
      },
      {
        name: "When do you plan to buy?",
        options: [
          "In the near future",
          "Within three months",
          "Within six months",
          "Within a year, still looking around",
        ],
      },
    ],
  },
};

const countries = [
  { code: "GB", name: "United Kingdom", dial_code: "+44", minLength: 10, maxLength: 10 },
  { code: "IN", name: "भारत", dial_code: "+91", minLength: 10, maxLength: 10 },
  { code: "AZ", name: "Azərbaycan", dial_code: "+994", minLength: 9, maxLength: 9 },
  { code: "UZ", name: "O‘zbekiston", dial_code: "+998", minLength: 9, maxLength: 9 },
  { code: "KZ", name: "Қазақстан", dial_code: "+7", minLength: 10, maxLength: 10 },
  { code: "US", name: "United States", dial_code: "+1", minLength: 10, maxLength: 10 },
  { code: "DE", name: "Deutschland", dial_code: "+49", minLength: 10, maxLength: 11 },
  { code: "DK", name: "Danmark", dial_code: "+45", minLength: 8, maxLength: 8 },
  { code: "CH", name: "Schweiz", dial_code: "+41", minLength: 9, maxLength: 9 },
  { code: "UA", name: "Україна", dial_code: "+380", minLength: 9, maxLength: 9 },
];

function isValidLocalPhone(phone, country) {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= country.minLength && digitsOnly.length <= country.maxLength;
}

export function App() {
  const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  const URI_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const [language, setLanguage] = useState("en");
  const [isOpenQuiz, setIsOpenQuiz] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "", // лише локальний номер без коду країни
    countryDialCode: "",
  });
  const [selectedOptions, setSelectedOptions] = useState({
    0: [],
    1: [],
  });

  const questions = translations[language].questions;

  const handleCheckboxChange = (option) => {
    const currentSelections = selectedOptions[currentStep] || [];
    if (currentSelections.includes(option)) {
      setSelectedOptions({
        ...selectedOptions,
        [currentStep]: currentSelections.filter((item) => item !== option),
      });
    } else {
      setSelectedOptions({
        ...selectedOptions,
        [currentStep]: [...currentSelections, option],
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      countryDialCode: e.target.value,
    }));
  };

  const sendBookingNotification = async () => {
    let quizResponses = "";

    const questionTitles =
      language === "ru"
        ? [
            "\n<b>С какой целью планируете совершить покупку?</b>",
            "\n<b>Когда планируете покупку?</b>",
          ]
        : [
            "\n<b>Purpose of purchase</b>",
            "\n<b>When do you plan to buy?</b>",
          ];

    for (let i = 0; i < questionTitles.length; i++) {
      const selectedOptionsForStep = selectedOptions[i] || [];
      if (selectedOptionsForStep.length > 0) {
        quizResponses += `${questionTitles[i]}:\n${selectedOptionsForStep.join(
          ", \n"
        )}\n`;
      }
    }

    const fullPhone = formData.countryDialCode + formData.phone.replace(/\D/g, "");

    const inputContents = [
      "",
      `👤 <b>*${language === "ru" ? "Имя" : "Name"}:*</b> ${formData.name}`,
      `📱 <b>*${language === "ru" ? "Номер телефона" : "Phone number"}:*</b> ${fullPhone}`,
      `${quizResponses}`,
    ];

    const message = inputContents.join("\n");

    try {
      const response = await fetch(URI_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          parse_mode: "html",
          text: message,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Telegram response error:", errorText);
        throw new Error("Telegram API error");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Telegram notification error:", error);
      throw new Error("Failed to send booking notification");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error(translations[language].quiz.nameEmpty);
      return;
    }

    if (!formData.countryDialCode) {
      toast.error(translations[language].quiz.countryEmpty);
      return;
    }

    const country = countries.find((c) => c.dial_code === formData.countryDialCode);
    if (!country) {
      toast.error(translations[language].quiz.countryEmpty);
      return;
    }

    if (!isValidLocalPhone(formData.phone, country)) {
      toast.error(translations[language].quiz.phoneInvalid);
      return;
    }

    try {
      await sendBookingNotification();

      setSelectedOptions({ 0: [], 1: [] });
      setIsOpenQuiz(false);
      setCurrentStep(0);
      setFormData({ name: "", phone: "", countryDialCode: "" });
      toast.success(translations[language].quiz.successMessage);
      window.location.href = "/thank.html";
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Error sending request.");
    }
  };

  const handleNext = () => {
    if (selectedOptions[currentStep]?.length === 0) {
      toast.error(translations[language].quiz.errorSelect);
      return;
    }

    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setIsOpenQuiz(false);
    }
  };

  const handleClose = () => {
    setIsOpenQuiz(false);
  };

  const isSubmitDisabled =
    !formData.name.trim() ||
    !formData.countryDialCode ||
    !isValidLocalPhone(formData.phone, countries.find(c => c.dial_code === formData.countryDialCode));

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="language-switcher">
        <button
          onClick={() => setLanguage("ru")}
          className={language === "ru" ? "lang-btn active" : "lang-btn"}
        >
          Рус
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={language === "en" ? "lang-btn active" : "lang-btn"}
        >
          Eng
        </button>
      </div>

      <div className="main-page">
        <div className="main-page-content">
          <div className="main-column">
            <img src="/logo.png" alt="" className="logo" />
            <h2 className="underTitle">{translations[language].experience}</h2>
          </div>
          <h2 className="title">
            <strong>{translations[language].title}</strong>
          </h2>

          <div className="button-start" onClick={() => setIsOpenQuiz(true)}>
            {translations[language].startButton}
          </div>
        </div>
      </div>

      <div className={`quiz-page ${isOpenQuiz ? "active" : ""}`}>
        <div className="quiz-progress-bar">
          <div className="progress-line">
            <div
              className="progress-filled"
              style={{
                width: `${((currentStep + 1) / (questions.length + 1)) * 100}%`,
              }}
            >
              <div className="progress-indicator">
                {translations[language].quiz.progress(currentStep + 1, questions.length + 1)}
              </div>
            </div>
          </div>

          <button className="close-button" onClick={handleClose}>
            {translations[language].quiz.close}
          </button>
        </div>

        <div className="quiz-container">
          {currentStep < questions.length ? (
            <>
              <h2 className="quiz-title animate-text">{questions[currentStep].name}</h2>

              <div className="quiz-options">
                {questions[currentStep].options.map((option, index) => (
                  <label key={index} className="quiz-option">
                    <input
                      type="checkbox"
                      checked={selectedOptions[currentStep]?.includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="quiz-title animate-text">{translations[language].quiz.formTitle}</h2>
              <div className="quiz-form">
                <label htmlFor="name">{translations[language].quiz.nameLabel}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="quiz-input"
                  required
                />

                <label htmlFor="phone">{translations[language].quiz.phoneLabel}</label>
                <div className="form-flex-input" style={{ display: "flex", gap: "10px" }}>
                  <select
                    name="countryDialCode"
                    value={formData.countryDialCode}
                    onChange={handleCountryChange}
                    required
                    style={{
                      padding: "8px",
                      fontSize: "13px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="" disabled>
                      {language === "ru" ? "Страна" : "Country"}
                    </option>
                    {countries.map(({ code, name, dial_code }) => (
                      <option key={code} value={dial_code}>
                        {code} ({dial_code})
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="quiz-input"
                    placeholder={language === "ru" ? "Номер телефона" : "Phone number"}
                    required
                    style={{ flexGrow: 1 }}
                  />
                </div>

                <button
                  className="submit-button"
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                >
                  {translations[language].quiz.submitButton}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="quiz-footer">
          <div className="quiz-navigation">
            <button onClick={handleBack} className="back-button">
              {translations[language].quiz.back}
            </button>
            <button onClick={handleNext} className="next-button">
              {translations[language].quiz.next}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
