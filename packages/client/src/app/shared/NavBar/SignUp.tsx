import axios from "axios";

export default function SignUp() {

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      axios.post('/auth/signup', {
          username: 'test123',
          emailAddress: 'test@test.com',
          password: 'password',
          passwordConf: 'password'
      })
      .then((res) => {
          console.log(res);
      })
      .catch((error) => {
          alert(error.message);
      })
  }

  return (
    <div className="modal fade" id="signUp" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={1} aria-labelledby="modalTitle" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content" onSubmit={handleSignUp}>
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="modalTitle">Sign up</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
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
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" aria-label="Submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
}