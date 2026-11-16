import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { Layout } from "./Layout";
import { AuthProvider } from "./AuthProvider";
import { Dashboard } from "../pages/Dashboard";
import { TrainingList } from "../pages/TrainingList";
import { Training } from "../pages/Training";
const Statistics = lazy(() =>
  import("../pages/Statistics").then((m) => ({ default: m.Statistics })),
);
import { Settings } from "../pages/Settings";
import { Research } from "../pages/Research";
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="training" element={<TrainingList />} />
            <Route path="training/:id" element={<Training />} />
            <Route
              path="statistics"
              element={
                <Suspense
                  fallback={
                    <div className="empty-state">기록을 불러오는 중…</div>
                  }
                >
                  <Statistics />
                </Suspense>
              }
            />
            <Route path="research" element={<Research />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h1>페이지를 찾을 수 없습니다.</h1>
                  <Link to="/">대시보드로 돌아가기</Link>
                </div>
              }
            />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
