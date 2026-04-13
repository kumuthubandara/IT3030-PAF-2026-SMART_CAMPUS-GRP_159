import { BrowserRouter, Routes, Route } from "react-router-dom";
import SmartCampusHomePage from "./SmartCampusHomePage";
import AboutUsPage from "./AboutUsPage";
import ContactUsPage from "./ContactUsPage";
import DashboardRoute from "./DashboardRoute";
import FacilitiesPage from "./FacilitiesPage";
import MaintenancePage from "./MaintenancePage";
import NotificationsPage from "./NotificationsPage";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import StudentSettingsRoute from "./StudentSettingsRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SmartCampusHomePage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/settings" element={<StudentSettingsRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
