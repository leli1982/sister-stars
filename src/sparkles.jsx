import { useEffect } from "react";

export default function Sparkles() {
  useEffect(() => {
    const createSparkle = () => {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";

      sparkle.style.left = Math.random() * 100 + "vw";
      sparkle.style.animationDuration = 3 + Math.random() * 5 + "s";

      document.body.appendChild(sparkle);

      setTimeout(() => {
        sparkle.remove();
      }, 8000);
    };

    const interval = setInterval(createSparkle, 300);

    return () => clearInterval(interval);
  }, []);

  return null;
}