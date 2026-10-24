import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SuspenseFallback from "./components/SuspenseFallback";
import "./App.css";

/**
 * Main Application Component with Route-Based Code Splitting
 * Practical 8: Performance Optimization and Lazy Loading in React
 * Student: Ansh Sojitra | Student ID: 24CS095 | CHARUSAT ITUE301
 *
 * Route chunks are split dynamically using React.lazy() and evaluated
 * inside an accessible React.Suspense boundary.
 */
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<SuspenseFallback message="Loading application route chunk..." />}>
        <Routes>
          {/* Main Task Management Board Route */}
          <Route path="/" element={<Projects />} />
          <Route path="/projects" element={<Projects />} />

          {/* Code-Split Contact & Feedback Route */}
          <Route path="/contact" element={<Contact />} />

          {/* Catch-all redirect to ensure existing routes remain reliable */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
