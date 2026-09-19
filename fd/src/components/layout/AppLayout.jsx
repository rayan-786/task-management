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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <TopNav
        onOpenSearch={() => setSearchOpen(true)}
        onOpenCreateIssue={() => setCreateIssueOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex min-w-0">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 overflow-x-hidden p-3.5 sm:p-5 md:p-6 max-w-7xl mx-auto w-full">
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
