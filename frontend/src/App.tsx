import { useState, type ComponentType } from "react";
import "./App.css";
import Navbar, { type PageId } from "./components/Navbar";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import PreferencesPage from "./pages/PreferencesPage";

const PAGES: Record<PageId, ComponentType> = {
  home: HomePage,
  "knowledge-base": KnowledgeBasePage,
  chat: ChatPage,
  preferences: PreferencesPage,
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const ActivePage = PAGES[activePage];

  return (
    <div className="app">
      <Navbar activePage={activePage} onPageChange={setActivePage} />
      <main className="app-main">
        <ActivePage />
      </main>
    </div>
  );
}
