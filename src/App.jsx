import { useEffect, useState } from "react";
import "./index.css";

import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function App() {
  const docRef = doc(db, "game", "stars");

  const [players, setPlayers] = useState([
    { id: "p1", name: "Princess 1", score: 0 },
    { id: "p2", name: "Princess 2", score: 0 },
  ]);

  // 🔄 LIVE SYNC FROM FIREBASE
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

  // ☁️ SAVE TO FIREBASE
  const save = async (newPlayers) => {
    setPlayers(newPlayers);
    await setDoc(docRef, { players: newPlayers });
  };

  const addStar = (id) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, score: p.score + 1 } : p
    );

    save(updated);

    const audio = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
    );
    audio.play().catch(() => {});
  };

  const updateName = (id, value) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, name: value } : p
    );

    save(updated);
  };

  const resetAll = () => {
    if (window.confirm("Reset all stars?")) {
      const updated = players.map((p) => ({
        ...p,
        score: 0,
      }));

      save(updated);
    }
  };

  return (
    <div className="app">
      <h1 className="title">⭐ Sister Stars Live</h1>

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

            <div className="score">{p.score}</div>

            <button
              className="starButton"
              onClick={() => addStar(p.id)}
            >
              ⭐ Give Star
            </button>
          </div>
        ))}
      </div>

      <button className="resetButton" onClick={resetAll}>
        Reset Scores
      </button>
    </div>
  );
}