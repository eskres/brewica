import axios from "axios";
import { useState } from 'react';

export default function SignIn() {
  const [inputs, setInputs] = useState({
    emailAddress: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      axios.post('/auth/signin', inputs)
      .then((res) => {
          console.log(res);
      })
      .catch((error) => {
          alert(error.message);
      })
  }

  return (
    <div className="modal fade" id="signIn" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="modalTitle" aria-hidden="true" role="dialog">
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content" onSubmit={handleSignIn}>
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="modalTitle">Sign in</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
              <div className="form-floating mb-3">
                <input type="email" className="form-control" id="email" placeholder="name@example.com" name="emailAddress" value={inputs.emailAddress} onChange={handleChange}/>
                <label htmlFor="email">Email address</label>
              </div>
              <div className="form-floating mb-3">
                <input type="password" className="form-control" id="password" placeholder="Password" name="password" value={inputs.password} onChange={handleChange}/>
                <label htmlFor="password">Password</label>
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