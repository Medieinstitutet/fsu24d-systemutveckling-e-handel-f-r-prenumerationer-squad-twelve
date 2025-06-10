import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/BuyNowProduct";

const accessPriority: { [key: string]: number } = {
  free: 0,
  curious: 1,
  informed: 2,
  insider: 3,
};

const getUserLevelFromToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.level || null;
  } catch {
    return null;
  }
};

const BuyNowButtons = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/subscription/products");
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        const sorted = data.sort(
          (a: Product, b: Product) => accessPriority[a.tier] - accessPriority[b.tier]
        );
        setProducts(sorted);
      } catch (err) {
        setError("Could not load subscription options.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    setUserLevel(getUserLevelFromToken());
  }, []);

  const userPriority = userLevel ? accessPriority[userLevel] : 0;

  if (loading) return <p>Loading subscription options...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <nav className="navcontainer">
      {products.map((product) =>
        userPriority < accessPriority[product.tier] ? (
          <Link
            key={product.tier}
            to={`/The${product.tier.charAt(0).toUpperCase() + product.tier.slice(1)}`}
            className="product-link"
          >
            {product.displayName} - {product.displayPrice}/{product.interval}
          </Link>
        ) : null
      )}
    </nav>
  );
};

export default BuyNowButtons;
