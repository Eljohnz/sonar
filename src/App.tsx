import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Shell } from './components/Shell'
import { ThemeProvider } from './context/ThemeContext'
import { ThemeStudio } from './pages/ThemeStudio'
import { AuthProvider } from './context/AuthContext'
import { MusicProvider } from './context/MusicContext'
import { Account } from './pages/Account'
import { Admin } from './pages/Admin'
import { Auth } from './pages/Auth'
import { Discover } from './pages/Discover'
import { Library } from './pages/Library'
import { SongDetail } from './pages/SongDetail'
import { Submit } from './pages/Submit'

const router = createBrowserRouter([
  { element: <Shell />, children: [
    { index: true, element: <Discover /> },
    { path: 'submit', element: <Submit /> },
    { path: 'song/:id', element: <SongDetail /> },
    { path: 'song/:id/edit', element: <Submit /> },
    { path: 'login', element: <Auth mode="login" /> },
    { path: 'register', element: <Auth mode="register" /> },
    { path: 'library', element: <Library /> },
    { path: 'account', element: <Account /> },
    { path: 'admin', element: <Admin /> },
    { path: 'theme', element: <ThemeStudio /> },
    { path: '*', element: <div className="empty-state">Page not found.</div> },
  ] },
])

function App() {
  return <ThemeProvider><AuthProvider><MusicProvider><RouterProvider router={router} /></MusicProvider></AuthProvider></ThemeProvider>
}
export default App
