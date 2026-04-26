import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import "./index.css";

import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function App() {
  const docRef = doc(db, "game", "stars");

  const [soundOn, setSoundOn] = useState(true);
  const [message, setMessage] = useState("");
  const [levelUp, setLevelUp] = useState(null);
  const [mysteryReward, setMysteryReward] = useState(null);

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
    { name: "🎁 Mystery Box", cost: 30, mystery: true },
  ];

  const mysteryRewards = [
    "🍦 Ice Cream Treat",
    "🎬 Movie Night",
    "🧁 Cupcake",
    "🎮 Game Time",
    "🧸 Extra Teddy Hug",
    "🌈 Surprise Reward",
    "👑 Princess Choice",
  ];

  const levels = [
    {
      score: 10,
      title: "🌟 Star Friend",
      emoji: "🌟✨💫",
      message: "You are shining bright!",
      color: "#ffb703",
    },
    {
      score: 25,
      title: "👑 Kind Hero",
      emoji: "👑💖✨",
      message: "Your kindness is powerful!",
      color: "#ff4fa3",
    },
    {
      score: 50,
      title: "🪄 Magic Queen",
      emoji: "🪄🌈✨",
      message: "You are full of magic!",
      color: "#8b2be2",
    },
  ];

  const [players, setPlayers] = useState([
    {
      id: "p1",
      name: "Princess 1",
      score: 0,
      inventory: [],
      avatar: "princess.png",
      streak: 0,
      lastStarDate: "",
    },
    {
      id: "p2",
      name: "Princess 2",
      score: 0,
      inventory: [],
      avatar: "fairy.png",
      streak: 0,
      lastStarDate: "",
    },
  ]);

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getYesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  };

  const getStreakBonus = (streak) => {
    if (streak >= 7) return 5;
    if (streak >= 3) return 2;
    if (streak >= 2) return 1;
    return 0;
  };

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
        streak: p.streak || 0,
        lastStarDate: p.lastStarDate || "",
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

  const playLevelUpSound = () => {
    if (!soundOn) return;

    const audio = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
    );

    audio.play().catch(() => {});
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const showLevelUpCelebration = (playerName, level, score) => {
    setLevelUp({
      playerName,
      level,
      score,
    });

    playLevelUpSound();

    confetti({
      particleCount: 300,
      spread: 180,
      origin: { y: 0.55 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 220,
        spread: 200,
        origin: { y: 0.6 },
      });
    }, 500);

    setTimeout(() => {
      confetti({
        particleCount: 180,
        spread: 160,
        origin: { y: 0.45 },
      });
    }, 1000);
  };

  const addStar = (id) => {
    const today = getToday();
    const yesterday = getYesterday();

    const updated = players.map((p) => {
      if (p.id === id) {
        const oldScore = p.score;

        let newStreak = p.streak || 0;
        let bonusStars = 0;

        if (p.lastStarDate !== today) {
          if (p.lastStarDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }

          bonusStars = getStreakBonus(newStreak);
        }

        const newScore = p.score + 1 + bonusStars;

        confetti({
          particleCount: bonusStars > 0 ? 150 : 70,
          spread: bonusStars > 0 ? 120 : 70,
          origin: { y: 0.6 },
        });

        playSound();

        if (bonusStars > 0) {
          showMessage(
            `🔥 ${p.name} has a ${newStreak}-day streak! Bonus +${bonusStars} stars!`
          );
        }

        const unlockedAvatar = avatars.find(
          (avatar) =>
            oldScore < avatar.unlockAt && newScore >= avatar.unlockAt
        );

        const unlockedLevel = levels.find(
          (level) => oldScore < level.score && newScore >= level.score
        );

        if (unlockedLevel) {
          showLevelUpCelebration(p.name, unlockedLevel, newScore);
        } else if (unlockedAvatar && unlockedAvatar.unlockAt > 0) {
          confetti({
            particleCount: 180,
            spread: 120,
            origin: { y: 0.6 },
          });

          showMessage(`🎉 New avatar unlocked: ${unlockedAvatar.label}!`);
        }

        return {
          ...p,
          score: newScore,
          streak: newStreak,
          lastStarDate: today,
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

        if (item.mystery) {
          const reward =
            mysteryRewards[
              Math.floor(Math.random() * mysteryRewards.length)
            ];

          confetti({
            particleCount: 260,
            spread: 180,
            origin: { y: 0.55 },
          });

          playLevelUpSound();

          setMysteryReward({
            playerName: p.name,
            reward,
          });

          return {
            ...p,
            score: p.score - item.cost,
            inventory: [...(p.inventory || []), reward],
          };
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
    if (window.confirm("Reset all stars, rewards, and streaks?")) {
      save(
        players.map((p, index) => ({
          ...p,
          score: 0,
          inventory: [],
          avatar: index === 0 ? "princess.png" : "fairy.png",
          streak: 0,
          lastStarDate: "",
        }))
      );
    }
  };

  return (
    <div className="app">
      {levelUp && (
        <div className="levelUpOverlay">
          <div
            className="levelUpCard"
            style={{ borderColor: levelUp.level.color }}
          >
            <div className="levelUpStars">{levelUp.level.emoji}</div>

            <h2 style={{ color: levelUp.level.color }}>LEVEL UP!</h2>

            <p className="levelUpName">{levelUp.playerName}</p>

            <p className="levelUpTitle">{levelUp.level.title}</p>

            <p className="levelUpScore">{levelUp.level.message}</p>

            <p className="levelUpScore">⭐ {levelUp.score} stars!</p>

            <button
              className="levelUpButton"
              onClick={() => setLevelUp(null)}
              style={{
                background: levelUp.level.color,
                boxShadow: `0 8px 0 rgba(0,0,0,0.25)`,
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {mysteryReward && (
        <div className="levelUpOverlay">
          <div className="levelUpCard" style={{ borderColor: "#ff4fa3" }}>
            <div className="levelUpStars">🎁✨🎉</div>

            <h2 style={{ color: "#ff4fa3" }}>MYSTERY REWARD!</h2>

            <p className="levelUpName">{mysteryReward.playerName}</p>

            <p className="levelUpScore">You opened the magic box and got:</p>

            <p className="levelUpTitle">{mysteryReward.reward}</p>

            <button
              className="levelUpButton"
              onClick={() => setMysteryReward(null)}
              style={{
                background: "#ff4fa3",
                boxShadow: `0 8px 0 rgba(0,0,0,0.25)`,
              }}
            >
              Yay!
            </button>
          </div>
        </div>
      )}

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

              <div className="unlockBox">
                <div className="nextUnlock">
                  🔥 Daily Streak: {p.streak || 0} day
                  {(p.streak || 0) === 1 ? "" : "s"}
                </div>
                <div className="progressText">
                  Day 2 bonus: +1 ⭐ | Day 3 bonus: +2 ⭐ | Day 7 bonus: +5 ⭐
                </div>
              </div>

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