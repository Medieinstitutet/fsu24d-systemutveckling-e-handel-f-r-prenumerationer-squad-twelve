import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import Dashboard from "./pages/Dashboard";
import BuyNow from "./pages/BuyNow";
import TheCurious from "./pages/TheCurious";
import TheInformed from "./pages/TheInformed";
import TheInsider from "./pages/TheInsider";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/BuyNow" element={<BuyNow />} />

        <Route path="/TheCurious" element={<TheCurious />} />
        <Route path="/TheInformed" element={<TheInformed />} />
        <Route path="/TheInsider" element={<TheInsider />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
