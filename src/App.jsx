import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import AuthPage from './pages/AuthPage'
import CreatePostPage from './pages/CreatePostPage'
import EditPostPage from './pages/EditPostPage'
import HomeFeedPage from './pages/HomeFeedPage'
import MyPostsPage from './pages/MyPostsPage'
import PostDetailPage from './pages/PostDetailPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomeFeedPage />} />
        <Route path="/posts/new" element={<CreatePostPage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route path="/posts/:postId/edit" element={<EditPostPage />} />
        <Route path="/my-posts" element={<MyPostsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
