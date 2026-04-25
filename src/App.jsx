import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import "./index.css";

import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function App() {
  const docRef = doc(db, "game", "stars");

  const [soundOn, setSoundOn] = useState(true);
  const [message, setMessage] = useState("");

  const [players, setPlayers] = useState([
    { id: "p1", name: "Princess 1", score: 0 },
    { id: "p2", name: "Princess 2", score: 0 },
  ]);

  const getLevel = (score) => {
    if (score >= 50) return "🪄 Magic Queen";
    if (score >= 25) return "👑 Kind Hero";
    if (score >= 10) return "🌟 Star Friend";
    return "💖 Kind Helper";
  };

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

  const save = async (data) => {
    setPlayers(data);
    await setDoc(docRef, { players: data });
  };

  const playSound = () => {
    if (!soundOn) return;
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
    );
    audio.play().catch(() => {});
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const addStar = (id) => {
    const updated = players.map((p) => {
      if (p.id === id) {
        const newScore = p.score + 1;

        // 🎉 normal confetti every click
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });

        playSound();

        // 🏆 milestone rewards
        if (newScore === 5) {
          showMessage("🍭 Reward Unlocked: Sweet Beginner!");
        }

        if (newScore === 10) {
          confetti({ particleCount: 150, spread: 90 });
          showMessage("🌟 Reward: Star Badge unlocked!");
        }

        if (newScore === 20) {
          confetti({ particleCount: 180, spread: 110 });
          showMessage("🎁 Reward: Surprise Gift unlocked!");
        }

        if (newScore === 50) {
          confetti({ particleCount: 250, spread: 130 });
          showMessage("🪄 FINAL: MAGIC QUEEN MODE!");
        }

        return { ...p, score: newScore };
      }
      return p;
    });

    save(updated);
  };

  const updateName = (id, value) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, name: value } : p
    );

    save(updated);
  };

  const resetAll = () => {
    if (window.confirm("Reset all stars?")) {
      save(players.map((p) => ({ ...p, score: 0 })));
    }
  };

  return (
    <div className="app">
      <h1 className="title">🪄 Magic Sister Stars</h1>

      <button
        className="soundBtn"
        onClick={() => setSoundOn(!soundOn)}
      >
        🔊 Sound: {soundOn ? "ON" : "OFF"}
      </button>

      {message && <div className="popup">{message}</div>}

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