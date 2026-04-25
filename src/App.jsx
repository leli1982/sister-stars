import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import "./index.css";

import Sparkles from "./Sparkles";

import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function App() {
  const docRef = doc(db, "game", "stars");

  const [soundOn, setSoundOn] = useState(true);
  const [message, setMessage] = useState("");

  const shopItems = [
    { name: "🍭 Candy", cost: 10 },
    { name: "🎨 Sticker Pack", cost: 25 },
    { name: "🧸 Teddy Hug", cost: 40 },
  ];

  const [players, setPlayers] = useState([
    { id: "p1", name: "Princess 1", score: 0, inventory: [] },
    { id: "p2", name: "Princess 2", score: 0, inventory: [] },
  ]);

  const getLevel = (score) => {
    if (score >= 50) return "🪄 Magic Queen";
    if (score >= 25) return "👑 Kind Hero";
    if (score >= 10) return "🌟 Star Friend";
    return "💖 Kind Helper";
  };

  useEffect(() => {
    const unsub = onSnapshot(docRef, (snap) => {
      const data = snap.exists() ? snap.data().players : [];

      const safe = (data || []).map((p) => ({
        id: p.id || crypto.randomUUID(),
        name: p.name || "Player",
        score: p.score || 0,
        inventory: p.inventory || [],
      }));

      setPlayers(safe);
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

        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });

        playSound();

        return { ...p, score: newScore };
      }
      return p;
    });

    save(updated);
  };

  const buyItem = (playerId, item) => {
    const updated = players.map((p) => {
      if (p.id === playerId) {
        if (p.score < item.cost) {
          showMessage("❌ Not enough stars!");
          return p;
        }

        confetti({ particleCount: 120, spread: 100 });
        showMessage(`🎁 Bought ${item.name}!`);

        return {
          ...p,
          score: p.score - item.cost,
          inventory: [...(p.inventory || []), item.name],
        };
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
      save(
        players.map((p) => ({
          ...p,
          score: 0,
          inventory: [],
        }))
      );
    }
  };

  return (
    <div className="app">
      <Sparkles />

      <h1 className="title">🪄 Magic Sister Stars Shop</h1>

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

            <div className="level">{getLevel(p.score)}</div>

            <div className="score">⭐ {p.score}</div>

            <button
              className="starButton"
              onClick={() => addStar(p.id)}
            >
              ⭐ Give Star
            </button>

            <div className="shop">
              {shopItems.map((item, i) => (
                <button
                  key={i}
                  className="shopBtn"
                  onClick={() => buyItem(p.id, item)}
                >
                  Buy {item.name} ({item.cost})
                </button>
              ))}
            </div>

            <div className="inventory">
              {(p.inventory || []).map((i, idx) => (
                <span key={idx} className="item">
                  {i}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="resetButton" onClick={resetAll}>
        Reset
      </button>
    </div>
  );
}