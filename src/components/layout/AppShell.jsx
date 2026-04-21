import Navbar from './Navbar'

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">{children}</main>
    </div>
  )
}

export default AppShell
