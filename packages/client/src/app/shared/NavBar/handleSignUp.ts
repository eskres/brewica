import axios from "axios";

export default function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
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