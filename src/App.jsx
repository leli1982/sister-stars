import { useState, useEffect } from "react";
import "./index.css";

export default function App() {
  const [players, setPlayers] = useState([
    { id: "p1", name: "Princess 1", score: 0 },
    { id: "p2", name: "Princess 2", score: 0 },
  ]);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("sisterStarsMagic");
    if (saved) setPlayers(JSON.parse(saved));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem("sisterStarsMagic", JSON.stringify(players));
  }, [players]);

  const getLevel = (score) => {
    if (score >= 50) return "👑 Queen";
    if (score >= 20) return "🌟 Hero";
    if (score >= 10) return "✨ Star";
    return "💖 Kind";
  };

  const addStar = (id) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, score: p.score + 1 } : p
      )
    );

    // magical sound
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/ambiences/magical_chime.ogg"
    );
    audio.play().catch(() => {});

    // pop animation
    const el = document.getElementById(id);
    if (el) {
      el.classList.add("pop");
      setTimeout(() => el.classList.remove("pop"), 300);
    }

    createSparkle();
  };

  const updateName = (id, newName) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: newName } : p
      )
    );
  };

  // ✨ sparkles
  const createSparkle = () => {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = Math.random() * 100 + "vw";
    sparkle.style.top = Math.random() * 100 + "vh";
    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 1000);
  };

  return (
    <div className="app">
      <h1 className="title">🪄 Sister Stars Magic</h1>

      {players.map((p) => (
        <div key={p.id} id={p.id} className="card">
          <input
            className="nameInput"
            value={p.name}
            onChange={(e) => updateName(p.id, e.target.value)}
          />

          <div className="score">{p.score}</div>

          <div className="level">{getLevel(p.score)}</div>

          <button className="button" onClick={() => addStar(p.id)}>
            ✨ Give Magic Star ✨
          </button>
        </div>
      ))}
    </div>
  );
}