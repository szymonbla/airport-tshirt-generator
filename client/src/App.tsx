import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import RevealView from './views/RevealView'
import AdminView from './views/AdminView'
import TripDetailView from './views/TripDetailView'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/reveal" element={<RevealView />} />
        <Route path="/admin" element={<AdminView />} />
        <Route path="/admin/trip/:id" element={<TripDetailView />} />
      </Routes>
      <Toaster position="bottom-right" />
    </HashRouter>
  )
}
