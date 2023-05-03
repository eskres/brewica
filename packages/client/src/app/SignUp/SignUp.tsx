import NavBar from "../shared/NavBar/NavBar"

export default function SignUp() {
  return (
    <>
    <NavBar />
    <form className="container mb-3">
      <div className="form-floating mb-3">
        <input type="email" className="form-control" id="username" placeholder="name@example.com"/>
        <label htmlFor="username">Username</label>
      </div>
      <div className="form-floating mb-3">
        <input type="email" className="form-control" id="email" placeholder="name@example.com"/>
        <label htmlFor="email">Email address</label>
      </div>
      <div className="form-floating mb-3">
        <input type="password" className="form-control" id="password" placeholder="Password"/>
        <label htmlFor="password">Password</label>
      </div>
      <div className="form-floating mb-3">
        <input type="password" className="form-control" id="confirmPassword" placeholder="Password"/>
        <label htmlFor="confirmPassword">Confirm password</label>
      </div>
      <button type="submit" className="btn btn-primary">Submit</button>
    </form>
    </>
  )
}