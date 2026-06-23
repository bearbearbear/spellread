import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { ReadPage } from "@/pages/ReadPage";
import { QuizPage } from "@/pages/QuizPage";
import { WordsPage } from "@/pages/WordsPage";
import { ReviewPage } from "@/pages/ReviewPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ParentDashboardPage } from "@/pages/ParentDashboardPage";
import { FeedbackPage } from "@/pages/FeedbackPage";

function PreviewRedirect() {
  const { bookId, chapterId } = useParams();
  return <Navigate to={`/book/${bookId}/chapter/${chapterId}/overview`} replace />;
}

export function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/book/:bookId/chapter/:chapterId/overview" element={<OverviewPage />} />
          <Route path="/book/:bookId/chapter/:chapterId/preview" element={<PreviewRedirect />} />
          <Route path="/book/:bookId/chapter/:chapterId/read" element={<ReadPage />} />
          <Route path="/book/:bookId/chapter/:chapterId/quiz" element={<QuizPage />} />
          <Route path="/words" element={<WordsPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/parent" element={<ParentDashboardPage />} />
          <Route path="/parent/feedback" element={<FeedbackPage />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
