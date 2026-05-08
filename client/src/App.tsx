import { HashRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import OrganizerView from './views/OrganizerView'
import RevealView from './views/RevealView'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<OrganizerView />} />
        <Route path="/reveal" element={<RevealView />} />
      </Routes>
      <Toaster position="bottom-right" />
    </HashRouter>
  )
}
