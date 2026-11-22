import { useAuth } from "./AuthProvider";
import { useEffect } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  BrainCircuit,
  LayoutDashboard,
  Dumbbell,
  ChartNoAxesCombined,
  BookOpen,
  Settings2,
  ShieldCheck,
  ArrowUpRight,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { useData } from "./DataProvider";
import { repository } from "../infrastructure/storage/repository";
const links = [
  { path: "/", label: "대시보드", icon: LayoutDashboard },
  { path: "/training", label: "전체 훈련", icon: Dumbbell },
  { path: "/statistics", label: "나의 기록", icon: ChartNoAxesCombined },
  { path: "/research", label: "근거와 가이드", icon: BookOpen },
];
export function Layout() {
  const { user } = useAuth();
  const { data, error, notice, setNotice, act } = useData();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);
  const name =
    links.find((l) => l.path === location.pathname)?.label ??
    (location.pathname === "/settings" ? "설정 및 데이터" : "훈련");
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        본문으로 이동
      </a>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-symbol">
            <BrainCircuit size={25} />
          </span>
          <span>
            Cognitive Lab<small>인지훈련 실험실</small>
          </span>
        </Link>
        <Link to="/training/spaced-repetition" className="nav-item">
          학습 카드 · 오늘 복습
        </Link>
        <nav aria-label="주 메뉴">
          {links.map(({ path, label, icon: Icon }) => (
            <NavLink
              end={path === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              to={path}
              key={path}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-note">
            <ShieldCheck size={20} />
            <strong>오직 나에게 집중</strong>
            <p>
              {user
                ? "로그인한 계정에 온라인 저장"
                : "가입 없이, 나만의 속도로."}
              <br />
              {user
                ? "다른 기기에서도 이어서 학습해요."
                : "로그인하면 기록을 온라인에 보관해요."}
            </p>
          </div>
          <NavLink className="nav-item" to="/settings">
            <Settings2 size={19} />
            설정 및 데이터
          </NavLink>
          <div className="profile">
            <span className="avatar">나</span>
            <span>
              나의 실험실<small>개인 워크스페이스</small>
            </span>
            <button
              className="icon-button"
              aria-label={
                data.settings.theme === "light"
                  ? "다크 모드로 전환"
                  : "라이트 모드로 전환"
              }
              onClick={() =>
                void act(() =>
                  repository.setTheme(
                    data.settings.theme === "light" ? "dark" : "light",
                  ),
                )
              }
            >
              {data.settings.theme === "light" ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )}
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Cognitive Lab <ChevronRight size={14} /> <b>{name}</b>
          </span>
          <Link to="/settings" className="top-link">
            {user ? "계정 · 온라인 저장" : "로그인 / 가입"}{" "}
            <ArrowUpRight size={15} />
          </Link>
        </header>
        <main id="main" tabIndex={-1}>
          {error && (
            <div role="alert" className="alert error">
              {error} <Link to="/settings">데이터 관리</Link>
            </div>
          )}
          {notice && (
            <div role="alert" className="alert">
              {notice}
              <button className="ghost" onClick={() => setNotice("")}>
                닫기
              </button>
            </div>
          )}
          <Outlet />
        </main>
        <footer>
          COGNITIVE LAB <span>나만의 속도로, 한 번에 한 걸음.</span>
          <Link to="/research">훈련의 효과와 한계</Link>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="모바일 메뉴">
        {links.slice(0, 3).map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} end={path === "/"}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink to="/settings">
          <Settings2 size={20} />
          <span>설정</span>
        </NavLink>
      </nav>
    </>
  );
}
