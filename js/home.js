
const fitnessRecommendations = {
    hiit: {
        title: "Build strength. Push your limits.",
        description:
            "A high-energy training plan focused on strength, conditioning and endurance.",
        className: "HIIT Performance",
        classDescription:
            "Combine timed intervals, strength circuits and conditioning exercises in one adaptable workout.",
        tags: ["45 minutes", "All levels"],
        coachInitials: "SJ",
        coachName: "Sarah Johnson",
        specialty: "Strength & Conditioning",
        coachBio:
            "Focuses on exercise technique, progressive training and helping members build confidence.",
        note:
            "A great starting point if you want a stronger, fitter and more energetic routine."
    },

    crossfit: {
        title: "Get stronger. Move better. Go further.",
        description:
            "Functional training built around strength, power, technique and personal progress.",
        className: "CrossFit Foundations",
        classDescription:
            "Learn movement fundamentals before progressing to scaled workouts with strength and conditioning.",
        tags: ["50 minutes", "Beginner friendly"],
        coachInitials: "MW",
        coachName: "Mike Williams",
        specialty: "Functional Fitness",
        coachBio:
            "Emphasizes safe movement, scalable exercises and steady improvement at your own pace.",
        note:
            "New to CrossFit? Start with the fundamentals and adapt every workout to your level."
    },

    yoga: {
        title: "Find your balance. Move with purpose.",
        description:
            "Build flexibility, mobility and body awareness while creating space to recover.",
        className: "Yoga & Mobility Flow",
        classDescription:
            "A guided session combining controlled movement, flexibility work, balance and breathing.",
        tags: ["40 minutes", "All levels"],
        coachInitials: "ED",
        coachName: "Emma Davis",
        specialty: "Yoga & Mobility",
        coachBio:
            "Focuses on mindful movement, mobility progressions and modifications for different abilities.",
        note:
            "A suitable choice if your priority is mobility, recovery and more comfortable movement."
    }
};

const fitOptions = document.querySelectorAll(".fit-option");

const resultElements = {
    title: document.querySelector("#fit-result-title"),
    description: document.querySelector("#fit-result-description"),
    className: document.querySelector("#fit-class-name"),
    classDescription: document.querySelector("#fit-class-description"),
    tags: document.querySelector("#fit-class-tags"),
    coachAvatar: document.querySelector("#fit-coach-avatar"),
    coachName: document.querySelector("#fit-coach-name"),
    coachSpecialty: document.querySelector("#fit-coach-specialty"),
    coachBio: document.querySelector("#fit-coach-bio"),
    note: document.querySelector("#fit-result-note")
};

function showFitnessRecommendation(goal) {
    const recommendation = fitnessRecommendations[goal];

    if (!recommendation) return;

    resultElements.title.textContent = recommendation.title;
    resultElements.description.textContent = recommendation.description;
    resultElements.className.textContent = recommendation.className;
    resultElements.classDescription.textContent =
        recommendation.classDescription;

    resultElements.tags.replaceChildren(
        ...recommendation.tags.map((tag) => {
            const tagElement = document.createElement("span");
            tagElement.textContent = tag;
            return tagElement;
        })
    );

    resultElements.coachAvatar.textContent = recommendation.coachInitials;
    resultElements.coachName.textContent = recommendation.coachName;
    resultElements.coachSpecialty.textContent = recommendation.specialty;
    resultElements.coachBio.textContent = recommendation.coachBio;
    resultElements.note.textContent = recommendation.note;

    fitOptions.forEach((option) => {
        const isSelected = option.dataset.goal === goal;

        option.classList.toggle("is-selected", isSelected);
        option.setAttribute("aria-pressed", String(isSelected));
    });
}

fitOptions.forEach((option) => {
    option.addEventListener("click", () => {
        showFitnessRecommendation(option.dataset.goal);
    });
});

// Display the default recommendation on page load.
showFitnessRecommendation("hiit");

fitOptions.forEach((option) => {
    option.addEventListener("click", () => {
        showFitnessRecommendation(option.dataset.goal);

        document.querySelector(".fit-result").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});
