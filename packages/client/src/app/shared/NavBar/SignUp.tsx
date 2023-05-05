export default function SignUp() {
  return (
    <div className="modal fade" id="signUp" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={1} aria-labelledby="modalTitle" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="modalTitle">Sign up</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
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
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Cancel">Cancel</button>
            <button type="button" className="btn btn-primary" aria-label="Submit">Submit</button>
          </div>
        </div>
      </div>
    </div>
  )
}