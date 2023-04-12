//  Preloader
jQuery(window).on("load", function () {
  $("#preloader").fadeOut(500);
  $("#main-wrapper").addClass("show");
});

(function ($) {
  "use strict";

  //to keep the current page active
  $(function () {
    for (
      var nk = window.location,
        o = $(".settings-menu a, .menu a")
          .filter(function () {
            return nk.href.includes(this.href);
          })
          .addClass("active")
          .parent()
          .addClass("active");
      ;

    ) {
      // console.log(o)
      if (!o.is("li")) break;
      o = o.parent().addClass("show").parent().addClass("active");
    }
    if (window.location.pathname.includes("setting")) {
      $("#settings").addClass("active");
    }
  });

  //   $('[data-toggle="tooltip"]').tooltip();
})(jQuery);

(function () {
  const date = document.getElementById("year");
  if (date) {
    date.innerText = new Date().getFullYear();
  }
})();
(function () {
  const aTag = document.querySelectorAll("[href='#']");
  for (let i = 0; i < aTag.length; i++) {
    const a = aTag[i];
    a.addEventListener("click", (e) => {
      e.preventDefault();
    });
  }
})();

// Copy
// Copy
function copy() {
  /* Get the text field */
  var copyText = document.getElementById("myInput");

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  navigator.clipboard.writeText(copyText.value);

  /* Alert the copied text */
  alert("Copied the text: " + copyText.value);
}
