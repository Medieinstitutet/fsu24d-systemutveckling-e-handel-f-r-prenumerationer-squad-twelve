import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface Product {
  tier: string;
  productId: string;
  priceId: string;
  interval: string;
  price: number;
  displayPrice: string;
  displayName: string;
}

const PlanSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/subscription/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const path = e.target.value;
    if (path) {
      navigate(path);
    }
  };

  if (loading) {
    return <div>Loading plans...</div>;
  }

  return (
    <select onChange={handleChange} value={location.pathname}>
      {products.map((product) => (
        <option key={product.tier} value={`/The${product.tier.charAt(0).toUpperCase() + product.tier.slice(1)}`}>
          {product.displayName} - {product.displayPrice}/{product.interval}
        </option>
      ))}
    </select>
  );
};

export default PlanSelector;
