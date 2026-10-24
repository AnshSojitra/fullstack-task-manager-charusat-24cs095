
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Projects from './pages/Projects'
import './App.css'

function App() {
  return  (
    <BrowserRouter> 
    <Routes>
      <Route path="/" element={<Projects />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
