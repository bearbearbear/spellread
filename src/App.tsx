import { Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { PreviewPage } from "@/pages/PreviewPage";
import { ReadPage } from "@/pages/ReadPage";
import { QuizPage } from "@/pages/QuizPage";
import { WordsPage } from "@/pages/WordsPage";
import { ReviewPage } from "@/pages/ReviewPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ParentDashboardPage } from "@/pages/ParentDashboardPage";
import { FeedbackPage } from "@/pages/FeedbackPage";

export function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/book/:bookId/chapter/:chapterId/preview" element={<PreviewPage />} />
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
