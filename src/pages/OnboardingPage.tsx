
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { createProfile } from "@/lib/store";
import { placementRecommendation } from "@/lib/adaptive";
import { Button } from "@/components/ui/Button";
import { shuffleStringOptions } from "@/lib/shuffle-options";

const AVATARS = ["🧙", "🦉", "⚡", "🪄", "📚", "🦁"];
const HOUSES = [
  { id: "gryffindor" as const, name: "Gryffindor", emoji: "🦁" },
  { id: "hufflepuff" as const, name: "Hufflepuff", emoji: "🦡" },
  { id: "ravenclaw" as const, name: "Ravenclaw", emoji: "🦅" },
  { id: "slytherin" as const, name: "Slytherin", emoji: "🐍" },
];

const PLACEMENT_VOCAB = [
  { word: "whisper", correct: "speak quietly", options: ["speak quietly", "run fast", "eat lunch"] },
  { word: "survive", correct: "stay alive", options: ["stay alive", "fall asleep", "write a letter"] },
  { word: "peculiar", correct: "strange", options: ["strange", "delicious", "tiny"] },
];

const PLACEMENT_COMP = [
  {
    stem: "If someone is 'grateful', they feel —",
    correct: "thankful",
    options: ["thankful", "angry", "hungry"],
  },
  {
    stem: "A 'cupboard' is a small place to —",
    correct: "store things",
    options: ["store things", "fly broomsticks", "cast spells"],
  },
];

type Step = "welcome" | "profile" | "placement" | "consent" | "done";

export function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdditional = searchParams.get("mode") === "additional";
  const { addLearner, learners } = useApp();
  const [step, setStep] = useState<Step>(isAdditional ? "profile" : "welcome");
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [house, setHouse] = useState<typeof HOUSES[number]["id"]>("gryffindor");
  const [placementIndex, setPlacementIndex] = useState(0);
  const [vocabScore, setVocabScore] = useState(0);
  const [compScore, setCompScore] = useState(0);
  const [parentConsent, setParentConsent] = useState(false);

  useEffect(() => {
    if (isAdditional && learners.length > 0 && step === "welcome") {
      setStep("profile");
    }
  }, [isAdditional, learners.length, step]);

  const finishOnboarding = () => {
    const vocabRate = vocabScore / PLACEMENT_VOCAB.length;
    const compRate = compScore / PLACEMENT_COMP.length;
    const rec = placementRecommendation(vocabRate, compRate);

    const profile = createProfile(nickname, avatar, house);
    addLearner(profile, { lexile: rec.lexile, startChapter: rec.chapter });

    navigate("/");
  };

  if (step === "welcome") {
    return (
      <div className="space-y-6 text-center">
        <div className="text-6xl">📚</div>
        <h1 className="text-4xl font-bold text-burgundy">SpellRead</h1>
        <p className="text-lg text-ink-muted">
          Read the book you love. Master every chapter.
        </p>
        <div className="parchment-card p-4 text-left text-sm">
          <p className="font-semibold">Bring your own book</p>
          <p className="mt-1 text-ink-muted">
            SpellRead helps you preview words and take quizzes. You read Harry Potter in your own copy — we never show the full chapter text.
          </p>
        </div>
        <Button onClick={() => setStep("profile")} className="w-full">
          Get Started
        </Button>
      </div>
    );
  }

  if (step === "profile") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          {isAdditional ? "Add a New Learner" : "Create Your Profile"}
        </h1>
        {isAdditional && (
          <p className="text-sm text-ink-muted">
            They will start from Chapter 1 with a fresh progress map — no data is copied from other learners.
          </p>
        )}

        <div>
          <label className="mb-2 block font-medium">Pick an avatar</label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`rounded-xl p-3 text-3xl ${avatar === a ? "bg-gold/30 ring-2 ring-gold" : "bg-white/50"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="nickname" className="mb-2 block font-medium">Nickname</label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-xl border-2 border-parchment-dark bg-white/50 px-4 py-3 text-lg"
            placeholder="e.g. HarryFan"
            maxLength={20}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Choose your house</label>
          <div className="grid grid-cols-2 gap-2">
            {HOUSES.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHouse(h.id)}
                className={`rounded-xl p-3 text-left ${house === h.id ? "bg-burgundy/10 ring-2 ring-burgundy" : "bg-white/50"}`}
              >
                {h.emoji} {h.name}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setStep("placement")}
          disabled={!nickname.trim()}
          className="w-full"
        >
          Next: Reading Check →
        </Button>
      </div>
    );
  }

  if (step === "placement") {
    const isVocab = placementIndex < PLACEMENT_VOCAB.length;
    const item = isVocab
      ? PLACEMENT_VOCAB[placementIndex]
      : PLACEMENT_COMP[placementIndex - PLACEMENT_VOCAB.length];

    const shuffledOptions = shuffleStringOptions(
      item.correct,
      item.options,
      placementIndex * 997 + 42,
    );

    const handleAnswer = (answer: string) => {
      if (answer === item.correct) {
        if (isVocab) setVocabScore((s) => s + 1);
        else setCompScore((s) => s + 1);
      }

      if (placementIndex < PLACEMENT_VOCAB.length + PLACEMENT_COMP.length - 1) {
        setPlacementIndex((i) => i + 1);
      } else {
        setStep("consent");
      }
    };

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reading Placement</h1>
        <p className="text-ink-muted">
          Question {placementIndex + 1} of {PLACEMENT_VOCAB.length + PLACEMENT_COMP.length}
        </p>

        <div className="parchment-card p-6">
          <h2 className="mb-4 text-xl">
            {isVocab ? `What does "${(item as typeof PLACEMENT_VOCAB[0]).word}" mean?` : (item as typeof PLACEMENT_COMP[0]).stem}
          </h2>
          <div className="space-y-3">
            {shuffledOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleAnswer(opt)}
                className="w-full rounded-xl border-2 border-parchment-dark bg-white/50 px-4 py-3 text-left text-lg hover:border-gold"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "consent") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Almost Done!</h1>
        <div className="parchment-card p-4 text-sm">
          <p>
            SpellRead stores your progress on this device only. We collect a nickname and avatar — no real name required.
          </p>
          <p className="mt-2">
            If you are under 13, a parent or guardian should help you set up this account.
          </p>
        </div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={parentConsent}
            onChange={(e) => setParentConsent(e.target.checked)}
            className="mt-1 h-5 w-5"
          />
          <span>I have parent/guardian permission to use SpellRead</span>
        </label>
        <Button onClick={finishOnboarding} disabled={!parentConsent} className="w-full">
          Start Reading! 🎉
        </Button>
      </div>
    );
  }

  return null;
}
