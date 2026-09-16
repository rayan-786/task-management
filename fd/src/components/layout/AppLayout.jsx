import { useState, useEffect } from "react";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";
import CreateIssueModal from "./CreateIssueModal";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function AppLayout({ children }) {
  const { refreshProjects } = useWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input or textarea
      const tag = e.target.tagName.toLowerCase();
      if (["input", "textarea", "select"].includes(tag) || e.target.isContentEditable) {
        return;
      }

      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setCreateIssueOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 antialiased">
      {/* Top Navigation */}
      <TopNav
        onOpenSearch={() => setSearchOpen(true)}
        onOpenCreateIssue={() => setCreateIssueOpen(true)}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenCreateIssue={() => setCreateIssueOpen(true)}
      />

      {/* Global Quick Create Issue Modal */}
      <CreateIssueModal
        isOpen={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        onCreated={() => {
          refreshProjects();
          window.dispatchEvent(new CustomEvent("taskflow:issue-created"));
        }}
      />
    </div>
  );
}
