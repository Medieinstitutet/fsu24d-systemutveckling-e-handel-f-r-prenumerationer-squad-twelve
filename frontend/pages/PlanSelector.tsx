import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PlanSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const path = e.target.value;
    if (path) {
      navigate(path);
    }
  };

  return (
    <select onChange={handleChange} value={location.pathname}>
      <option value="/TheCurious">The Curious - 100$</option>
      <option value="/TheInformed">The Informed - 200$</option>
      <option value="/TheInsider">The Insider - 300$</option>
    </select>
  );
};

export default PlanSelector;
