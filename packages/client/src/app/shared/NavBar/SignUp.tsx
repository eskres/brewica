import axios from "axios";
import { useState, useReducer } from "react";
import * as type from "./signUpTypes";
import PasswordStrength from "./PasswordStrength";

// Reducer dispatch
const reducer = (state:type.State, action: type.Action): type.State => {
  switch (action.field) {
    case 'username':
      return action.valid ?
      { ...state, username: { ...state.username, valid: action.valid }} :
      { ...state, username: { ...state.username, feedback: action.feedback}}

    case 'emailAddress':
      return action.valid ?
      { ...state, emailAddress: { ...state.emailAddress, valid: action.valid }} :
      { ...state, emailAddress: { ...state.emailAddress, feedback: action.feedback}}
    
    case 'password':      
      return action.valid ?
      { ...state, password: { ...state.password, valid: action.valid }} :
      { ...state, password: { ...state.password, feedback: action.feedback}}
    
    case 'passwordConf':
      return action.valid ?
      { ...state, passwordConf: { ...state.passwordConf, valid: action.valid }} :
      { ...state, passwordConf: { ...state.passwordConf, feedback: action.feedback}}
  }
  throw Error('Unknown action: ' + action.field);
}

// Reducer initial state
const initialState: type.State = {
  username: { valid: false, feedback: "" },
  emailAddress: { valid: false, feedback: "" },
  password: { valid: false, feedback: "" },
  passwordConf: { valid: false, feedback: "" }
}

// Invalid input feedback declarations
const emailFeedback: type.Feedback = {
  empty: "Please enter an email address to continue",
  invalid: "Not a valid email address"
};
const usernameFeedback: type.Feedback = {
  empty: "Please enter a username to continue",
  invalid: "Usernames must be no longer than 28 characters and are not case sensitive. Only letters, numbers, dashes and underscores are permitted"
};
const passwordFeedback: type.Feedback = {
  empty: "Please enter a password to continue",
  invalid: "Password requires 8 or more characters with a mix of letters, numbers & symbols"
};

export default function SignUp() {

  const [state, dispatch] = useReducer(reducer, initialState);
  const [inputs, setInputs] = useState({
    username: "",
    emailAddress: "",
    password: "",
    passwordConf: ""
  });
  const [password, setPassword] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs(values => ({...values, [name]: value}));
  }

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      axios.post('/auth/signup', inputs)
      .then((res) => {
          console.log(res);
      })
      .catch((error) => {
          alert(error.response.data.message);
      });
  }

  function validate(e: React.FocusEvent<HTMLInputElement>, feedback: type.Feedback) {
    const classes = e.target.classList;
    classes.contains('is-valid') && classes.remove('is-valid');
    classes.contains('is-invalid') && classes.remove('is-invalid');
    // Using the contraint validation api to check for a valid email
    if (e.target.checkValidity() && e.target.value !== ""){
      classes.add('is-valid');
      dispatch({field: e.target.name, valid: true, feedback: ""});
    } else if (e.target.value === "") {
      classes.add('is-invalid');
      dispatch({field: e.target.name, valid: false, feedback: feedback.empty});
    } else {
      classes.add('is-invalid');
      dispatch({field: e.target.name, valid: false, feedback: feedback.invalid});
    }
  }
  
  function validatePasswordConf(e: React.FocusEvent<HTMLInputElement>) {
    const classes = e.target.classList;
    classes.contains('is-valid') && classes.remove('is-valid');
    classes.contains('is-invalid') && classes.remove('is-invalid');
    // Using the contraint validation api to check for a valid email
    if (inputs.password === e.target.value && e.target.value !== ""){
      classes.add('is-valid');
      dispatch({field: e.target.name, valid: true, feedback: ""});
    } else if (e.target.value === "") {
      classes.add('is-invalid');
      dispatch({field: e.target.name, valid: false, feedback: "Please re-enter your password"});
    } else {
      classes.add('is-invalid');
      dispatch({field: e.target.name, valid: false, feedback: "Passwords do not match"});
    }
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
                <input type="text" className="form-control" id="username" placeholder="name@example.com" name="username" pattern="^[\w\-.]{1,28}$" value={inputs.username} onChange={handleChange} onBlur={(e) => validate(e, usernameFeedback)}/>
                <label htmlFor="username">Username</label>
                {state.username.feedback !== "" && <div className="invalid-feedback" role="alert" aria-label="Username error">{state.username.feedback}</div>}
              </div>

              <div className="form-floating mb-3">
                <input type="email" className="form-control" id="email" placeholder="name@example.com" name="emailAddress" value={inputs.emailAddress} onChange={handleChange} onBlur={(e) => validate(e, emailFeedback)}/>
                <label htmlFor="email">Email address</label>
                {state.emailAddress.feedback !== "" && <div className="invalid-feedback" role="alert" aria-label="Email error">{state.emailAddress.feedback}</div>}
              </div>

              { password !== "" &&
                <div className="form-floating mb-1">
                  <PasswordStrength password={password}/>
                </div>
              }

              <div className="form-floating mb-3">
                <input type="password" className="form-control" id="password" placeholder="Password" name="password" pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!#$%&'*+/=?^_‘{|}~-])[A-Za-z\d!#$%&'*+/=?^_‘{|}~-]{8,}" value={inputs.password} onChange={(e) => {setPassword(e.target.value); handleChange(e)}} onBlur={(e) => validate(e, passwordFeedback)}/>
                <label htmlFor="password">Password</label>
                  {state.password.feedback !== "" && <div className="invalid-feedback" role="alert" aria-label="Password error">{state.password.feedback}</div> }
              </div>

              <div className="form-floating mb-3">
                <input type="password" className="form-control" id="confirmPassword" placeholder="Password" name="passwordConf" value={inputs.passwordConf} onChange={handleChange} onBlur={validatePasswordConf}/>
                <label htmlFor="confirmPassword">Confirm password</label>
                {state.passwordConf.feedback !== "" && <div className="invalid-feedback" role="alert" aria-label="Password confirmation error">{state.passwordConf.feedback}</div>}
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