
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { readerLevelLabel } from "@/lib/adaptive";
import { countByStatus } from "@/lib/srs";
import { getChapterProgress } from "@/lib/store";
import { getAllChapters } from "@/lib/content";

export function ProfilePage() {
  const { state } = useApp();
  const profile = state.profile;

  if (!profile) {
    return (
      <div className="text-center">
        <Link to="/onboarding" className="text-burgundy underline">Get started</Link>
      </div>
    );
  }

  const vocabCounts = countByStatus(state.vocabJournal);
  const completedChapters = getAllChapters(1).filter(
    (ch) => getChapterProgress(state, 1, ch.chapter).status === "completed",
  ).length;

  const earnedBadges = state.badges.filter((b) => b.earnedAt);

  return (
    <div className="space-y-6">
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

      <Link to="/parent" className="block text-center text-burgundy underline">
        Parent Dashboard →
      </Link>
    </div>
  );
}
