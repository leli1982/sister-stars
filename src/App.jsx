import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import "./index.css";

import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function App() {
  const docRef = doc(db, "game", "stars");

  const PARENT_PIN = "1234";

  const [soundOn, setSoundOn] = useState(true);
  const [message, setMessage] = useState("");
  const [levelUp, setLevelUp] = useState(null);
  const [mysteryReward, setMysteryReward] = useState(null);
  const [dailyReward, setDailyReward] = useState(null);
  const [petCelebration, setPetCelebration] = useState(null);
  const [parentMode, setParentMode] = useState(false);
  const [showPinBox, setShowPinBox] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [currentChildId, setCurrentChildId] = useState(
    localStorage.getItem("magicSisterCurrentChild") || ""
  );

  const avatars = [
    { label: "Princess", value: "princess.png", unlockAt: 0 },
    { label: "Fairy", value: "fairy.png", unlockAt: 0 },
    { label: "Unicorn", value: "unicorn.png", unlockAt: 10 },
    { label: "Mermaid", value: "mermaid.png", unlockAt: 20 },
    { label: "Hero", value: "hero.png", unlockAt: 30 },
    { label: "Cat", value: "cat.png", unlockAt: 40 },
  ];

  const pets = [
    { label: "Baby Dragon", value: "dragon", egg: "🥚", baby: "🐣", growing: "🐉", magic: "🐲" },
    { label: "Mini Unicorn", value: "unicorn", egg: "🥚", baby: "🦄", growing: "🦄✨", magic: "🌈🦄" },
    { label: "Magic Kitty", value: "kitty", egg: "🥚", baby: "🐱", growing: "😺✨", magic: "🐈‍⬛🌙" },
    { label: "Moon Bunny", value: "bunny", egg: "🥚", baby: "🐰", growing: "🐇✨", magic: "🌙🐰" },
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

  const wheelRewards = [
    { label: "⭐ +3 Stars", stars: 3, item: null },
    { label: "⭐ +5 Stars", stars: 5, item: null },
    { label: "⭐ +10 Stars", stars: 10, item: null },
    { label: "🍭 Candy Bonus", stars: 0, item: "🍭 Candy Bonus" },
    { label: "🎨 Sticker Bonus", stars: 0, item: "🎨 Sticker Bonus" },
    { label: "🧸 Teddy Bonus", stars: 0, item: "🧸 Teddy Bonus" },
    { label: "🌈 Rainbow Jackpot +15 Stars", stars: 15, item: "🌈 Rainbow Jackpot" },
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
      lastSpinDate: "",
      pet: "dragon",
      petHappiness: 60,
    },
    {
      id: "p2",
      name: "Princess 2",
      score: 0,
      inventory: [],
      avatar: "fairy.png",
      streak: 0,
      lastStarDate: "",
      lastSpinDate: "",
      pet: "unicorn",
      petHappiness: 60,
    },
  ]);

  const getToday = () => new Date().toISOString().split("T")[0];

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

  const getPetStage = (score) => {
    if (score >= 50) return "Magical";
    if (score >= 25) return "Growing";
    if (score >= 10) return "Baby";
    return "Egg";
  };

  const getPetEmoji = (petValue, score) => {
    const pet = pets.find((item) => item.value === petValue) || pets[0];

    if (score >= 50) return pet.magic;
    if (score >= 25) return pet.growing;
    if (score >= 10) return pet.baby;
    return pet.egg;
  };

  const getPetName = (petValue) => {
    const pet = pets.find((item) => item.value === petValue);
    return pet ? pet.label : "Baby Dragon";
  };

  const getAvatarAnimationClass = (score) => {
    if (score >= 50) return "avatar avatarMagic";
    if (score >= 25) return "avatar avatarRoyal";
    if (score >= 10) return "avatar avatarStar";
    return "avatar avatarFloat";
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

  const chooseCurrentChild = (id) => {
    setCurrentChildId(id);
    localStorage.setItem("magicSisterCurrentChild", id);
    showMessage("✅ This tablet is now set");
  };

  const canGiveStarTo = (playerId) => {
    if (parentMode) return true;
    if (!currentChildId) return false;
    return currentChildId !== playerId;
  };

  const getGiveStarButtonText = (playerId) => {
    if (parentMode) return "⭐ Give Star";
    if (!currentChildId) return "🔒 Choose who is using this tablet";
    if (currentChildId === playerId) return "💖 Stars must come from sister";
    return "⭐ Give Star";
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
        lastSpinDate: p.lastSpinDate || "",
        pet: p.pet || (index === 0 ? "dragon" : "unicorn"),
        petHappiness:
          typeof p.petHappiness === "number" ? p.petHappiness : 60,
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

  const unlockParentMode = () => {
    if (pinInput === PARENT_PIN) {
      setParentMode(true);
      setShowPinBox(false);
      setPinInput("");
      showMessage("🔓 Parent Mode unlocked");
    } else {
      setPinInput("");
      showMessage("❌ Wrong PIN");
    }
  };

  const lockParentMode = () => {
    setParentMode(false);
    setShowPinBox(false);
    setPinInput("");
    showMessage("🔒 Parent Mode locked");
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

  const checkUnlocks = (playerName, oldScore, newScore, petValue) => {
    const unlockedAvatar = avatars.find(
      (avatar) =>
        oldScore < avatar.unlockAt && newScore >= avatar.unlockAt
    );

    const unlockedLevel = levels.find(
      (level) => oldScore < level.score && newScore >= level.score
    );

    const oldPetStage = getPetStage(oldScore);
    const newPetStage = getPetStage(newScore);

    if (unlockedLevel) {
      showLevelUpCelebration(playerName, unlockedLevel, newScore);
    } else if (unlockedAvatar && unlockedAvatar.unlockAt > 0) {
      confetti({
        particleCount: 180,
        spread: 120,
        origin: { y: 0.6 },
      });

      showMessage(`🎉 New avatar unlocked: ${unlockedAvatar.label}!`);
    }

    if (oldPetStage !== newPetStage) {
      setPetCelebration({
        playerName,
        petName: getPetName(petValue),
        petEmoji: getPetEmoji(petValue, newScore),
        stage: newPetStage,
      });

      confetti({
        particleCount: 260,
        spread: 180,
        origin: { y: 0.55 },
      });

      playLevelUpSound();
    }
  };

  const spinDailyWheel = (id) => {
    const today = getToday();

    const updated = players.map((p) => {
      if (p.id !== id) return p;

      if (p.lastSpinDate === today) {
        showMessage("🎡 Daily wheel already used today!");
        return p;
      }

      const reward =
        wheelRewards[Math.floor(Math.random() * wheelRewards.length)];

      const oldScore = p.score;
      const newScore = p.score + reward.stars;
      const newInventory = reward.item
        ? [...(p.inventory || []), reward.item]
        : p.inventory || [];

      setDailyReward({
        playerName: p.name,
        reward: reward.label,
      });

      playLevelUpSound();

      confetti({
        particleCount: reward.stars >= 15 ? 320 : 220,
        spread: reward.stars >= 15 ? 200 : 160,
        origin: { y: 0.55 },
      });

      checkUnlocks(p.name, oldScore, newScore, p.pet);

      return {
        ...p,
        score: newScore,
        inventory: newInventory,
        petHappiness: Math.min((p.petHappiness || 60) + 5, 100),
        lastSpinDate: today,
      };
    });

    save(updated);
  };

  const addStar = (id) => {
    if (!canGiveStarTo(id)) {
      if (!currentChildId) {
        showMessage("🔒 First choose who is using this tablet");
      } else {
        showMessage("💖 You can only give stars to your sister");
      }
      return;
    }

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

        checkUnlocks(p.name, oldScore, newScore, p.pet);

        return {
          ...p,
          score: newScore,
          streak: newStreak,
          lastStarDate: today,
          petHappiness: Math.min((p.petHappiness || 60) + 2, 100),
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

  const updatePet = (id, value) => {
    const updated = players.map((p) =>
      p.id === id ? { ...p, pet: value } : p
    );

    save(updated);
  };

  const feedPet = (id) => {
    const updated = players.map((p) => {
      if (p.id !== id) return p;

      if (p.score < 5) {
        showMessage("❌ Need 5 stars to feed pet!");
        return p;
      }

      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
      });

      playSound();

      setPetCelebration({
        playerName: p.name,
        petName: getPetName(p.pet),
        petEmoji: getPetEmoji(p.pet, p.score),
        stage: "Happy",
      });

      return {
        ...p,
        score: p.score - 5,
        petHappiness: Math.min((p.petHappiness || 60) + 20, 100),
      };
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
    if (!parentMode) {
      showMessage("🔒 Parent Mode required");
      return;
    }

    if (
      window.confirm(
        "Reset all stars, rewards, streaks, daily spins, and pets?"
      )
    ) {
      save(
        players.map((p, index) => ({
          ...p,
          score: 0,
          inventory: [],
          avatar: index === 0 ? "princess.png" : "fairy.png",
          streak: 0,
          lastStarDate: "",
          lastSpinDate: "",
          pet: index === 0 ? "dragon" : "unicorn",
          petHappiness: 60,
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

      {dailyReward && (
        <div className="levelUpOverlay">
          <div className="levelUpCard" style={{ borderColor: "#ffb703" }}>
            <div className="levelUpStars">🎡✨🎁</div>

            <h2 style={{ color: "#ffb703" }}>DAILY WHEEL!</h2>

            <p className="levelUpName">{dailyReward.playerName}</p>

            <p className="levelUpScore">The magic wheel landed on:</p>

            <p className="levelUpTitle">{dailyReward.reward}</p>

            <button
              className="levelUpButton"
              onClick={() => setDailyReward(null)}
              style={{
                background: "#ffb703",
                boxShadow: `0 8px 0 rgba(0,0,0,0.25)`,
              }}
            >
              Amazing!
            </button>
          </div>
        </div>
      )}

      {petCelebration && (
        <div className="levelUpOverlay">
          <div className="levelUpCard" style={{ borderColor: "#8b2be2" }}>
            <div className="levelUpStars">{petCelebration.petEmoji}</div>

            <h2 style={{ color: "#8b2be2" }}>MAGICAL PET!</h2>

            <p className="levelUpName">{petCelebration.playerName}</p>

            <p className="levelUpScore">
              {petCelebration.petName} is now:
            </p>

            <p className="levelUpTitle">{petCelebration.stage}</p>

            <button
              className="levelUpButton"
              onClick={() => setPetCelebration(null)}
              style={{
                background: "#8b2be2",
                boxShadow: `0 8px 0 rgba(0,0,0,0.25)`,
              }}
            >
              Cute!
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

      <button
        className="soundBtn"
        onClick={() => {
          if (parentMode) {
            lockParentMode();
          } else {
            setShowPinBox(true);
          }
        }}
      >
        {parentMode ? "🔒 Lock Parent Mode" : "🔐 Parent Mode"}
      </button>

      {showPinBox && !parentMode && (
        <div className="parentBox">
          <div className="nextUnlock">Enter Parent PIN</div>

          <input
            className="nameInput"
            type="password"
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="PIN"
          />

          <div className="parentButtons">
            <button className="shopBtn" onClick={unlockParentMode}>
              Unlock
            </button>

            <button
              className="shopBtn"
              onClick={() => {
                setShowPinBox(false);
                setPinInput("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="parentBox">
        <div className="nextUnlock">Who is using this tablet?</div>

        <select
          className="avatarSelect"
          value={currentChildId}
          onChange={(e) => chooseCurrentChild(e.target.value)}
        >
          <option value="">Choose child</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="progressText">
          {parentMode
            ? "Parent Mode can give stars to anyone."
            : currentChildId
            ? "This child can only give stars to her sister."
            : "Choose a child before giving stars."}
        </div>
      </div>

      {message && <div className="popup">{message}</div>}

      <div className="grid">
        {players.map((p) => {
          const availableAvatars = getAvailableAvatars(p.score);
          const nextUnlock = getNextAvatarUnlock(p.score);
          const progress = getProgressToNextAvatar(p.score);
          const today = getToday();
          const wheelUsedToday = p.lastSpinDate === today;
          const giveStarAllowed = canGiveStarTo(p.id);

          return (
            <div className="card" key={p.id}>
              <div className="avatarWrap">
                <img
                  className={getAvatarAnimationClass(p.score)}
                  src={`/avatars/${p.avatar || "princess.png"}`}
                  alt={`${p.name} avatar`}
                />
                <div className="avatarSparkles">✨ ✨ ✨</div>
              </div>

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

              <div className="petBox">
                <div className="petEmoji">
                  {getPetEmoji(p.pet, p.score)}
                </div>

                <div className="nextUnlock">
                  🐾 {getPetName(p.pet)} — {getPetStage(p.score)}
                </div>

                <select
                  className="avatarSelect"
                  value={p.pet || "dragon"}
                  onChange={(e) => updatePet(p.id, e.target.value)}
                >
                  {pets.map((pet) => (
                    <option key={pet.value} value={pet.value}>
                      {pet.label}
                    </option>
                  ))}
                </select>

                <div className="progressOuter">
                  <div
                    className="petHappinessInner"
                    style={{ width: `${p.petHappiness || 0}%` }}
                  />
                </div>

                <div className="progressText">
                  Happiness: {p.petHappiness || 0}%
                </div>

                <button
                  className="shopBtn"
                  onClick={() => feedPet(p.id)}
                  style={{ marginTop: "10px" }}
                >
                  🍎 Feed Pet (5 ⭐)
                </button>
              </div>

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
                disabled={!giveStarAllowed}
                style={{
                  opacity: giveStarAllowed ? 1 : 0.5,
                  cursor: giveStarAllowed ? "pointer" : "not-allowed",
                }}
              >
                {getGiveStarButtonText(p.id)}
              </button>

              <div className="unlockBox">
                <div className="nextUnlock">🎡 Daily Reward Wheel</div>
                <div className="progressText">
                  {wheelUsedToday
                    ? "Come back tomorrow for another spin!"
                    : "One free spin available today!"}
                </div>

                <button
                  className="shopBtn"
                  onClick={() => spinDailyWheel(p.id)}
                  disabled={wheelUsedToday}
                  style={{
                    opacity: wheelUsedToday ? 0.5 : 1,
                    cursor: wheelUsedToday ? "not-allowed" : "pointer",
                    marginTop: "10px",
                  }}
                >
                  {wheelUsedToday ? "🎡 Already Spun Today" : "🎡 Spin Wheel"}
                </button>
              </div>

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

      {parentMode && (
        <button className="resetButton" onClick={resetAll}>
          Reset
        </button>
      )}
    </div>
  );
}