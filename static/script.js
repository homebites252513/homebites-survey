// render-force-update-1
document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 0;

  const steps = document.querySelectorAll(".step");
  const bar = document.getElementById("bar");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const form = document.getElementById("surveyForm");

  console.log("✅ HomeBites survey script loaded");
  console.log("steps:", steps.length);

  // ✅ Google Form backend URL
  const GOOGLE_FORM_ACTION_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSfmjdUe8BvpP1nnZOARAPcK7RJbSj0f0KXlUCHQe7mXhdz-qw/formResponse";

  // ✅ Entry mapping
  const ENTRY = {
    name: "entry.167936367",
    age: "entry.1814503071",
    occupation: "entry.1512901872",
    frequency: "entry.1106749226",
    preferred_meals: "entry.1881675444",
    pain_points: "entry.1903300658",
    price_range: "entry.1493350363",
    subscription_interest: "entry.274706038",
    recommend_score: "entry.1862869146",
    feedback: "entry.983563478"
  };

  if (!nextBtn || !prevBtn || !form || steps.length === 0) {
    console.error("❌ Survey elements not found. Check IDs/classes in survey.html.");
    console.log({ nextBtn, prevBtn, form, steps });
    return;
  }

  function showStep(index) {
    steps.forEach((s, i) => s.classList.toggle("active", i === index));
    prevBtn.style.display = index === 0 ? "none" : "block";
    nextBtn.innerText = index === steps.length - 1 ? "Submit" : "Next";
    bar.style.width = ((index + 1) / steps.length) * 100 + "%";
  }

  showStep(currentStep);

  nextBtn.addEventListener("click", async () => {
    // validate required fields in current step
    const inputs = steps[currentStep].querySelectorAll("input,select,textarea");
    for (const inp of inputs) {
      if (inp.hasAttribute("required") && !inp.value) {
        inp.focus();
        return;
      }
    }

    // submit if last step
    if (currentStep === steps.length - 1) {
      const data = Object.fromEntries(new FormData(form).entries());

      const formData = new FormData();
      formData.append(ENTRY.name, data.name || "");
      formData.append(ENTRY.age, data.age || "");
      formData.append(ENTRY.occupation, data.occupation || "");
      formData.append(ENTRY.frequency, data.frequency || "");
      formData.append(ENTRY.preferred_meals, data.preferred_meals || "");
      formData.append(ENTRY.pain_points, data.pain_points || "");
      formData.append(ENTRY.price_range, data.price_range || "");
      formData.append(ENTRY.subscription_interest, data.subscription_interest || "");
      formData.append(ENTRY.recommend_score, data.recommend_score || "");
      formData.append(ENTRY.feedback, data.feedback || "");

      try {
        await fetch(GOOGLE_FORM_ACTION_URL, {
          method: "POST",
          mode: "no-cors",
          body: formData
        });

        document.querySelector(".card").innerHTML = `
          <div style="text-align:center;padding:24px;">
            <div style="font-size:52px;">✅</div>
            <h2 style="margin-top:10px;">Thank you!</h2>
            <p style="margin-top:8px;color:#a7ffcf;">
              You just helped HomeBites grow 💚🍱
            </p>
            <div style="margin-top:14px;padding:12px;border-radius:16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);">
              <p style="font-weight:800;color:#00ff8c;">🏅 Badge Unlocked:</p>
              <p style="margin-top:6px;color:rgba(255,255,255,0.75);">
                Official HomeBites Supporter 😌
              </p>
            </div>
          </div>
        `;
      } catch (e) {
        alert("Submission failed. Please try again.");
        console.error(e);
      }

      return;
    }

    // next step
    currentStep++;
    showStep(currentStep);
  });

  prevBtn.addEventListener("click", () => {
    currentStep--;
    showStep(currentStep);
  });
});
