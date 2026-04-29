import { Navigate, Route, Routes } from 'react-router-dom'
import AuthGuard from './components/auth/AuthGuard'
import AppShell from './components/layout/AppShell'
import AuthPage from './pages/AuthPage'
import CreatePostPage from './pages/CreatePostPage'
import EditPostPage from './pages/EditPostPage'
import ExploreFeedPage from './pages/ExploreFeedPage'
import HomeFeedPage from './pages/HomeFeedPage'
import MyPostsPage from './pages/MyPostsPage'
import PostDetailPage from './pages/PostDetailPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomeFeedPage />} />
        <Route path="/explore" element={<ExploreFeedPage />} />
        <Route
          path="/posts/new"
          element={
            <AuthGuard>
              <CreatePostPage />
            </AuthGuard>
          }
        />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route
          path="/posts/:postId/edit"
          element={
            <AuthGuard>
              <EditPostPage />
            </AuthGuard>
          }
        />
        <Route
          path="/my-posts"
          element={
            <AuthGuard>
              <MyPostsPage />
            </AuthGuard>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
