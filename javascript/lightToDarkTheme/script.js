const swapThemeBtn = document.querySelector(".swap-theme-btn");

swapThemeBtn.addEventListener("click", (e) => {
  //   console.log(e.target);
  document.body.classList.toggle("dark-mode");
});
