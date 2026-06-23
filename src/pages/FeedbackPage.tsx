
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    familyId: "",
    quizCompletion: "",
    frustration: "",
    childEnjoyment: "",
    comments: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedback = {
      ...form,
      submittedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("spellread-feedback") || "[]");
    existing.push(feedback);
    localStorage.setItem("spellread-feedback", JSON.stringify(existing));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl">🙏</div>
        <h1 className="text-2xl font-bold">Thank You!</h1>
        <p className="text-ink-muted">Your feedback helps us improve SpellRead.</p>
        <Link to="/parent"><Button>Back to Dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Beta Feedback</h1>
      <p className="text-ink-muted text-sm">
        Help us improve SpellRead for families. Takes about 2 minutes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Family ID (any nickname)</label>
          <input
            required
            value={form.familyId}
            onChange={(e) => setForm({ ...form, familyId: e.target.value })}
            className="w-full rounded-xl border-2 border-parchment-dark bg-white/50 px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Did your child complete chapter quizzes?</label>
          <select
            required
            value={form.quizCompletion}
            onChange={(e) => setForm({ ...form, quizCompletion: e.target.value })}
            className="w-full rounded-xl border-2 border-parchment-dark bg-white/50 px-4 py-2"
          >
            <option value="">Select...</option>
            <option value="always">Always (80%+ completion)</option>
            <option value="sometimes">Sometimes</option>
            <option value="rarely">Rarely</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Frustration level (1 = none, 5 = very frustrated)</label>
          <input
            type="range"
            min={1}
            max={5}
            value={form.frustration}
            onChange={(e) => setForm({ ...form, frustration: e.target.value })}
            className="w-full"
          />
          <p className="text-center text-sm">{form.frustration || 3}/5</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Child enjoyment (1 = low, 5 = loves it)</label>
          <input
            type="range"
            min={1}
            max={5}
            value={form.childEnjoyment}
            onChange={(e) => setForm({ ...form, childEnjoyment: e.target.value })}
            className="w-full"
          />
          <p className="text-center text-sm">{form.childEnjoyment || 3}/5</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Comments</label>
          <textarea
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
            rows={4}
            className="w-full rounded-xl border-2 border-parchment-dark bg-white/50 px-4 py-2"
            placeholder="What worked? What was confusing?"
          />
        </div>

        <Button type="submit" className="w-full">Submit Feedback</Button>
      </form>
    </div>
  );
}
