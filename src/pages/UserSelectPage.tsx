
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";

export function UserSelectPage() {
  const navigate = useNavigate();
  const { learners, switchUser } = useApp();

  if (learners.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold text-burgundy">Welcome to SpellRead</h1>
        <p className="text-ink-muted">Create a learner profile to get started.</p>
        <Link to="/onboarding">
          <Button className="w-full">Get Started</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-burgundy">Who&apos;s reading today?</h1>
        <p className="mt-2 text-ink-muted">Choose a learner to continue.</p>
      </div>

      <ul className="space-y-3">
        {learners.map((learner) => (
          <li key={learner.id}>
            <button
              type="button"
              onClick={() => {
                switchUser(learner.id);
                navigate("/");
              }}
              className="parchment-card flex w-full items-center gap-4 p-4 text-left transition-shadow hover:shadow-md"
            >
              <span className="text-4xl" aria-hidden="true">
                {learner.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-burgundy">{learner.nickname}</p>
                <p className="capitalize text-sm text-ink-muted">
                  {learner.house} · {learner.housePoints} House Points
                </p>
              </div>
              <span className="text-ink-muted">→</span>
            </button>
          </li>
        ))}
      </ul>

      <Link
        to="/onboarding?mode=additional"
        className="block text-center text-sm text-burgundy underline"
      >
        Add a new learner
      </Link>
    </div>
  );
}
