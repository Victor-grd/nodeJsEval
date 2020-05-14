// Page de login ---------------------------------------------

formSwitch = document.querySelectorAll(".form__switch");
form = document.querySelectorAll(".form");
checkbox = document.querySelectorAll("input[type=checkbox]");

formSwitch.forEach((element) => {
  element.addEventListener("click", () => {
    form.forEach((el) => {
      el.classList.toggle("none");
    });
  });
});

checkbox.forEach((el) => {
  el.addEventListener("click", () => {
    el.setAttribute("value", el.checked);
    console.log(el.checked);

    if (el.checked === true) {
      console.log("true test");
      el.setAttribute("value", "true");
    } else {
      console.log("false test");
      el.setAttribute("value", "false");
    }
    console.log(el);
  });
});
