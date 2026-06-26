
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { readerLevelLabel } from "@/lib/adaptive";
import { countByStatus } from "@/lib/srs";
import { getChapterProgress } from "@/lib/store";
import { getAllChapters } from "@/lib/content";
import { UserSwitcher } from "@/components/learning/UserSwitcher";
import { Button } from "@/components/ui/Button";

export function ProfilePage() {
  const { state, learners, switchUser, removeLearner } = useApp();
  const profile = state.profile;
  const [deletePin, setDeletePin] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  if (!profile) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-ink-muted">No learner selected.</p>
        <Link to="/select-user" className="text-burgundy underline">
          Choose a learner
        </Link>
      </div>
    );
  }

  const vocabCounts = countByStatus(state.vocabJournal);
  const completedChapters = getAllChapters(1).filter(
    (ch) => getChapterProgress(state, 1, ch.chapter).status === "completed",
  ).length;

  const earnedBadges = state.badges.filter((b) => b.earnedAt);

  const handleDelete = (userId: string, nickname: string) => {
    const target = learners.find((l) => l.id === userId);
    if (
      !window.confirm(
        `Delete ${nickname}'s profile and all their progress? This cannot be undone.`,
      )
    ) {
      return;
    }

    if (target?.parentPin && deletePin !== target.parentPin) {
      window.alert("Incorrect PIN. Deletion cancelled.");
      setDeletePin("");
      setDeleteTargetId(null);
      return;
    }

    removeLearner(userId);
    setDeletePin("");
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6">
      {learners.length > 1 && <UserSwitcher />}

      <div className="parchment-card p-6 text-center">
        <div className="text-6xl">{profile.avatar}</div>
        <h1 className="mt-2 text-3xl font-bold">{profile.nickname}</h1>
        <p className="capitalize text-ink-muted">{profile.house}</p>
        <p className="mt-2 text-lg font-semibold text-burgundy">
          {readerLevelLabel(profile.readerLevel)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="parchment-card p-4 text-center">
          <div className="text-2xl font-bold text-burgundy">{profile.housePoints}</div>
          <div className="text-sm text-ink-muted">House Points</div>
        </div>
        <div className="parchment-card p-4 text-center">
          <div className="text-2xl font-bold text-burgundy">{profile.streakDays}</div>
          <div className="text-sm text-ink-muted">Day Streak</div>
        </div>
        <div className="parchment-card p-4 text-center">
          <div className="text-2xl font-bold text-burgundy">{completedChapters}</div>
          <div className="text-sm text-ink-muted">Chapters Done</div>
        </div>
        <div className="parchment-card p-4 text-center">
          <div className="text-2xl font-bold text-burgundy">{vocabCounts.mastered}</div>
          <div className="text-sm text-ink-muted">Words Mastered</div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Badges</h2>
        <div className="grid grid-cols-2 gap-2">
          {state.badges.map((badge) => (
            <div
              key={badge.id}
              className={`parchment-card p-3 text-center text-sm ${
                badge.earnedAt ? "" : "opacity-40"
              }`}
            >
              <div className="text-2xl">{badge.earnedAt ? "🏅" : "🔒"}</div>
              <div className="font-semibold">{badge.name}</div>
              <div className="text-xs text-ink-muted">{badge.description}</div>
            </div>
          ))}
        </div>
        {earnedBadges.length === 0 && (
          <p className="mt-2 text-center text-sm text-ink-muted">
            Complete chapters to earn badges!
          </p>
        )}
      </section>

      {learners.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Learners on this device</h2>
          <ul className="space-y-2">
            {learners.map((learner) => {
              const isActive = learner.id === profile.id;
              return (
                <li
                  key={learner.id}
                  className={`parchment-card flex flex-wrap items-center justify-between gap-3 p-3 ${
                    isActive ? "ring-2 ring-burgundy/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{learner.avatar}</span>
                    <div>
                      <p className="font-semibold">{learner.nickname}</p>
                      <p className="text-xs capitalize text-ink-muted">{learner.house}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!isActive && (
                      <Button
                        variant="secondary"
                        onClick={() => switchUser(learner.id)}
                      >
                        Switch
                      </Button>
                    )}
                    {learners.length > 1 && (
                      <Button
                        variant="secondary"
                        onClick={() => setDeleteTargetId(learner.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  {deleteTargetId === learner.id && (
                    <div className="w-full space-y-2 border-t border-parchment-dark pt-3">
                      <p className="text-sm text-ink-muted">
                        Enter parent PIN if set, or confirm deletion.
                      </p>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={deletePin}
                        onChange={(e) => setDeletePin(e.target.value)}
                        className="w-full rounded-xl border-2 border-parchment-dark bg-white/50 px-3 py-2 text-center tracking-widest"
                        placeholder="PIN (optional)"
                      />
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleDelete(learner.id, learner.nickname)}
                        >
                          Confirm delete
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1"
                          onClick={() => {
                            setDeleteTargetId(null);
                            setDeletePin("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <Link
            to="/onboarding?mode=additional"
            className="block text-center text-sm text-burgundy underline"
          >
            Add another learner
          </Link>
        </section>
      )}

      <Link to="/parent" className="block text-center text-burgundy underline">
        Parent Dashboard →
      </Link>
    </div>
  );
}
