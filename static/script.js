let currentStep = 0;

const steps = document.querySelectorAll(".step");
const bar = document.getElementById("bar");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const form = document.getElementById("surveyForm");

function showStep(index) {
  steps.forEach((s, i) => s.classList.toggle("active", i === index));
  prevBtn.style.display = index === 0 ? "none" : "block";
  nextBtn.innerText = (index === steps.length - 1) ? "Submit" : "Next";
  bar.style.width = ((index + 1) / steps.length) * 100 + "%";
}

showStep(currentStep);

nextBtn.addEventListener("click", async () => {
  // Validate required fields
  const inputs = steps[currentStep].querySelectorAll("input,select,textarea");
  for (const inp of inputs) {
    if (inp.hasAttribute("required") && !inp.value) {
      inp.focus();
      return;
    }
  }

  // Submit final step
  if (currentStep === steps.length - 1) {
    const data = Object.fromEntries(new FormData(form).entries());

    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const out = await res.json();

    if (out.status === "success") {
      document.querySelector(".card").innerHTML = `
        <div style="text-align:center;padding:24px;">
          <div style="font-size:52px;">✅</div>
          <h2 style="margin-top:10px;">Thank you!</h2>
          <p style="margin-top:8px;color:#a7ffcf;">
            Your response helps HomeBites grow 💚
          </p>
          <p style="margin-top:12px;color:rgba(255,255,255,0.65);font-size:13px;">
            You can close this page now.
          </p>
        </div>
      `;
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
