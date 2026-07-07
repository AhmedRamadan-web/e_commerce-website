import { clearCart } from "/js/utils/cart.js";
import { getCartTotal } from "/js/utils/cart.js";
import { loader } from "/js/utils/loader.js";
let cart_total = 0;
let erros = 0;
let discount = 1;
let country_and_states;
let country_list;
let state_list;
let id_state_option;
let id_country_option;
if (document.querySelector(".checkout-container")) {
  await loader("nav");
  await loader("footer");

  let req = new XMLHttpRequest();
  req.open("GET", "/assets/data/countries.json", true);
  req.send();
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 200) {
      country_and_states = JSON.parse(req.responseText);
      country_list = country_and_states.country;
      state_list = country_and_states.states;
      create_country_selection();
      create_states_selection();
      RefreshCountryBoxes();
    }
  };
  if (localStorage.getItem("userId")) {
    document.querySelector("input[name='email']").value =
      localStorage.getItem("userEmail");
    document.querySelector(".contact-title-wrapper a").style.display = "none";
  }
  let notesBox = document.querySelector("textarea[name='notes']");
  notesBox.addEventListener("input", function () {
    notesBox.style.height = "auto";

    if (notesBox.scrollHeight > 200) {
      notesBox.style.height = "200px";
      notesBox.style.overflowY = "auto";
    } else {
      notesBox.style.height = Math.min(notesBox.scrollHeight, 200) + "px";
      notesBox.style.overflowY = "hidden";
    }
  });

  let anotherAddress = document.querySelector("input[name='another-address']");
  anotherAddress.addEventListener("change", function () {
    if (anotherAddress.checked) {
      let anotherAddressSection = document
        .querySelector(".address-section")
        .cloneNode(true);
      anotherAddressSection.querySelectorAll("*").forEach((element) => {
        element.classList.remove("valid");
        element.classList.remove("invalid");
        if (element.classList.contains("error")) element.remove();
      });
      anotherAddressSection.querySelector("select[name='state']").innerHTML =
        "<option disabled selected hidden value=''>State / County *</option>";
      document.querySelector(".another-address-section").innerHTML =
        anotherAddressSection.innerHTML;

      RefreshCountryBoxes();
      refreshValidation();
      updateShipment();
    } else {
      document.querySelector(".another-address-section").innerHTML = "";
    }
  });

  id_state_option = document.querySelector("select[name='state']");
  id_country_option = document.querySelector("select[name='country']");

  refreshValidation();

  document.querySelector("#toggleSummary").addEventListener("click", () => {
    let cartView = document.querySelector(".cart-view");
    let toogleText = document.querySelector(".toggle-text");
    if (cartView.style.display == "flex") {
      cartView.style.display = "none";
      toogleText.innerHTML = "Show Order Summary";
    } else {
      cartView.style.display = "flex";
      toogleText.innerHTML = "Hide Order Summary";
    }
  });

  const mobileQuery = window.matchMedia("(max-width: 1214px)");
  if (mobileQuery.matches) {
    document
      .querySelector(".order-summary")
      .appendChild(document.querySelector(".cart-view"));
    document.querySelector(".cart-view").style.display = "none";
  } else {
    document
      .querySelector(".checkout-container")
      .appendChild(document.querySelector(".cart-view"));
    document.querySelector(".cart-view").style.display = "flex";
  }
  mobileQuery.addEventListener("change", (e) => {
    if (e.matches) {
      document
        .querySelector(".order-summary")
        .appendChild(document.querySelector(".cart-view"));
      document.querySelector(".cart-view").style.display = "none";
    } else {
      document
        .querySelector(".checkout-container")
        .appendChild(document.querySelector(".cart-view"));
      document.querySelector(".cart-view").style.display = "flex";
    }
  });

  document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    let inputs = document.querySelectorAll(
      "form input[type='text'] ,select,form input[name='payment']",
    );
    for (const input of inputs) {
      // Required fields
      if (
        ["country", "state", "city", "address"].includes(input.name) &&
        input.value.trim() === ""
      ) {
        alert("Please fill in all required fields");
        scrollToInput(input);
        return;
      }

      // Email
      if (input.name === "email") {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(input.value)) {
          alert("Please enter a valid email");
          scrollToInput(input);
          return;
        }
      }

      // Phone
      if (input.name === "phone") {
        const phoneRegex = /^\d{11}$/;
        if (!phoneRegex.test(input.value)) {
          alert("Please enter a valid phone number");
          scrollToInput(input);
          return;
        }
      }

      // Postal code
      if (input.name === "postal") {
        const postalRegex = /^\d{5}$/;
        if (!postalRegex.test(input.value)) {
          alert("Please enter a valid postal code");
          scrollToInput(input);
          return;
        }
      }

      // First & Last name
      if (input.name === "fName" || input.name === "lName") {
        const nameRegex = /^[A-Za-z]{3,20}$/;
        if (!nameRegex.test(input.value)) {
          alert("Please enter a valid name");
          scrollToInput(input);
          return;
        }
      }

      // Payment
      if (input.name === "payment" && !input.value) {
        alert("Please select a payment method");
        scrollToInput(input);
        return;
      }
    }

    alert("Your order has been placed successfully");
    clearCart();
    window.location.href = "/index.html";
  });

  document.querySelector("button.check-coupon").addEventListener("click", () => {
    ApplyDiscount();
  });
}
const create_country_selection = () => {
  let option = "";
  option +=
    '<option disabled selected hidden value="">Country /Reigon *</option>';
  for (const country_code in country_list) {
    option +=
      '<option value="' +
      country_code +
      '"' +
      "> " +
      country_list[country_code] +
      "</option>";
  }
  id_country_option.innerHTML = option;
};

const create_states_selection = (countryBox, stateBox) => {
  let selected_country_code = countryBox
    ? countryBox.value
    : id_country_option.value;

  let state_names = state_list[selected_country_code];

  if (!state_names) {
    id_state_option.innerHTML =
      "<option disabled selected hidden value=''>State / County *</option>";
    return;
  }

  let option = "";
  option +=
    "<option disabled selected hidden value=''>State / County *</option>";
  state_names.forEach((state) => {
    option += '<option value="' + state.name + '">' + state.name + "</option>";
  });
  if (stateBox) {
    stateBox.innerHTML = option;
    return;
  }
  id_state_option.innerHTML = option;
};
function scrollToInput(input, offset = 80) {
  const y = input.getBoundingClientRect().top + window.pageYOffset - offset;

  window.scrollTo({
    top: y,
    behavior: "smooth",
  });

  input.focus();
}
function checkValidation(field, fn, message) {
  function validationEvent(e) {
    if (fn) {
      if (fn(field.value)) {
        field.classList.remove("border-red-500");
        field.classList.add("border-green-500");
        let errorElement = field.parentElement.querySelector("span.error");
        if (errorElement) {
          errorElement.remove();
          erros -= 1;
        }
      } else {
        field.classList.remove("border-green-500");
        field.classList.add("border-red-500");
        let errorElement = document.createElement("span");
        errorElement.classList.add("error", "text-red-500", "text-xs", "mt-1");
        errorElement.innerHTML = message;
        if (field.parentElement.querySelector("span.error")) {
          field.parentElement.querySelector("span.error").remove();
          erros -= 1;
        }
        field.parentElement.appendChild(errorElement);
        erros += 1;
      }
      field.classList.add("validation");
    }
    if (
      document.querySelectorAll(".error").length > 0 ||
      document.querySelectorAll("input.valid, select.valid").length !=
      document.querySelectorAll("form input[type='text'].validation , select")
        .length ||
      !document.querySelector("input[name='payment']:checked") ||
      cart_total <= 0
    ) {
      document.querySelector(".submit").disabled = true;
    } else {
      document.querySelector(".submit").disabled = false;
    }
    if (field.name == "state" || field.name == "country") {
      updateShipment();
    }
  }
  field.addEventListener("input", validationEvent);
  field.addEventListener("focus", validationEvent);
}

function refreshValidation() {
  let inputs = document.querySelectorAll(
    "form input[type='text'] ,select,form input[name='payment']",
  );
  inputs.forEach((input) => {
    if (
      input.name == "country" ||
      input.name == "state" ||
      input.name == "city" ||
      input.name == "address"
    ) {
      checkValidation(
        input,
        (value) => value.length > 0,
        "This field is required",
      );
    }
    if (input.name == "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      checkValidation(
        input,
        (value) => emailRegex.test(value),
        "Please enter a valid email",
      );
    }
    if (input.name == "phone") {
      const phoneRegex = /^\d{11}$/;
      checkValidation(
        input,
        (value) => phoneRegex.test(value),
        "Please enter a valid phone number",
      );
    }
    if (input.name == "postal") {
      const postalRegex = /^\d{5}$/;
      checkValidation(
        input,
        (value) => postalRegex.test(value),
        "Please enter a valid postal code",
      );
    }
    if (input.name == "fName" || input.name == "lName") {
      const nameRegex = /^[A-Za-z]{3,20}$/;
      checkValidation(
        input,
        (value) => nameRegex.test(value),
        "Please enter a valid name (3-20 characters)",
      );
    }
    if (input.name == "payment") {
      checkValidation(input);
    }
  });
}
function updateShipment() {
  let country_inputs = document.querySelectorAll("select[name='country']");
  let state_inputs = document.querySelectorAll("select[name='state']");
  let shipment_country = country_inputs[country_inputs.length - 1].value;
  let shipment_state = state_inputs[state_inputs.length - 1].value;
  let shipping_price = document.querySelector("#shipping");
  let shipping_section = document.querySelector(".shipping-info");
  let shipping_message = document.querySelector(".shipping-info>p");
  if (shipment_country && shipment_state) {
    shipping_price.innerHTML = "$ 100";
    shipping_price.classList.remove("text-red-500");
    shipping_price.classList.add("text-brand");
    shipping_section.classList.remove("border-red-500");
    shipping_section.classList.add("border-green-500");
    shipping_message.innerHTML = `
      Shipment to ${country_list[shipment_country]} ${shipment_state} will be charged $100 in addition to your order total. \n Order will be shipped within 3-5 business days.`;
  } else {
    shipping_price.innerHTML = "Select address First";
    shipping_price.classList.remove("text-brand");
    shipping_price.classList.add("text-red-500");
    shipping_section.classList.remove("border-green-500");
    shipping_section.classList.add("border-red-500");
    shipping_message.innerHTML =
      "There are no shipping options available. Please ensure that your address has been entered correctly, or contact us if you need any help.";
  }
  updateCheckOutTotal();
}
function RefreshCountryBoxes() {
  document.querySelectorAll("select[name='country']").forEach((countryBox) => {
    countryBox.addEventListener("change", () => {
      const stateBox = countryBox.parentElement.parentElement.querySelector(
        "select[name='state']",
      );
      create_states_selection(countryBox, stateBox);
    });
  });
}

export function updateCheckOutTotal() {
  if (!document.querySelector(".checkout-container")) return;
  let subtotal = getCartTotal();
  let total = subtotal;
  let country_inputs = document.querySelectorAll("select[name='country']");
  let state_inputs = document.querySelectorAll("select[name='state']");
  let shipment_country = country_inputs[country_inputs.length - 1].value;
  let shipment_state = state_inputs[state_inputs.length - 1].value;
  if (shipment_country && shipment_state) {
    let shipping = 100;
    total += shipping;
  }
  cart_total = total;
  refreshValidation();
  console.log(discount);

  document.querySelector("#subtotal").innerHTML = `$${subtotal.toFixed(2)}`;
  document.querySelector("#total").innerHTML = `<s>$${subtotal.toFixed(2)}</s> $${total.toFixed(2) * discount}`;
  document.querySelector(".toggle-price").innerHTML = `<s>$${subtotal.toFixed(2)}</s> $${total.toFixed(2) * discount}`;
}

function ApplyDiscount() {
  if (!document.querySelector(".checkout-container")) return;
  let code;
  if (document.querySelector(".coupon-section input")) {
    code = document.querySelector(".coupon-section input").value;
  }
  if (code == "iti") {
    discount = 0.9;
    alert("10% discount applied");
  } else {
    discount = 1;
    alert("Invalid code");
  }
  updateCheckOutTotal();
}
