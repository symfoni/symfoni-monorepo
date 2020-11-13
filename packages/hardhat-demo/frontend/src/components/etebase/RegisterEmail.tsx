import React, { useState } from 'react';
import { RegisterEmailProps } from '../../hardhat/EtebaseContext';

const LOGIN_STYLE: React.CSSProperties = {
    overflow: "hidden",
    backgroundColor: "rgba(2, 128, 144, 0.5)",
    padding: "40px 30px 30px 30px",
    borderRadius: "10px",
    top: "50%",
    left: "50%",
    position: "absolute",
    transform: "translate(-50%, -50%)",
    boxShadow: "x-shadow: 5px 10px 10px rgba(rgba(2, 128, 144, 1), 0.2)",
    transition: "transform 300ms, box-shadow 300ms",
}

const INPUT_STYLE: React.CSSProperties = {
    display: "block",
    borderRadius: "5px",
    fontSize: "16px",
    backgroundColor: "white",
    width: "100%",
    border: 0,
    padding: "10px 10px",
    margin: "15px -10px",
    color: "rgba(2, 128, 144, 1)"
}

const BUTTON_STYLE: React.CSSProperties = {
    cursor: "pointer",
    color: "white",
    fontSize: "16px",
    textTransform: "uppercase",
    // width: "100%",
    border: 0,
    padding: "10px 15px",
    marginTop: "10px",
    marginLeft: "-10px",
    borderRadius: "5px",
    backgroundColor: "rgba(2, 128, 144, 1)",
    transition: "background-color 300ms"
}
export const RegisterEmail: React.FC<RegisterEmailProps> = ({ ...props }) => {
    const [submitting, setSubmitting] = useState(false);
    const submit = async () => {
        setSubmitting(true)
        try {
            props.onSubmit()
        } catch (error) {
            console.debug(error)
            setSubmitting(false)
        }
    }

    return (
        <div>
            <div className="login" style={LOGIN_STYLE}>
                <input className="etebase-input-email" onChange={(e) => props.setEmail(e.target.value)} name="email" type="text" placeholder="email..." style={INPUT_STYLE} disabled={submitting} />
                <button className="etebase-input-button" style={BUTTON_STYLE} onClick={(_) => submit()} disabled={submitting}>Create account</button>
            </div>
        </div>
    )
}