import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import "./index.css";

import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function App() {
  const docRef = doc(db, "game", "stars");

  const [players, setPlayers] = useState([
    { id: "p1", name: "Princess 1", score: 0 },
    { id: "p2", name: "Princess 2", score: 0 },
  ]);

  // 💖 Levels system
  const getLevel = (score) => {
    if (score >= 50) return "🪄 Magic Queen";
    if (score >= 25) return "👑 Kind Hero";
    if (score >= 10) return "🌟 Star Friend";
    return "💖 Kind Helper";
  };

  // 🔄 Firebase sync
  useEffect(() => {
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setPlayers(snap.data().players);
      } else {
        setDoc(docRef, { players });
      }
    });

    return () => unsub();
  }, []);

  // ☁️ Save to Firebase
  const save = async (data) => {
    setPlayers(data);
    await setDoc(docRef, { players: data });
  };

  // 🎉 Add star + confetti
  const addStar = (id) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, score: p.score + 1 } : p
    );

    save(updated);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // ✏️ Rename player
  const updateName = (id, value) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, name: value } : p
    );

    save(updated);
  };

  // 🔄 Reset
  const resetAll = () => {
    if (window.confirm("Reset all stars?")) {
      const reset = players.map((p) => ({
        ...p,
        score: 0,
      }));

      save(reset);
    }
  };

  return (
    <div className="app">
      <h1 className="title">🪄 Sister Stars Magic Mode</h1>

      <div className="grid">
        {players.map((p) => (
          <div className="card" key={p.id}>
            <input
              className="nameInput"
              value={p.name}
              onChange={(e) =>
                updateName(p.id, e.target.value)
              }
            />

            <div className="level">
              {getLevel(p.score)}
            </div>

            <div className="score">{p.score}</div>

            <button
              className="starButton"
              onClick={() => addStar(p.id)}
            >
              ⭐ Give Magic Star
            </button>
          </div>
        ))}
      </div>

      <button className="resetButton" onClick={resetAll}>
        Reset
      </button>
    </div>
  );
}