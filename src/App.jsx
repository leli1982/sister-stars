import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import "./index.css";

import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function App() {
  const docRef = doc(db, "game", "stars");

  const [soundOn, setSoundOn] = useState(true);
  const [message, setMessage] = useState("");

  const avatars = [
    { label: "Princess", value: "princess.png", unlockAt: 0 },
    { label: "Fairy", value: "fairy.png", unlockAt: 0 },
    { label: "Unicorn", value: "unicorn.png", unlockAt: 10 },
    { label: "Mermaid", value: "mermaid.png", unlockAt: 20 },
    { label: "Hero", value: "hero.png", unlockAt: 30 },
    { label: "Cat", value: "cat.png", unlockAt: 40 },
  ];

  const shopItems = [
    { name: "🍭 Candy", cost: 10 },
    { name: "🎨 Sticker Pack", cost: 25 },
    { name: "🧸 Teddy Hug", cost: 40 },
  ];

  const [players, setPlayers] = useState([
    {
      id: "p1",
      name: "Princess 1",
      score: 0,
      inventory: [],
      avatar: "princess.png",
    },
    {
      id: "p2",
      name: "Princess 2",
      score: 0,
      inventory: [],
      avatar: "fairy.png",
    },
  ]);

  const getLevel = (score) => {
    if (score >= 50) return "🪄 Magic Queen";
    if (score >= 25) return "👑 Kind Hero";
    if (score >= 10) return "🌟 Star Friend";
    return "💖 Kind Helper";
  };

  const getAvailableAvatars = (score) => {
    return avatars.filter((avatar) => score >= avatar.unlockAt);
  };

  const getNextAvatarUnlock = (score) => {
    return avatars.find((avatar) => score < avatar.unlockAt);
  };

  const getPreviousUnlock = (score) => {
    const unlocked = avatars
      .filter((avatar) => score >= avatar.unlockAt)
      .map((avatar) => avatar.unlockAt);

    return Math.max(...unlocked, 0);
  };

  const getProgressToNextAvatar = (score) => {
    const next = getNextAvatarUnlock(score);

    if (!next) return 100;

    const previous = getPreviousUnlock(score);
    const progress =
      ((score - previous) / (next.unlockAt - previous)) * 100;

    return Math.min(Math.max(progress, 0), 100);
  };

  useEffect(() => {
    const unsub = onSnapshot(docRef, (snap) => {
      const data = snap.exists() ? snap.data().players : [];

      const safePlayers = (data || []).map((p, index) => ({
        id: p.id || `p${index + 1}`,
        name: p.name || `Princess ${index + 1}`,
        score: p.score || 0,
        inventory: p.inventory || [],
        avatar:
          p.avatar ||
          (index === 0 ? "princess.png" : "fairy.png"),
      }));

      if (safePlayers.length > 0) {
        setPlayers(safePlayers);
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

        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });

        playSound();

        const unlockedAvatar = avatars.find(
          (avatar) => avatar.unlockAt === newScore
        );

        if (unlockedAvatar && unlockedAvatar.unlockAt > 0) {
          confetti({
            particleCount: 180,
            spread: 120,
            origin: { y: 0.6 },
          });

          showMessage(`🎉 New avatar unlocked: ${unlockedAvatar.label}!`);
        } else if (newScore === 10) {
          showMessage("🌟 10 Stars! Star Friend unlocked!");
        } else if (newScore === 25) {
          showMessage("👑 25 Stars! Kind Hero unlocked!");
        } else if (newScore === 50) {
          showMessage("🪄 50 Stars! Magic Queen unlocked!");
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

  const updateAvatar = (id, value) => {
    const updated = players.map((p) => {
      if (p.id !== id) return p;

      const avatar = avatars.find((a) => a.value === value);

      if (!avatar || p.score < avatar.unlockAt) {
        showMessage("🔒 Avatar locked!");
        return p;
      }

      return { ...p, avatar: value };
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

        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.6 },
        });

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

  const resetAll = () => {
    if (window.confirm("Reset all stars and rewards?")) {
      save(
        players.map((p, index) => ({
          ...p,
          score: 0,
          inventory: [],
          avatar: index === 0 ? "princess.png" : "fairy.png",
        }))
      );
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
        {players.map((p) => {
          const availableAvatars = getAvailableAvatars(p.score);
          const nextUnlock = getNextAvatarUnlock(p.score);
          const progress = getProgressToNextAvatar(p.score);

          return (
            <div className="card" key={p.id}>
              <img
                className="avatar"
                src={`/avatars/${p.avatar || "princess.png"}`}
                alt={`${p.name} avatar`}
              />

              <select
                className="avatarSelect"
                value={p.avatar || "princess.png"}
                onChange={(e) => updateAvatar(p.id, e.target.value)}
              >
                {availableAvatars.map((avatar) => (
                  <option key={avatar.value} value={avatar.value}>
                    {avatar.label}
                  </option>
                ))}
              </select>

              {nextUnlock ? (
                <div className="unlockBox">
                  <div className="nextUnlock">
                    🔒 Next avatar: {nextUnlock.label} at{" "}
                    {nextUnlock.unlockAt} stars
                  </div>

                  <div className="progressOuter">
                    <div
                      className="progressInner"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="progressText">
                    {p.score} / {nextUnlock.unlockAt} stars
                  </div>
                </div>
              ) : (
                <div className="unlockBox">
                  <div className="nextUnlock">🎉 All avatars unlocked!</div>
                  <div className="progressOuter">
                    <div className="progressInner" style={{ width: "100%" }} />
                  </div>
                </div>
              )}

              <input
                className="nameInput"
                value={p.name}
                onChange={(e) => updateName(p.id, e.target.value)}
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
                {(p.inventory || []).map((item, index) => (
                  <span key={index} className="item">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button className="resetButton" onClick={resetAll}>
        Reset
      </button>
    </div>
  );
}