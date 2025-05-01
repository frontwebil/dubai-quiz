import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

export function App() {
  const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  const URI_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
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
    // {
    //   name: "Нужный тип недвижимости",
    //   checkbox: ["Квартира", "Вилла", "Таунхаус", "Пентхаус", "Все варианты"],
    // },
    // {
    //   name: "Район",
    //   checkbox: [
    //     "Любой",
    //     "Dubai Marina",
    //     "Dubai Islands",
    //     "Business Bay",
    //     "Jumeirah Village Circle (JVC)",
    //     "Dubai Hills",
    //     "Palm Jumeirah",
    //     "Downtown",
    //     "Creek Harbour",
    //   ],
    // },
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
    // {
    //   name: "Бюджет",
    //   checkbox: [
    //     "250 000 - 350 000$",
    //     "350 000 - 550 000$",
    //     "550 000 - 700 000$",
    //     "700 000 - 1 300 000$",
    //     "более 1 300 000$",
    //   ],
    // },
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

  const sendBookingNotification = async () => {
    let quizResponses = "";

    const questions = [
      "\n<b>Выберите нужный тип недвижимости</b>",
      "\n<b>Какой район предпочитаете?</b>",
      "\n<b>С какой целью планируете совершить покупку?</b>",
      "\n<b>Когда планируете покупку?</b>",
      "\n<b>В пределах какого бюджета рассматриваете покупку?</b>",
    ];

    for (let i = 0; i < questions.length; i++) {
      const selectedOptionsForStep = selectedOptions[i] || [];
      if (selectedOptionsForStep.length > 0) {
        quizResponses += `${questions[i]}:\n${selectedOptionsForStep.join(
          ", \n"
        )}\n`;
      }
    }

    const inputContents = [
      "",
      `👤 <b>*Ім'я:*</b> ${formData.name}`,
      `📱 <b>*Номер телефону:*</b> ${formData.phone}`,
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
          parse_mode: "html", // або HTML, якщо так і хочеш
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
    try {
      await sendBookingNotification();

      setSelectedOptions({
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
      });
      setIsOpenQuiz(false);
      setCurrentStep(0);
      setFormData({ name: "", phone: "" });
      toast.success(
        "Заявка успешно отправлена! Мы скоро с вами свяжемся."
      );
      window.location.href = "/thank.html";
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  // function sendWhatsApp() {
  //   const phonenumber = "+380632672311";

  //   // Дані з форми (тільки ім'я та телефон)
  //   const name = formData.name;
  //   const phone = formData.phone;

  //   // Формуємо текст для WhatsApp
  //   const url =
  //     `https://wa.me/${phonenumber}?text=` +
  //     `*Имя:* ${name}%0a` +
  //     `*Номер Телефона:* ${phone}%0a` +
  //     `%0a`;

  //   // Відкриваємо WhatsApp
  //   window.open(url, "_blank").focus();
  // }

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
                    handleSubmit();
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
