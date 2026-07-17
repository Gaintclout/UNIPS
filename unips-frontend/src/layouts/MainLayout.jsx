import Sidebar from "../components/Sidebar"

function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <main className="min-w-0 flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-slate-100">
        {children}
      </main>

    </div>
  )
}

export default MainLayout;
