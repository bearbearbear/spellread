
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { getWeeklyReport, setPlacement } from "@/lib/store";
import { readerLevelLabel } from "@/lib/adaptive";
import { Button } from "@/components/ui/Button";

export function ParentDashboardPage() {
  const { state, setState } = useApp();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [startChapter, setStartChapter] = useState(1);

  const report = getWeeklyReport(state);
  const profile = state.profile;

  if (!profile) {
    return (
      <div className="text-center">
        <p>No student profile found.</p>
        <Link to="/onboarding" className="text-burgundy underline">Set up profile</Link>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Parent Dashboard</h1>
        <p className="text-ink-muted">
          Enter any 4-digit PIN to access (MVP — set a real PIN in production).
        </p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full rounded-xl border-2 border-parchment-dark bg-white/50 px-4 py-3 text-center text-2xl tracking-widest"
          placeholder="••••"
        />
        <Button onClick={() => pin.length >= 4 && setUnlocked(true)} disabled={pin.length < 4} className="w-full">
          Enter
        </Button>
        <Link to="/" className="block text-center text-sm text-ink-muted underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  const handleAdjustChapter = () => {
    setState((prev) => setPlacement(prev, profile.lexileEstimate, startChapter));
  };

  const handleDailyGoal = (minutes: number) => {
    setState((prev) => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, dailyGoalMinutes: minutes } : null,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-burgundy">Parent Dashboard</h1>
        <Link to="/" className="text-sm text-ink-muted underline">← Home</Link>
      </div>

      <section className="parchment-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Weekly Report</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{report.chaptersCompleted}</p>
            <p className="text-sm text-ink-muted">Chapters completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{report.totalReadingMinutes}</p>
            <p className="text-sm text-ink-muted">Reading minutes</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{report.averageScore}%</p>
            <p className="text-sm text-ink-muted">Avg quiz score</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{report.quizAttempts}</p>
            <p className="text-sm text-ink-muted">Quiz attempts</p>
          </div>
        </div>
        <p className="mt-4 text-sm">
          <strong>Area to focus on:</strong> {report.weakAreas}
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Streak: {report.streakDays} days · House Points: {report.housePoints}
        </p>
      </section>

      <section className="parchment-card p-6">
        <h2 className="mb-2 text-lg font-semibold">Reader Profile</h2>
        <p><strong>{profile.nickname}</strong> — {readerLevelLabel(profile.readerLevel)}</p>
        <p className="text-sm text-ink-muted">Lexile estimate: {profile.lexileEstimate}L</p>
        <p className="text-sm text-ink-muted">
          Vocabulary: {Math.round(profile.vocabLevel * 100)}% · Comprehension:{" "}
          {Math.round(profile.comprehensionLevel * 100)}% · Cloze:{" "}
          {Math.round((profile.clozeLevel ?? 0.5) * 100)}%
        </p>
      </section>

      <section className="parchment-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Difficulty Adjustment</h2>
        <label className="mb-2 block text-sm">Set starting chapter (unlocks chapters before it)</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={17}
            value={startChapter}
            onChange={(e) => setStartChapter(parseInt(e.target.value, 10) || 1)}
            className="flex-1 rounded-xl border-2 border-parchment-dark bg-white/50 px-4 py-2"
          />
          <Button onClick={handleAdjustChapter}>Apply</Button>
        </div>
      </section>

      <section className="parchment-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Daily Reading Goal</h2>
        <div className="flex gap-2">
          {[10, 15, 20, 30].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleDailyGoal(m)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium ${
                profile.dailyGoalMinutes === m
                  ? "bg-burgundy text-white"
                  : "bg-parchment-dark"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
      </section>

      <section className="parchment-card p-6">
        <h2 className="mb-2 text-lg font-semibold">Screen Time Reminder</h2>
        <p className="text-sm text-ink-muted">
          Current daily goal: {profile.dailyGoalMinutes} minutes of reading.
          Encourage breaks between quiz sessions (max 15 min per quiz).
        </p>
      </section>

      <Link to="/parent/feedback" className="block text-center text-burgundy underline">
        Beta Feedback Form →
      </Link>
    </div>
  );
}
