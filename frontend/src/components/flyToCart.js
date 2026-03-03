export function flyToCart(fromEl, targetEl) {
  if (!fromEl || !targetEl) return;

  const from = fromEl.getBoundingClientRect();
  const to = targetEl.getBoundingClientRect();

  // вместо копии картинки — маленький "чип"
  const chip = document.createElement("div");
  const size = 14;

  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;

  chip.style.position = "fixed";
  chip.style.left = `${startX}px`;
  chip.style.top = `${startY}px`;
  chip.style.width = `${size}px`;
  chip.style.height = `${size}px`;
  chip.style.borderRadius = "999px";
  chip.style.zIndex = "9999";
  chip.style.pointerEvents = "none";
  chip.style.background = "linear-gradient(135deg, #111827, #4f46e5)";
  chip.style.boxShadow = "0 18px 40px rgba(79, 70, 229, 0.25)";
  chip.style.opacity = "1";
  chip.style.transform = "translate(0,0) scale(1)";
  chip.style.transition =
    "transform 600ms cubic-bezier(.2,.8,.2,1), opacity 600ms ease";

  document.body.appendChild(chip);

  const endX = to.left + to.width / 2 - size / 2;
  const endY = to.top + to.height / 2 - size / 2;

  requestAnimationFrame(() => {
    const dx = endX - startX;
    const dy = endY - startY;
    chip.style.transform = `translate(${dx}px, ${dy}px) scale(0.35)`;
    chip.style.opacity = "0.2";
  });

  chip.addEventListener(
    "transitionend",
    () => {
      chip.remove();
      // bump на бейдже корзины
      targetEl.classList.add("cartBadge--bump");
      setTimeout(() => targetEl.classList.remove("cartBadge--bump"), 220);
    },
    { once: true }
  );
}