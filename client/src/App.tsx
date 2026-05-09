import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import RevealView from './views/RevealView'
import AdminView from './views/AdminView'
import TripDetailView from './views/TripDetailView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RevealView />} />
        <Route path="/reveal" element={<RevealView />} />
        <Route path="/backstage" element={<AdminView />} />
        <Route path="/backstage/trip/:id" element={<TripDetailView />} />
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  )
}
