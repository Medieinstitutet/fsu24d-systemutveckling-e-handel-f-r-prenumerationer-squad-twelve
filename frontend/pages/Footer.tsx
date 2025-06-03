const Footer = () => {
  return (
    <footer
      style={{
        textAlign: "center",
        marginTop: "2rem",
        padding: "1rem",
      }}
    >
      <p>
        &copy; {new Date().getFullYear()} The Daily Dose.
      </p>
    </footer>
  );
};

export default Footer;
