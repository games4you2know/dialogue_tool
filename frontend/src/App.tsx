import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import ProjectMembersPage from "./pages/ProjectMembersPage";
import CharacterDetailsPage from "./pages/CharacterDetailsPage";
import DialoguesPage from "./pages/DialoguesPage";
import SMSPage from "./pages/SMSPage";
import ExportPage from "./pages/ExportPage";
import { BackgroundsPage } from "./pages/BackgroundsPage";
import { MoodsPage } from "./pages/MoodsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="projects/:projectId" element={<ProtectedRoute><ProjectDetailsPage /></ProtectedRoute>} />
            <Route path="projects/:projectId/members" element={<ProtectedRoute><ProjectMembersPage /></ProtectedRoute>} />
            <Route path="projects/:projectId/characters/:characterId" element={<ProtectedRoute><CharacterDetailsPage /></ProtectedRoute>} />
            <Route path="projects/:projectId/backgrounds" element={<ProtectedRoute><BackgroundsPage /></ProtectedRoute>} />
            <Route path="projects/:projectId/moods" element={<ProtectedRoute><MoodsPage /></ProtectedRoute>} />
            <Route path="dialogues" element={<ProtectedRoute><DialoguesPage /></ProtectedRoute>} />
            <Route path="sms" element={<ProtectedRoute><SMSPage /></ProtectedRoute>} />
            <Route path="export" element={<ProtectedRoute><ExportPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
