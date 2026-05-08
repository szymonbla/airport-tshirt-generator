import { HashRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import OrganizerView from './views/OrganizerView'
import RevealView from './views/RevealView'
import AdminView from './views/AdminView'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<OrganizerView />} />
        <Route path="/reveal" element={<RevealView />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
      <Toaster position="bottom-right" />
    </HashRouter>
  )
}
