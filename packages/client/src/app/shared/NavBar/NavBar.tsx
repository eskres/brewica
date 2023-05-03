import { Link } from "react-router-dom";

export function NavBar() {
    return (
        <header className="sticky-top" role="banner">
            <nav className="navbar navbar-expand-md" role="navigation">
                <div className="container">
                    <h1 className="navbar-brand fs-1">
                        Brewica
                    </h1>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>              
                    <div className="collapse navbar-collapse justify-content-end" id="navbarToggler">
                        <div className="navbar-nav" role="navigation">
                            <Link to="sign-up" className="nav-link mx-1" role="link">Sign Up</Link>
                            <Link to="sign-in" className="nav-link mx-1" role="link">Sign In</Link>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
  
export default NavBar;