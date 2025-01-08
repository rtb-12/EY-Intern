import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/themeContext";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/index";
import { AppNavbar } from "./components/navbar";
import { AppSidebar } from "./components/sidebar";
import SignUp from "./pages/signupPage";
import LogIn from "./pages/loginPage";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <AppNavbar />
            <div className="flex">
              <AppSidebar />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<LogIn />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
