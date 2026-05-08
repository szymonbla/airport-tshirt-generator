import { HashRouter, Route, Routes } from 'react-router-dom'
import OrganizerView from './views/OrganizerView'
import RevealView from './views/RevealView'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<OrganizerView />} />
        <Route path="/reveal" element={<RevealView />} />
      </Routes>
    </HashRouter>
  )
}
