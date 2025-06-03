import "../styles/footercontainer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <p>&copy; {new Date().getFullYear()} The Daily Dose.</p>
    </footer>
  );
};

export default Footer;
