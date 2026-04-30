import PostOAuthProfileRedirect from '../auth/PostOAuthProfileRedirect'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import ScrollToTopButton from '../ui/ScrollToTopButton'
import Navbar from './Navbar'

function AppShell({ children }) {
  return (
    <div className="app-shell">
      {!isSupabaseConfigured ? (
        <div className="deploy-warning" role="alert">
          Supabase environment variables were missing at build time. Rebuild locally with a{' '}
          <code>.env</code> file (or set Netlify env vars before build), then upload the new{' '}
          <code>dist</code> folder.
        </div>
      ) : null}
      <PostOAuthProfileRedirect />
      <Navbar />
      <main className="page-content">{children}</main>
      <ScrollToTopButton />
    </div>
  )
}

export default AppShell
