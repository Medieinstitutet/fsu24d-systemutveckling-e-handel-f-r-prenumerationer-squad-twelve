import { Link } from "react-router-dom";

const Header = () => {
  return (
    <>
      <div>
        <nav className="NavBar">
          <Link to="/">Home</Link> 
          <Link to="/login">Login</Link>
        </nav>
      </div>
    </>
  );
};

export default Header;
