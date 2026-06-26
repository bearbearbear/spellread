
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";

export function UserSwitcher() {
  const { learners, state, switchUser } = useApp();
  const activeId = state.profile?.id;

  if (learners.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {learners.map((learner) => {
        const isActive = learner.id === activeId;
        return (
          <button
            key={learner.id}
            type="button"
            onClick={() => {
              if (!isActive) switchUser(learner.id);
            }}
            className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? "border-burgundy bg-burgundy/10 font-semibold text-burgundy"
                : "border-parchment-dark bg-white/50 text-ink-muted hover:border-gold"
            }`}
            aria-current={isActive ? "true" : undefined}
          >
            <span className="text-lg" aria-hidden="true">
              {learner.avatar}
            </span>
            <span>{learner.nickname}</span>
          </button>
        );
      })}
      <Link
        to="/onboarding?mode=additional"
        className="flex shrink-0 items-center gap-1 rounded-full border-2 border-dashed border-parchment-dark px-3 py-1.5 text-sm text-ink-muted hover:border-burgundy hover:text-burgundy"
      >
        <span aria-hidden="true">＋</span> Add
      </Link>
    </div>
  );
}
