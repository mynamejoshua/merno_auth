import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router";


export default function Login() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');


    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("http://localhost:5000/prev");
            const data = null
            try {
                data = await response.json();
            }
            catch { console.log("no session");}

            if (data) {
                navigate("/home");
            }
        };

        fetchData();
    }, []);


    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch("http://localhost:5000/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userName: name,
                password: password
            }),
        })
            .catch(error => {
                window.alert(error);
            });


        if (response.status == 200) {
            navigate("/home");
        } else {
            setStatus("Failed to log in");
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="enter your name"
                />
                <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="enter your password"
                />
                <button type="submit">Log In</button>
            </form>
            <p>Result: {status}</p>
        </>
    )
}