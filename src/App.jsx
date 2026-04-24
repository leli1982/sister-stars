import { useState } from "react";
import confetti from "canvas-confetti";

export default function App() {
  const [scores, setScores] = useState({ sister1: 0, sister2: 0 });

  const addStar = (key) => {
    setScores((prev) => ({
      ...prev,
      [key]: prev[key] + 1,
    }));

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    alert("⭐ Star added!");
  };

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h1>⭐ Sister Stars</h1>

      {["sister1", "sister2"].map((key) => (
        <div
          key={key}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            marginBottom: 20,
            borderRadius: 10,
          }}
        >
          <h2>{key}</h2>

          <div style={{ fontSize: 40 }}>{scores[key]}</div>

          <button onClick={() => addStar(key)}>
            +1 Star ⭐
          </button>
        </div>
      ))}
    </div>
  );
}