import React, { useEffect } from "react";
import type { NewsArticle } from "../types/NewsArticle";
import "../styles/ArticleModal.css";

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

const ArticleModal = ({ article, onClose }: ArticleModalProps) => {
  if (!article) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-contents">
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">{article.title}</h2>
        <p className="modal-body">{article.body}</p>
        <small className="modal-info">
          Level: {article.access_level} | Date:{" "}
          {new Date(article.created_at).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export default ArticleModal;
