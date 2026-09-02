document.addEventListener("DOMContentLoaded", () => {
  const appStoreButtons = [
    document.getElementById("app-store-link"),
    document.getElementById("bottom-app-store-link"),
  ];

  appStoreButtons.forEach((button) => {
    if (!button) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();

      // We'll replace this with the real RefBox'd App Store URL.
      console.log("RefBox'd App Store link coming soon.");
    });
  });
});