import React, {useState} from 'react';
import { useNavigate } from "react-router";


export default function Home() {
const navigate = useNavigate();

const handleclick = async (event) => {
    event.preventDefault();
    const response = await fetch("http://localhost:5000/logout")
    alert("logged out");
    navigate("/");
}

return (
    <>
    <h1>YOU LOGGED IN</h1>
    <button onClick={handleclick}>Logout</button>
    </>
)
}