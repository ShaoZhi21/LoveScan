import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LogoScreen } from "./screens/LogoScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { SignupScreen } from "./screens/SignupScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { CheckPreviewScreen } from "./screens/CheckPreviewScreen";
import { CheckMainScreen } from "./screens/CheckMainScreen";
import { ChatScanScreen } from "./screens/ChatScanScreen";
import { ProfileScanScreen } from "./screens/ProfileScanScreen";
import { SocialMediaScanScreen } from "./screens/SocialMediaScanScreen";
import { RiskReportScreen } from "./screens/RiskReportScreen";
import { ReportScamScreen } from "./screens/ReportScamScreen";
import { BeginReportScreen } from "./screens/BeginReportScreen";
import { ScamEvidenceScreen } from "./screens/ScamEvidenceScreen";
import { SubmitReportScreen } from "./screens/SubmitReportScreen";
import { DetailedReportScreen } from "./screens/DetailedReportScreen";
import { ReverseImageSearchScreen } from "./screens/ReverseImageSearchScreen";
import { ScreenshotAnalysisScreen } from "./screens/ScreenshotAnalysisScreen";
import { ChatlogAnalysisScreen } from "./screens/ChatlogAnalysisScreen";
import { SocialMediaAnalysisScreen } from "./screens/SocialMediaAnalysisScreen";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Router>
      <div className="fixed inset-0 bg-[#8b0000]">
        <div className="max-w-[480px] mx-auto h-full relative">
          <Routes>
            <Route path="/" element={<LogoScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/check-preview" element={<CheckPreviewScreen />} />
            <Route path="/check" element={<CheckMainScreen />} />
            <Route path="/chat-scan" element={<ChatScanScreen />} />
            <Route path="/profile-scan" element={<ProfileScanScreen />} />
            <Route path="/social-media-scan" element={<SocialMediaScanScreen />} />
            <Route path="/risk-report" element={<RiskReportScreen />} />
            <Route path="/report" element={<ReportScamScreen />} />
            <Route path="/begin-report" element={<BeginReportScreen />} />
            <Route path="/scam-evidence" element={<ScamEvidenceScreen />} />
            <Route path="/submit-report" element={<SubmitReportScreen />} />
            <Route path="/detailed-report" element={<DetailedReportScreen />} />
            <Route path="/reverse-image-search" element={<ReverseImageSearchScreen />} />
            <Route path="/screenshot-analysis" element={<ScreenshotAnalysisScreen />} />
            <Route path="/chatlog-analysis" element={<ChatlogAnalysisScreen />} />
            <Route path="/social-media-analysis" element={<SocialMediaAnalysisScreen />} />
          </Routes>
        </div>
      </div>
    </Router>
  </StrictMode>
);