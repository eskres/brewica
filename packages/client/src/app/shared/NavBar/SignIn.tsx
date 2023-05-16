import axios from "axios";
import { useState } from 'react';

export default function SignIn() {
  const [inputs, setInputs] = useState({
    emailAddress: "",
    password: ""
  });

  const [valid, setValid] = useState({
    email: false,
    feedback: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs(values => ({...values, [name]: value}))
  }
  
  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (valid.email) {
      axios.post('/auth/signin', inputs)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        alert(error.message);
      }) 
    }
  }

  function validateEmail(e: React.FocusEvent<HTMLInputElement>) {
    e.target.classList.contains('is-valid') && e.target.classList.remove('is-valid');
    e.target.classList.contains('is-invalid') && e.target.classList.remove('is-invalid');
    // Using the contraint validation api to check for a valid email
    if (e.target.checkValidity() && e.target.value !== ""){
      e.target.classList.add('is-valid');
      setValid({email: true, feedback: ""});
    } else if (e.target.value === "") {
      e.target.classList.add('is-invalid');
      setValid({email: false, feedback: "Please enter an email address to continue"});
    } else {
      e.target.classList.add('is-invalid');
      setValid({email: false, feedback: "Not a valid email address"});
    }
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
                <input type="email" className="form-control" id="email" placeholder="name@example.com" name="emailAddress" value={inputs.emailAddress} onChange={handleChange} onBlur={validateEmail}/>
                <label htmlFor="email">Email address</label>
                {valid.feedback !== "" && <div className="invalid-feedback" role="alert" aria-label="Email error">{valid.feedback}</div>}
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
  );
}