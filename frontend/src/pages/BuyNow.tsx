import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import "../styles/headercontainer.css";
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

const BuyNow = () => {
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/subscription/products"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        const sortedProducts = data.sort(
          (a: Product, b: Product) =>
            accessPriority[a.tier] - accessPriority[b.tier]
        );
        setProducts(sortedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          "Could not load subscription options. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    const level = getUserLevelFromToken();
    setUserLevel(level);
  }, []);

  const userPriority = userLevel ? accessPriority[userLevel] : 0;

  if (!loading && userPriority >= accessPriority["insider"]) {
    return null;
  }

  return (
    <div className="buy-now-wrapper">
      <h2 className="free-news-heading">Buy Now</h2>
      <p className="home-description">
        Stay updated with the latest news, carefully selected and delivered just
        for you. Choose from our simple plans to get the news you want.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading subscription options...</p>
      ) : (
        <nav className="navcontainer">
          {products.map(
            (product) =>
              userPriority < accessPriority[product.tier] && (
                <Link
                  key={product.tier}
                  to={`/The${
                    product.tier.charAt(0).toUpperCase() + product.tier.slice(1)
                  }`}
                  className="product-link"
                >
                  {product.displayName} - {product.displayPrice}/
                  {product.interval}
                </Link>
              )
          )}
        </nav>
      )}
      <Footer />
    </div>
  );
};

export default BuyNow;
