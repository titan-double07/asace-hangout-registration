// import { RegistrationForm } from "./components/RegistrationForm";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
