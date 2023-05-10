import axios from "axios";

export default function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    axios.post('/auth/signin', {
        emailAddress: 'test@test.com',
        password: 'password'
    })
    .then((res) => {
        console.log(res);
    })
    .catch((error) => {
        alert(error.message);
    })
}