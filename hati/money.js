const amountInput = document.getElementById("amount");
const shareLine = document.getElementById("share-line");
const form = document.getElementById("bill-form");
const category = document.getElementById("category");
const customBox = document.getElementById("custom-category");
const custom = document.getElementById("custom");
const message = document.getElementById("saved");
const dateInput = document.getElementById("when");
const people = Array.from(document.querySelectorAll("#people input"));

function formatPesoText(text) {
  const cleaned = text.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  const whole = parts[0].replace(/^0+(?=\d)/, "");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (parts.length > 1) {
    return withCommas + "." + parts.slice(1).join("").slice(0, 2);
  }
  return withCommas;
}

function reformat(input) {
  const caret = input.selectionStart;
  const digitsBefore = input.value.slice(0, caret).replace(/[^\d.]/g, "").length;
  input.value = formatPesoText(input.value);
  let position = 0;
  let seen = 0;
  while (position < input.value.length && seen < digitsBefore) {
    if (/[\d.]/.test(input.value[position])) {
      seen += 1;
    }
    position += 1;
  }
  input.setSelectionRange(position, position);
}

function toCentavos(text) {
  const parts = text.replace(/,/g, "").split(".");
  const pesos = Number(parts[0] || 0);
  const centavos = Number(((parts[1] || "") + "00").slice(0, 2));
  return pesos * 100 + centavos;
}

function formatCentavos(value) {
  const pesos = Math.floor(value / 100);
  const centavos = value % 100;
  const suffix = centavos ? "." + String(centavos).padStart(2, "0") : "";
  return "₱" + pesos.toLocaleString("en-PH") + suffix;
}

function strong(text) {
  const element = document.createElement("strong");
  element.textContent = text;
  return element;
}

function sharerCount() {
  return people.filter(function (person) {
    return person.checked;
  }).length;
}

function showShare() {
  const total = toCentavos(amountInput.value);
  const count = sharerCount();
  if (total === 0 || count === 0) {
    shareLine.textContent = "Each person's share will show here";
    return;
  }
  const base = Math.floor(total / count);
  const leftover = total - base * count;
  const pieces = [document.createTextNode("Each person's share: "), strong(formatCentavos(base))];
  if (leftover > 0) {
    pieces.push(document.createTextNode(", the leftover " + formatCentavos(leftover) + " goes to whoever paid"));
  }
  shareLine.replaceChildren(...pieces);
}

const today = new Date().toISOString().slice(0, 10);
dateInput.value = today;
dateInput.max = today;

amountInput.addEventListener("input", function () {
  reformat(amountInput);
  showShare();
});

people.forEach(function (person) {
  person.addEventListener("change", showShare);
});

category.addEventListener("change", function () {
  customBox.hidden = category.value !== "Other";
  if (!customBox.hidden) {
    custom.focus();
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (toCentavos(amountInput.value) === 0) {
    message.textContent = "Enter how much it cost";
    return;
  }
  if (sharerCount() === 0) {
    message.textContent = "Pick at least one person who shared it";
    return;
  }
  if (category.value === "Other" && custom.value.trim() === "") {
    message.textContent = "Type the category";
    return;
  }
  message.textContent = "Bill saved, this is only a sample";
});
