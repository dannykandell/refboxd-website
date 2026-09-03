document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     SCREENSHOT CAROUSEL
     ========================================= */

  const showcase =
    document.getElementById("phone-showcase");

  const phones =
    Array.from(
      document.querySelectorAll(".phone[data-phone]")
    );

  const previousButton =
    document.getElementById("phone-prev");

  const nextButton =
    document.getElementById("phone-next");


  if (
    !showcase ||
    phones.length !== 3
  ) {
    return;
  }


  /*
    Starting order:

    Profile = left
    Feed    = center
    Game    = right
  */

  let order = [
    phones.find(
      (phone) =>
        phone.dataset.phone === "profile"
    ),

    phones.find(
      (phone) =>
        phone.dataset.phone === "feed"
    ),

    phones.find(
      (phone) =>
        phone.dataset.phone === "game"
    ),
  ];


  /* =========================================
     APPLY PHONE POSITIONS
     ========================================= */

  function renderPhones() {

    phones.forEach((phone) => {

      phone.classList.remove(
        "phone-left",
        "phone-center",
        "phone-right"
      );

    });


    order[0].classList.add(
      "phone-left"
    );

    order[1].classList.add(
      "phone-center"
    );

    order[2].classList.add(
      "phone-right"
    );

  }


  /* =========================================
     ROTATION
     ========================================= */

  function nextPhone() {

    order = [
      order[1],
      order[2],
      order[0],
    ];

    renderPhones();

  }


  function previousPhone() {

    order = [
      order[2],
      order[0],
      order[1],
    ];

    renderPhones();

  }


  function bringPhoneToCenter(phone) {

    const index =
      order.indexOf(phone);


    if (index === 0) {

      previousPhone();

    } else if (index === 2) {

      nextPhone();

    }

  }


  /* =========================================
     PHONE CLICK / KEYBOARD
     ========================================= */

  phones.forEach((phone) => {

    phone.addEventListener(
      "click",
      () => {

        bringPhoneToCenter(phone);

        restartAutoRotate();

      }
    );


    phone.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          bringPhoneToCenter(phone);

          restartAutoRotate();

        }

      }
    );

  });


  /* =========================================
     ARROWS
     ========================================= */

  previousButton?.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      previousPhone();

      restartAutoRotate();

    }
  );


  nextButton?.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      nextPhone();

      restartAutoRotate();

    }
  );


  /* =========================================
     AUTO ROTATION
     ========================================= */

  let autoRotate = null;


  function startAutoRotate() {

    stopAutoRotate();

    autoRotate =
      setInterval(
        nextPhone,
        4500
      );

  }


  function stopAutoRotate() {

    if (autoRotate) {

      clearInterval(
        autoRotate
      );

      autoRotate = null;

    }

  }


  function restartAutoRotate() {

    stopAutoRotate();

    startAutoRotate();

  }


  /* Pause while mouse is over screenshots */

  showcase.addEventListener(
    "mouseenter",
    stopAutoRotate
  );


  showcase.addEventListener(
    "mouseleave",
    startAutoRotate
  );


  /* Pause when browser tab isn't visible */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {

        stopAutoRotate();

      } else {

        startAutoRotate();

      }

    }
  );


  /* Initial setup */

  renderPhones();

  startAutoRotate();

});