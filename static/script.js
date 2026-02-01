document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 0;

  const steps = document.querySelectorAll(".step");
  const bar = document.getElementById("bar");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const form = document.getElementById("surveyForm");

  // ✅ Google Form backend URL
  const GOOGLE_FORM_ACTION_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSfmjdUe8BvpP1nnZOARAPcK7RJbSj0f0KXlUCHQe7mXhdz-qw/formResponse";

  // ✅ Entry mapping (UPDATED)
  const ENTRY = {
    name: "entry.167936367",
    age: "entry.1814503071",
    life: "entry.1512901872",
    busy_meals: "entry.1106749226",
    reason: "entry.1881675444",
    delivery_problem: "entry.1903300658",
    home_food: "entry.1493350363",
    first_order: "entry.274706038",
    price: "entry.1862869146",
    rating: "entry.983563478"
  };

  function showStep(index) {
    steps.forEach((s, i) => s.classList.toggle("active", i === index));
    prevBtn.style.display = index === 0 ? "none" : "block";
    nextBtn.innerText = index === steps.length - 1 ? "Submit" : "Next";
    bar.style.width = ((index + 1) / steps.length) * 100 + "%";
  }

  function validateStep() {
    const current = steps[currentStep];

    // required check for inputs/selects/textarea
    const requiredFields = current.querySelectorAll("[required]");
    for (const el of requiredFields) {
      if (!el.value) {
        el.focus();
        return false;
      }
    }

    // checkbox groups must have at least one option selected
    const checkboxGroups = ["busy_meals", "reason", "delivery_problem", "home_food"];
    for (const name of checkboxGroups) {
      const boxes = current.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
      if (boxes.length > 0) {
        const anyChecked = Array.from(boxes).some(b => b.checked);
        if (!anyChecked) {
          alert("Please select at least one option 😄");
          return false;
        }
      }
    }

    return true;
  }

  function getCheckedValues(fieldName) {
    return Array.from(document.querySelectorAll(`input[name="${fieldName}"]:checked`))
      .map(x => x.value);
  }

  showStep(currentStep);

  nextBtn.addEventListener("click", async () => {
    if (!validateStep()) return;

    // submit on last step
    if (currentStep === steps.length - 1) {
      nextBtn.disabled = true;
      nextBtn.innerText = "Submitting...";

      const data = Object.fromEntries(new FormData(form).entries());

      // collect checkbox values
      const busyMeals = getCheckedValues("busy_meals");
      const reasons = getCheckedValues("reason");
      const deliveryProblems = getCheckedValues("delivery_problem");
      const homeFood = getCheckedValues("home_food");

      const formData = new FormData();

      // Normal fields
      formData.append(ENTRY.name, data.name || "");
      formData.append(ENTRY.age, data.age || "");
      formData.append(ENTRY.life, data.life || "");
      formData.append(ENTRY.first_order, data.first_order || "");
      formData.append(ENTRY.price, data.price || "");
      formData.append(ENTRY.rating, data.rating || "");

      // Checkbox fields (multi-select): send repeated key values
      busyMeals.forEach(v => formData.append(ENTRY.busy_meals, v));
      reasons.forEach(v => formData.append(ENTRY.reason, v));
      deliveryProblems.forEach(v => formData.append(ENTRY.delivery_problem, v));
      homeFood.forEach(v => formData.append(ENTRY.home_food, v));

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

            <div style="margin-top:14px;padding:12px;border-radius:16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);">
              <p style="font-weight:800;color:#00ff8c;">
                Ayy! You just helped HomeBites become real 💚🍱
              </p>
              <p style="margin-top:6px;color:rgba(255,255,255,0.75);">
                We owe you one bite 😄
              </p>
            </div>

            <p style="margin-top:12px;color:rgba(255,255,255,0.65);font-size:13px;">
              You can close this page now 😌
            </p>
          </div>
        `;
      } catch (e) {
        alert("Submission failed. Please try again.");
        console.error(e);
        nextBtn.disabled = false;
        nextBtn.innerText = "Submit";
      }

      return;
    }

    currentStep++;
    showStep(currentStep);
  });

  prevBtn.addEventListener("click", () => {
    currentStep--;
    showStep(currentStep);
  });
});
