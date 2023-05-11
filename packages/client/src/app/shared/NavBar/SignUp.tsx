import axios from "axios";
import { useState } from "react";

export default function SignUp() {
  const [inputs, setInputs] = useState({
    username: "",
    emailAddress: "",
    password: "",
    passwordConf: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      axios.post('/auth/signup', inputs)
      .then((res) => {
          console.log(res);
      })
      .catch((error) => {
          alert(error.message);
      })
  }

  return (
    <div className="modal fade" id="signUp" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="modalTitle" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content" onSubmit={handleSignUp}>
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="modalTitle">Sign up</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="username" placeholder="name@example.com" name="username" value={inputs.username} onChange={handleChange}/>
                <label htmlFor="username">Username</label>
              </div>
              <div className="form-floating mb-3">
                <input type="email" className="form-control" id="email" placeholder="name@example.com" name="emailAddress" value={inputs.emailAddress} onChange={handleChange}/>
                <label htmlFor="email">Email address</label>
              </div>
              <div className="form-floating mb-3">
                <input type="password" className="form-control" id="password" placeholder="Password" name="password" value={inputs.password} onChange={handleChange}/>
                <label htmlFor="password">Password</label>
              </div>
              <div className="form-floating mb-3">
                <input type="password" className="form-control" id="confirmPassword" placeholder="Password" name="passwordConf" value={inputs.passwordConf} onChange={handleChange}/>
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