import { useEffect, useState, useRef } from "react";
import { getClasses, getTrainers , getPlans , subscribeToPlan } from "../services/api";


// const classes = [
//   {
//     number: "01 / TRAINING",
//     day: "MONDAY · 08:00–09:00",
//     name: "HIIT Training",
//     description: "High-intensity sessions designed to challenge your endurance and conditioning.",
//     coach: "COACH SARAH",
//     goal: "hiit",
//   },
//   {
//     number: "02 / MOBILITY",
//     day: "TUESDAY · 18:00–19:00",
//     name: "Yoga Flow",
//     description: "Improve flexibility, balance, and focus through controlled movement.",
//     coach: "COACH EMMA",
//     goal: "yoga",
//   },
//   {
//     number: "03 / PERFORMANCE",
//     day: "WEDNESDAY · 17:00–18:00",
//     name: "CrossFit",
//     description: "Develop functional strength and conditioning with varied workouts.",
//     coach: "COACH MIKE",
//     goal: "crossfit",
//   },
//   {
//     number: "04 / COMBAT",
//     day: "THURSDAY · 19:00–20:00",
//     name: "Boxing",
//     description: "Build coordination, speed, and stamina in an energetic training session.",
//     coach: "COACH ALEX",
//     goal: "hiit",
//   },
//   {
//     number: "05 / STRENGTH",
//     day: "FRIDAY · 18:00–19:00",
//     name: "Strength Training",
//     description: "Focus on progressive resistance training and building full-body strength.",
//     coach: "COACH MIKE",
//     goal: "hiit",
//   },
//   {
//     number: "06 / CONDITIONING",
//     day: "SATURDAY · 10:00–11:00",
//     name: "Functional Fitness",
//     description: "Train everyday movement patterns while improving overall performance.",
//     coach: "COACH SARAH",
//     goal: "crossfit",
//   },
// ];

// const trainers = [
//   {
//     name: "Sarah Johnson",
//     role: "HIIT & STRENGTH",
//     image: "/images/images/Sarah.avif",
//     description: "Helping members build strength, endurance, and confidence.",
//   },
//   {
//     name: "Mike Williams",
//     role: "CROSSFIT",
//     image: "/images/images/Mike.avif",
//     description: "Focused on functional movement, technique, and performance.",
//   },
//   {
//     name: "Emma Davis",
//     role: "YOGA & MOBILITY",
//     image: "/images/images/Emma.avif",
//     description: "Helping members improve mobility, flexibility, and balance.",
//   },
// ];

// const plans = [
//   {
//     number: "01 / ESSENTIAL",
//     name: "Basic",
//     price: "$29",
//     description: "Everything you need to get started.",
//     features: ["Gym access", "3 classes per week", "Locker access"],
//   },
//   {
//     number: "02 / PERFORMANCE",
//     name: "Pro",
//     price: "$59",
//     description: "More flexibility for your routine.",
//     features: [
//       "Unlimited gym access",
//       "Unlimited classes",
//       "1 trainer session",
//     ],
//     featured: true,
//   },
//   {
//     number: "03 / PERSONAL",
//     name: "Elite",
//     price: "$99",
//     description: "A more personal training experience.",
//     features: [
//       "Unlimited gym access",
//       "Unlimited classes",
//       "4 trainer sessions",
//     ],
//   },
// ];

const trainingOptions = [
  {
    id: "hiit",
    number: "01",
    icon: "⚡",
    title: "HIIT & Strength",
    description: "Burn calories, build strength and boost endurance.",
    resultTitle: "Your strength journey starts here.",
    resultDescription:
      "High-energy training designed to build strength and endurance.",
    className: "HIIT Performance",
    classDescription: "Intervals, strength circuits and conditioning.",
    coach: "Sarah Johnson",
    specialty: "Strength & Conditioning",
    avatar: "SJ",
  },
  {
    id: "crossfit",
    number: "02",
    icon: "🏋",
    title: "CrossFit",
    description: "Challenge yourself with functional, full-body workouts.",
    resultTitle: "Build strength through movement.",
    resultDescription:
      "Functional workouts designed to improve strength and performance.",
    className: "CrossFit Training",
    classDescription: "Functional movements, varied workouts and conditioning.",
    coach: "Mike Williams",
    specialty: "CrossFit & Performance",
    avatar: "MW",
  },
  {
    id: "yoga",
    number: "03",
    icon: "◉",
    title: "Yoga & Mobility",
    description: "Improve flexibility, balance and mindful movement.",
    resultTitle: "Find your balance.",
    resultDescription:
      "Mindful training to improve flexibility, mobility and focus.",
    className: "Yoga Flow",
    classDescription: "Stretching, balance and controlled movement.",
    coach: "Emma Davis",
    specialty: "Yoga & Mobility",
    avatar: "ED",
  },
];

const sectionClass ="mx-auto max-w-[1280px] px-6 py-[20px] lg:px-8 lg:py-[20px]";
const eyebrowClass = "mb-4 text-xs font-bold tracking-[0.2em] text-[#a5a5a5]";
const headingClass ="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl";
const cardClass = "flex flex-col border border-[#333] bg-[#141414] p-6 transition-colors hover:border-white sm:p-8";
const buttonClass ="inline-flex items-center justify-center border border-white px-6 py-3 text-sm font-semibold transition-colors hover:bg-white hover:text-black";

//controlled component reused per item
function FavoriteToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="mt-5 self-start border border-[#444] px-4 py-2 text-sm transition-colors hover:border-white"
    >
      {checked ? "♥ Saved" : "♡ Save class"}
    </button>
  );
}



// -------------------------


export function Container() {

  // -------------------------
    const [bookingLoading, setBookingLoading] = useState(null);

    async function handleChoosePlan(plan) {
      try {
        setBookingLoading(plan.id);

        const data = await subscribeToPlan(plan.id);

        alert(data.message);
      } catch (error) {
        alert(error.message);
      } finally {
        setBookingLoading(null);
      }
    }

 //Add classes state
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getClasses()
      .then((data) => setClasses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

 //Add trainer state
  const [trainers, setTrainers] = useState([]);
  const [trainersLoading, setTrainersLoading] = useState(true);
  const [trainersError, setTrainersError] = useState("");

  useEffect(() => {
    getTrainers()
      .then((data) => setTrainers(data))
      .catch((err) => setTrainersError(err.message))
      .finally(() => setTrainersLoading(false));
  }, []);

 //Add plans state
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [plansError, setPlansError] = useState("");

    useEffect(() => {
      getPlans()
        .then((data) => setPlans(data))
        .catch((err) => setPlansError(err.message))
        .finally(() => setPlansLoading(false));
    }, []);

  const [selectedGoal, setSelectedGoal] = useState("hiit");
  const resultRef = useRef(null);


  const selectedOption = trainingOptions.find(
    (option) => option.id === selectedGoal,
  );

  const filteredClasses = classes.filter((item) => item.goal === selectedGoal);

  const [savedClasses, setSavedClasses] = useState([]);

  function toggleSavedClass(id) {
    setSavedClasses((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id],
    );
  }

  return (
    <main className="overflow-hidden bg-[#080808] text-white">
      {/* section HERO */}
      <section
        id="home"
        className="relative isolate overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `
      linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.78) 42%, rgba(0,0,0,0.28) 100%),
      linear-gradient(0deg, rgba(0,0,0,0.65), transparent 45%),
      url("/images/images/intro-image.avif")
    `,
        }}
      >
        <div className="mx-auto w-full max-w-[1280px] m-[30px]">
          <p className={eyebrowClass}>YOUR FITNESS. YOUR FUTURE.</p>

          <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl">
            PUSH YOUR
            <span className="block text-[#a5a5a5]">LIMITS.</span>
          </h1>

          <p className="mt-7 max-w-lg leading-7 text-[#a5a5a5]">
            Train with purpose. Build your strength. Become the strongest
            version of yourself.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a href="#membership" className={buttonClass}>
              Explore Membership
            </a>
            <a
              href="#schedule"
              className="inline-flex items-center justify-center border border-[#444] px-6 py-3 text-sm font-semibold transition-colors hover:border-white"
            >
              Discover Our Classes
            </a>
          </div>

          <div className="mt-20 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#333] pt-6 text-xs font-bold tracking-[0.18em] text-[#a5a5a5] sm:gap-x-12">
            <span>STRENGTH</span>
            <span>PERFORMANCE</span>
            <span>WELLNESS</span>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section
        className={`${sectionClass} grid items-center gap-12 md:grid-cols-2 lg:gap-20`}
      >
        <div>
          <p className={eyebrowClass}>MORE THAN A WORKOUT</p>
          <h2 className={headingClass}>
            BUILT FOR
            <span className="block text-[#a5a5a5]">PROGRESS.</span>
          </h2>

          <p className="mt-6 max-w-xl leading-7 text-[#a5a5a5]">
            Your fitness journey deserves more than an ordinary routine.
            Discover expert coaching, structured training, and a community that
            helps you move forward.
          </p>

          <a
            href="#trainers"
            className="mt-8 inline-flex items-center gap-3 text-sm font-bold tracking-wider hover:text-[#a5a5a5]"
          >
            MEET OUR TEAM ↗
          </a>
        </div>

        <img
          src="/images/images/img1.webp"
          alt="Modern gym with professional fitness equipment"
          loading="lazy"
          className="h-[320px] w-full object-cover sm:h-[420px]"
        />
      </section>

      {/* CLASSES */}
      <section id="schedule" className={sectionClass}>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={eyebrowClass}>FIND YOUR STRENGTH</p>
            <h2 className={headingClass}>OUR CLASSES</h2>
          </div>

          <p className="max-w-sm leading-7 text-[#a5a5a5]">
            Different goals. Different disciplines. One place to make progress.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Loading classes...</p>
          ) : error ? (
            <p>Could not load classes: {error}</p>
          ) : classes.length === 0 ? (
            <p>No classes available yet.</p>
          ) : (
            classes.map((item) => (
              <article
                key={item.id}
                className="flex flex-col border border-[#333] bg-[#141414] p-4 transition-colors hover:border-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold tracking-widest text-[#a5a5a5]">
                    {item.class_number}
                  </p>

                  <FavoriteToggle
                    checked={savedClasses.includes(item.id)}
                    onChange={() => toggleSavedClass(item.id)}
                  />
                </div>

                <p className="mt-4 text-xs tracking-wide text-[#a5a5a5]">
                  {item.schedule}
                </p>

                <h3 className="mt-2 text-xl font-bold">{item.name}</h3>

                <p className="mt-2 text-sm leading-6 text-[#a5a5a5]">
                  {item.description}
                </p>

                <p className="mt-4 border-t border-[#333] pt-3 text-xs font-bold tracking-widest">
                  {item.coach_name}
                </p>
              </article>
            ))
          )}
        </div>
      </section>

      {/* STATEMENT BANNER */}
      <section
        className="relative isolate overflow-hidden bg-cover bg-center bg-no-repeat px-6 py-20 text-white"
        style={{
          backgroundImage: `
      linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.78)),
      url("/images/images/banner.avif")
    `,
        }}
      >
        <div className="mx-auto max-w-[1280px]">
          <p className={eyebrowClass}>EVERY REP COUNTS</p>
          <h2 className="text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
            SHOW UP.
            <span className="block text-[#777]">LEVEL UP.</span>
          </h2>
          <a href="#membership" className={buttonClass}>
            START YOUR JOURNEY
          </a>
        </div>
      </section>

      {/* TRAINERS */}
      <section id="trainers" className={sectionClass}>
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={eyebrowClass}>EXPERTISE THAT MOVES YOU</p>
            <h2 className={headingClass}>MEET THE TEAM</h2>
          </div>
          <p className="max-w-sm leading-7 text-[#a5a5a5]">
            The right guidance can change the way you train.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
            {trainersLoading ? (
              <p>Loading trainers...</p>
            ) : trainersError ? (
              <p>Could not load trainers: {trainersError}</p>
            ) : trainers.length === 0 ? (
              <p>No trainers available yet.</p>
            ) : (
              trainers.map((trainer) => (
                <article
                  key={trainer.id}
                  className="border border-[#333] bg-[#141414]"
                >
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    loading="lazy"
                    className="h-[240px] w-full object-cover sm:h-[280px] md:h-[300px]"
                  />

                  <div className="p-6">
                    <p className={eyebrowClass}>{trainer.role}</p>

                    <h3 className="text-2xl font-bold">
                      {trainer.name}
                    </h3>

                    <p className="mt-3 leading-7 text-[#a5a5a5]">
                      {trainer.description}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
      </section>

      {/* MEMBERSHIP */}
      <section id="membership" className={sectionClass}>
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={eyebrowClass}>INVEST IN YOURSELF</p>
            <h2 className={headingClass}>FIND YOUR PLAN</h2>
          </div>
          <p className="max-w-sm leading-7 text-[#a5a5a5]">
            Choose the membership that fits your training goals.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
            {plansLoading ? (
              <p>Loading membership plans...</p>
            ) : plansError ? (
              <p>Could not load plans: {plansError}</p>
            ) : plans.length === 0 ? (
              <p>No membership plans available.</p>
            ) : (
              plans.map((plan) => (
                <article
                  key={plan.id}
                  className={`flex flex-col border p-6 sm:p-8 ${
                    plan.featured
                      ? "border-white bg-[#1c1c1c]"
                      : "border-[#333] bg-[#141414]"
                  }`}
                >
                  <p className={eyebrowClass}>{plan.plan_number}</p>

                  {plan.featured && (
                    <span className="mb-4 w-fit bg-white px-3 py-2 text-xs font-bold text-black">
                      MOST POPULAR
                    </span>
                  )}

                  <h3 className="text-3xl font-bold">{plan.name}</h3>

                  <p className="mt-5 text-4xl font-bold">
                    {plan.price}
                    <span className="text-base font-normal text-[#a5a5a5]">
                      {" "}
                      / {plan.duration_days} days
                    </span>
                  </p>

                  <p className="mt-4 text-[#a5a5a5]">
                    {plan.description}
                  </p>

                  <ul className="my-8 flex-1 space-y-4 border-t border-[#333] pt-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm">
                        <span className="mr-3">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                      type="button"
                      onClick={() => handleChoosePlan(plan)}
                      disabled={bookingLoading !== null}
                      className={
                        plan.featured
                          ? "inline-flex justify-center border border-white bg-white px-5 py-3 text-sm font-bold text-black hover:bg-transparent hover:text-white disabled:opacity-50"
                          : `${buttonClass} disabled:opacity-50`
                      }
                    >
                      {bookingLoading === plan.id
                        ? "ADDING..."
                        : `CHOOSE ${plan.name.toUpperCase()}`}
                  </button>
                </article>
              ))
            )}
          </div>

        <p className="mt-6 text-sm text-[#a5a5a5]">
          Membership prices are sample content. Update them to reflect your
          actual offers.
        </p>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section
        className="relative isolate overflow-hidden bg-cover bg-center bg-no-repeat px-6 py-20 text-white"
        style={{
          backgroundImage: `
      linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)),
      url("/images/images/final.jpg")
    `,
        }}
      >
        <p className={eyebrowClass}>YOUR NEXT CHAPTER STARTS HERE</p>
        <h2 className="mx-auto max-w-4xl text-4xl font-black sm:text-6xl">
          READY TO
          <span className="block text-[#a5a5a5]">MOVE FORWARD?</span>
        </h2>
        <p className="mt-6 text-[#a5a5a5]">
          Take the first step toward a stronger you.
        </p>
        <a href="#membership" className={`${buttonClass} mt-8`}>
          EXPLORE MEMBERSHIPS
        </a>
      </section>

      {/* FIND YOUR FIT — REAL REACT FILTER */}
      <section id="find-your-fit" className={sectionClass}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className={eyebrowClass}>YOUR TRAINING. YOUR WAY.</p>
            <h2 className={headingClass}>
              Find Your <span className="text-[#a5a5a5]">Fit</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#a5a5a5]">
              Everyone has a different goal. Choose your training style and
              we'll match you with the right classes and coach.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {trainingOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedGoal(option.id);

                  setTimeout(() => {
                    resultRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                }}
                aria-pressed={selectedGoal === option.id}
                className={`flex flex-col items-start border p-5 text-left transition-colors ${
                  selectedGoal === option.id
                    ? "border-white bg-[#1c1c1c]"
                    : "border-[#333] bg-[#141414] hover:border-[#888]"
                }`}
              >
                <span className="text-xs text-[#a5a5a5]">{option.number}</span>
                <span className="mt-5 text-2xl" aria-hidden="true">
                  {option.icon}
                </span>
                <span className="mt-4 font-bold">{option.title}</span>
                <span className="mt-3 text-sm leading-6 text-[#a5a5a5]">
                  {option.description}
                </span>
                <span className="mt-5 text-sm">
                  {selectedGoal === option.id ? "✓ Selected" : "Select ↗"}
                </span>
              </button>
            ))}
          </div>

          <div
            ref={resultRef}
            className="mt-8 scroll-mt-6 border border-[#333] bg-[#141414] p-6 sm:p-8"
          >
            <p className={eyebrowClass}>YOUR PERSONALIZED MATCH</p>
            <h3 className="text-2xl font-bold sm:text-3xl">
              {selectedOption.resultTitle}
            </h3>
            <p className="mt-4 leading-7 text-[#a5a5a5]">
              {selectedOption.resultDescription}
            </p>

            <div className="mt-8 grid gap-8 border-t border-[#333] pt-8 sm:grid-cols-2">
              <div>
                <p className={eyebrowClass}>YOUR CLASS</p>
                <h4 className="text-xl font-bold">
                  {selectedOption.className}
                </h4>
                <p className="mt-3 leading-7 text-[#a5a5a5]">
                  {selectedOption.classDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="border border-[#444] px-3 py-2">45 min</span>
                  <span className="border border-[#444] px-3 py-2">
                    All levels
                  </span>
                </div>
              </div>

              <div>
                <p className={eyebrowClass}>YOUR COACH</p>
                <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-[#555] font-bold">
                  {selectedOption.avatar}
                </div>
                <h4 className="text-xl font-bold">{selectedOption.coach}</h4>
                <p className="mt-2 text-sm text-[#a5a5a5]">
                  {selectedOption.specialty}
                </p>
                <p className="mt-3 leading-7 text-[#a5a5a5]">
                  Your coach can help you improve technique, build confidence,
                  and adapt your training to your goals.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-5 border-t border-[#333] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-[#a5a5a5]">
                Not sure where to start? Your coach can help you adapt the
                workout.
              </p>
              <a href="#schedule" className={buttonClass}>
                EXPLORE OUR CLASSES →
              </a>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-5 text-xl font-bold">
              Classes matching your choice
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((item) => (
                  <article key={item.number} className={cardClass}>
                    <p className={eyebrowClass}>{item.day}</p>
                    <h4 className="text-xl font-bold">{item.name}</h4>
                    <p className="mt-3 flex-1 leading-7 text-[#a5a5a5]">
                      {item.description}
                    </p>
                    <p className="mt-5 text-xs font-bold tracking-widest">
                      {item.coach}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-[#a5a5a5]">
                  No classes found for this training style.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
