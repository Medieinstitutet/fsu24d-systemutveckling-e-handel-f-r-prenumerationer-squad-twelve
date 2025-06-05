import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import CreateAccount from "../pages/CreateAccount";
import Dashboard from "../pages/Dashboard";
import BuyNow from "../pages/BuyNow";
import TheCurious from "../pages/TheCurious";
import TheInformed from "../pages/TheInformed";
import TheInsider from "../pages/TheInsider";
import SubscriptionSuccess from "../pages/SubscriptionSuccess";
import SubscriptionCancel from "../pages/SubscriptionCancel";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/BuyNow" element={<BuyNow />} />
        <Route path="/TheCurious" element={<TheCurious />} />
        <Route path="/TheInformed" element={<TheInformed />} />
        <Route path="/TheInsider" element={<TheInsider />} />
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
