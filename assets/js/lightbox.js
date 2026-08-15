/*
 * A very small lightbox. No dependencies.
 *
 * Progressive enhancement: each gallery photo is a plain link to the image
 * file, so with JavaScript off (or broken) clicking still opens the photo.
 * This script intercepts the click and shows it in an overlay instead.
 */
(function () {
  "use strict";

  var links = Array.prototype.slice.call(
    document.querySelectorAll("[data-lightbox]")
  );
  if (!links.length) return;

  var index = 0;
  var lastFocused = null;

  // Build the overlay once, up front.
  var box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Photo viewer");
  box.innerHTML =
    '<button class="lightbox__btn lightbox__btn--close" type="button" aria-label="Close">&times;</button>' +
    '<button class="lightbox__btn lightbox__btn--prev"  type="button" aria-label="Previous photo">&#8249;</button>' +
    '<button class="lightbox__btn lightbox__btn--next"  type="button" aria-label="Next photo">&#8250;</button>' +
    '<img class="lightbox__img" alt="">' +
    '<p class="lightbox__caption"></p>' +
    '<span class="lightbox__count"></span>';
  document.body.appendChild(box);

  var img = box.querySelector(".lightbox__img");
  var caption = box.querySelector(".lightbox__caption");
  var count = box.querySelector(".lightbox__count");
  var closeBtn = box.querySelector(".lightbox__btn--close");
  var prevBtn = box.querySelector(".lightbox__btn--prev");
  var nextBtn = box.querySelector(".lightbox__btn--next");

  // A single photo needs no arrows.
  if (links.length < 2) {
    prevBtn.hidden = true;
    nextBtn.hidden = true;
  }

  function show(i) {
    index = (i + links.length) % links.length; // wraps at both ends
    var link = links[index];
    var inner = link.querySelector("img");

    img.src = link.getAttribute("href");
    img.alt = inner ? inner.alt : "";
    caption.textContent = link.getAttribute("data-caption") || "";
    count.textContent = index + 1 + " of " + links.length;
  }

  function open(i, trigger) {
    lastFocused = trigger || document.activeElement;
    show(i);
    box.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    closeBtn.focus();
  }

  function close() {
    box.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    // Send focus back where it came from, so keyboard users don't lose place.
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function isOpen() {
    return box.classList.contains("is-open");
  }

  links.forEach(function (link, i) {
    link.addEventListener("click", function (event) {
      // Let modified clicks (new tab, save-as) behave normally.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(i, link);
    });
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () { show(index - 1); });
  nextBtn.addEventListener("click", function () { show(index + 1); });

  // Clicking the backdrop (but not the photo or a button) closes it.
  box.addEventListener("click", function (event) {
    if (event.target === box) close();
  });

  document.addEventListener("keydown", function (event) {
    if (!isOpen()) return;

    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowRight") {
      show(index + 1);
    } else if (event.key === "ArrowLeft") {
      show(index - 1);
    } else if (event.key === "Tab") {
      // Keep Tab inside the dialog while it is open.
      var stops = [closeBtn, prevBtn, nextBtn].filter(function (b) {
        return !b.hidden;
      });
      var at = stops.indexOf(document.activeElement);
      var next = event.shiftKey ? at - 1 : at + 1;
      event.preventDefault();
      stops[(next + stops.length) % stops.length].focus();
    }
  });
})();
