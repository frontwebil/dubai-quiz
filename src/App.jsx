import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

export function App() {
  const [isOpenQuiz, setIsOpenQuiz] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    country: "",
    message: "",
  });
  const [selectedOptions, setSelectedOptions] = useState({
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  });

  const questions = [
    {
      name: "Нужный тип недвижимости",
      checkbox: ["Квартира", "Вилла", "Таунхаус", "Пентхаус", "Все варианты"],
    },
    {
      name: "Район",
      checkbox: [
        "Любой",
        "Dubai Marina",
        "Dubai Islands",
        "Business Bay",
        "Jumeirah Village Circle (JVC)",
        "Dubai Hills",
        "Palm Jumeirah",
        "Downtown",
        "Creek Harbour",
      ],
    },
    {
      name: "Цель покупки",
      checkbox: ["Для инвестиций", "Для безопасной жизни в комфорте", "Другое"],
    },
    {
      name: "Когда планируете покупку?",
      checkbox: [
        "В ближайшее время",
        "До трех месяцев",
        "В течение полугода",
        "В течение года, пока присматриваюсь",
      ],
    },
    {
      name: "Бюджет",
      checkbox: [
        "200 000 - 350 000$",
        "350 000 - 550 000$",
        "550 000 - 700 000$",
        "700 000 - 1 300 000$",
        "более 1 300 000$",
      ],
    },
  ];

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

  function sendWhatsApp() {
    const phonenumber = "+380632672311";

    // Дані з форми (тільки ім'я та телефон)
    const name = formData.name;
    const phone = formData.phone;

    // Отримуємо вибрані варіанти з квізу
    let quizResponses = "";

    // Масив питань
    const questions = [
      "Выберите нужный тип недвижимости",
      "Какой район предпочитаете?",
      "С какой целью планируете совершить покупку?",
      "Когда планируете покупку?",
      "В пределах какого бюджета рассматриваете покупку?",
    ];

    // Вибрані опції для кожного кроку квізу
    for (let i = 0; i < questions.length; i++) {
      const selectedOptionsForStep = selectedOptions[i] || []; // Беремо вибрані опції для поточного кроку
      if (selectedOptionsForStep.length > 0) {
        quizResponses += `*${questions[i]}:* ${selectedOptionsForStep.join(
          ", "
        )}%0a`;
      }
    }

    // Формуємо текст для WhatsApp
    const url =
      `https://wa.me/${phonenumber}?text=` +
      `*Имя:* ${name}%0a` +
      `*Номер Телефона:* ${phone}%0a` +
      `${quizResponses}` + // Додаємо вибрані відповіді з квізу
      `%0a`;

    // Відкриваємо WhatsApp
    window.open(url, "_blank").focus();
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && isOpenQuiz) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpenQuiz, currentStep]);

  const handleNext = () => {
    if (selectedOptions[currentStep]?.length === 0) {
      toast.error(
        "Пожалуйста, выберите хотя бы один вариант, чтобы продолжить."
      );
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

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="main-page">
        <div className="main-page-content">
          <div className="main-column">
            <img src="/logo.png" alt="" className="logo" />
            <h2 className="underTitle">10 лет опыта работы на рынке</h2>
          </div>
            <h2 className="title">
              <strong>
                Элитная недвижимость в Дубае от 250000$ от агенства Prime Dubai
                Estates
              </strong>
            </h2>

          <div className="button-start" onClick={() => setIsOpenQuiz(true)}>
            Начать подбор
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
                {currentStep + 1} / {questions.length + 1}
              </div>
            </div>
          </div>

          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="quiz-container">
          {currentStep < questions.length ? (
            <>
              <h2 className="quiz-title animate-text">
                {questions[currentStep].name}
              </h2>

              <div className="quiz-options">
                {questions[currentStep].checkbox.map((option, index) => (
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
              <h2 className="quiz-title animate-text">
                Заполните форму и получите подборку!
              </h2>
              <div className="quiz-form">
                <label htmlFor="name">Ваше Имя *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="quiz-input"
                  required
                />

                <label htmlFor="phone">Ваш телефон *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="quiz-input"
                  required
                />

                <button
                  className="submit-button"
                  onClick={() => {
                    sendWhatsApp(); // Викликаємо функцію для відправки на WhatsApp
                    setIsOpenQuiz(false);
                    setCurrentStep(0);
                    setFormData({ name: "", phone: "" });
                  }}
                  disabled={!formData.name || !formData.phone}
                >
                  Получить подборку
                </button>
              </div>
            </>
          )}
        </div>

        <div className="quiz-footer">
          <div className="quiz-navigation">
            <button onClick={handleBack} className="back-button">
              ←
            </button>
            <button onClick={handleNext} className="next-button">
              Далее
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
