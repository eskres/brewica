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
                            <a className="nav-link mx-1" role="link" href="/sign-up">Sign Up</a>
                            <a className="nav-link mx-1" role="link" href="/sign-in">Sign In</a>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
  
export default NavBar;