import React, {useState} from 'react';
import { useNavigate } from "react-router";


export default function Register() {
const [name, setName] = useState('');
const [password, setPassword] = useState('');
const [res, setRes] = useState('');

const navigate = useNavigate();

const handleSubmit = async (event) => {
    event.preventDefault();
    if(!name) return;

    const response = await fetch("http://localhost:5000/register",  {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
                userName: name,
                password: password,
            }),
        })
        .catch(error => {
            window.alert(error);
        });

    const data = await response.json()
    setRes(data.msg)
    
    navigate("/home");
}

return (
    <>
    <form onSubmit={handleSubmit} style={{display: 'flex'}}>
        <input 
        value={name} 
        onChange={(event)=> setName(event.target.value)} 
        placeholder="enter your name" 
        />
        <input 
        value={password} 
        onChange={(event)=> setPassword(event.target.value)} 
        placeholder="enter your password" 
        />
        <button type="submit">Register</button>
    </form>
    <p>Result: {res}</p>
    </>
)
}