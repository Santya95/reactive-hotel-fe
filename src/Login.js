import React, { useState, useContext } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { FloatLabel } from "primereact/floatlabel";
import { AuthContext, ToastContext } from "./App";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";


const Login = (props) => {
    // ###############################################
    // STATI DEL COMPONENTE
    // ###############################################
    const [identifier, setIdentifier] = useState("");
    const [passwordLogin, setPasswordLogin] = useState("");
    const [usernameReg, setUsernameReg] = useState("");
    const [emailReg, setEmailReg] = useState("");
    const [firstNameReg, setFirstNameReg] = useState("");
    const [surnameReg, setSurnameReg] = useState("");
    const [passwordReg, setPasswordReg] = useState("");
    const [confirmPasswordReg, setConfirmPasswordReg] = useState("");
    const [checked, setChecked] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // CONTEXT E USEREF
    const { setUserInfo } = useContext(AuthContext);
    const toast = useContext(ToastContext);


    // ###############################################
    // FUNZIONI AUSILIARIE
    // ###############################################
    const getUserInitials = (firstNameReg, surname) => {
        return firstNameReg.charAt(0).toUpperCase() + surname.charAt(0).toUpperCase();
    }


    // ###############################################
    // HANDLERS
    // ###############################################
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            props.blockUiCallaback(true)
            const response = await fetch(`${process.env.REACT_APP_ENDPOINT}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: identifier,
                    password: passwordLogin,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                let userInitials = getUserInitials(data.firstName, data.surname);
                setUserInfo({ token: data.access_token, isLogged: true, userInitials: userInitials, firstName: data.firstName, surname: data.surname, bookings: data.bookings });
                sessionStorage.setItem("reactiveHoteluserInfo", JSON.stringify({ token: data.access_token, isLogged: true, userInitials: userInitials, firstName: data.firstName, surname: data.surname, bookings: data.bookings }));
                toast.current.show({ severity: "success", summary: "Login", detail: "Login avvenuto con successo", life: 3000 });
                props.blockUiCallaback(false)
                props.renderComponent('bookingPage')
            } else {
                toast.current.show({ severity: "error", summary: "Login", detail: data.error, life: 3000 });
                props.blockUiCallaback(false)
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.current.show({ severity: "error", summary: "Login", detail: "Errore durante il login", life: 3000 });
            props.blockUiCallaback(false)
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (passwordReg !== confirmPasswordReg) {
            toast.current.show({ severity: "error", summary: "Registrazione", detail: "Le password non corrispondono", life: 3000 });
            return;
        }
        try {
            props.blockUiCallaback(true)
            const response = await fetch(`${process.env.REACT_APP_ENDPOINT}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: firstNameReg,
                    surname: surnameReg,
                    email: emailReg,
                    username: usernameReg,
                    password: passwordReg
                }),
            });

            const data = await response.json();
            if (response.ok) {
                let userInitials = getUserInitials(data.firstName, data.surname);
                setUserInfo({ token: data.access_token, isLogged: true, userInitials: userInitials, firstName: data.firstName, surname: data.surname });
                sessionStorage.setItem("reactiveHoteluserInfo", JSON.stringify({ token: data.access_token, isLogged: true, userInitials: userInitials, firstName: data.firstName, surname: data.surname }));
                toast.current.show({ severity: "success", summary: "Registrazione", detail: "Registrazione avvenuta con successo, sei stato loggato", life: 3000 });
                props.blockUiCallaback(false)
                props.renderComponent('bookingPage')
            } else {
                toast.current.show({ severity: "error", summary: "Registrazione", detail: data.error, life: 3000 });
                props.blockUiCallaback(false)
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.current.show({ severity: "error", summary: "Registrazione", detail: "Errore durante la registrazione", life: 3000 });
            props.blockUiCallaback(false)
        }
    };


    // ###############################################
    // RENDERING
    // ###############################################
    const renderLogin = () => {
        return (
            <div className="flex align-items-center justify-content-center">
                <div className="flex mt-6 md:mt-0 flex-column align-items-center justify-content-center relative border-1 surface-border border-round shadow-2 fadein animation-duration-500 m-2 md:md-0 surface-0 p-5">
                    <div className={isRegistering ? "text-center -mt-4 md:mt-0 md:mb-5 mb-1" : "text-center mb-5"}>
                        <img src="/logo512.png" alt="hyper" height={100} />
                        <div className={isRegistering ? "text-900 text-5xl font-medium md:mb-5 mb-1" : "text-900 text-5xl font-medium mb-5"}>Hotel Reactive</div>
                        {isRegistering ? (
                            <>
                                <span className="text-600 font-medium line-height-3">Hai già un account?</span>
                                <a className="font-medium no-underline ml-2 text-blue-500 cursor-pointer" onClick={() => setIsRegistering(false)}>Accedi</a>
                            </>
                        ) : (
                            <>
                                <span className="text-600 font-medium line-height-3">Non hai un account?</span>
                                <a className="font-medium no-underline ml-2 text-blue-500 cursor-pointer"
                                    onClick={() => setIsRegistering(true)}>Crealo adesso!</a>
                            </>
                        )}
                    </div>

                    {isRegistering ? (
                        <form className="md:w-30rem -mt-2 md:mt-0" onSubmit={handleRegister}>
                            <div className="justify-content-center m-4">
                                <FloatLabel>
                                    <InputText id="name" className="w-full" required autoFocus maxLength={60} value={firstNameReg} onChange={(e) => setFirstNameReg(e.target.value)} />
                                    <label htmlFor="name">Nome</label>
                                </FloatLabel>
                            </div>
                            <div className="justify-content-center m-4">
                                <FloatLabel>
                                    <InputText id="surname" className="w-full" required maxLength={60} value={surnameReg} onChange={(e) => setSurnameReg(e.target.value)} />
                                    <label htmlFor="surname">Cognome</label>
                                </FloatLabel>
                            </div>
                            <div className="justify-content-center m-4">
                                <FloatLabel>
                                    <InputText id="email" className="w-full" required maxLength={80} value={emailReg} onChange={(e) => setEmailReg(e.target.value)} />
                                    <label htmlFor="email">Email</label>
                                </FloatLabel>
                            </div>
                            <div className="justify-content-center m-4">
                                <FloatLabel>
                                    <InputText id="username" className="w-full" required maxLength={60} value={usernameReg} onChange={(e) => setUsernameReg(e.target.value)} />
                                    <label htmlFor="username">Username</label>
                                </FloatLabel>
                            </div>
                            <div className="justify-content-center m-4">
                                <FloatLabel>
                                    <Password inputId="password" value={passwordReg} required className="w-full" maxLength={50} toggleMask pt={{ input: { className: "w-full" } }} onChange={(e) => setPasswordReg(e.target.value)} />
                                    <label htmlFor="password">Password</label>
                                </FloatLabel>
                            </div>

                            <div className="justify-content-center m-4">
                                <FloatLabel>
                                    <Password inputId="password" value={confirmPasswordReg} required className="w-full" maxLength={50} feedback={false} toggleMask pt={{ input: { className: "w-full" } }} onChange={(e) => setConfirmPasswordReg(e.target.value)} />
                                    <label htmlFor="password">Conferma Password</label>
                                </FloatLabel>
                            </div>

                            <div className={isRegistering ? "flex align-items-center justify-content-evenly md:mb-6 mb-1 -mt-2 md:mt-0" : "flex align-items-center justify-content-evenly mb-6"}>
                                <a className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">Hai dimenticato la password?</a>
                            </div>
                            <Button label="Registrati" icon="pi pi-user" className="w-full" type="submit" />
                        </form>
                    ) : (
                        <form className="md:w-30rem" onSubmit={handleLogin}>
                            <div className="justify-content-center m-4">
                                <FloatLabel>
                                    <InputText id="identifier" className="w-full" autoFocus required maxLength={50} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
                                    <label htmlFor="identifier">Email o Username</label>
                                </FloatLabel>
                            </div>
                            <div className="justify-content-center m-4">
                                <FloatLabel>
                                    <Password inputId="password" value={passwordLogin} required className="w-full" maxLength={50} feedback={false} toggleMask pt={{ input: { className: "w-full" } }} onChange={(e) => setPasswordLogin(e.target.value)} />
                                    <label htmlFor="password">Password</label>
                                </FloatLabel>
                            </div>
                            <div className="flex align-items-center justify-content-between mb-6">
                                <div className="flex align-items-center">
                                    <Checkbox id="rememberme" onChange={(e) => setChecked(e.checked)} checked={checked} className="mr-2" />
                                    <label htmlFor="rememberme">Ricordami</label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">Hai dimenticato la password?</a>
                            </div>
                            <Button label="Accedi" icon="pi pi-user" className="w-full" type="submit" />
                        </form>
                    )}
                    {!isRegistering ? <Button icon="pi pi-eye-slash" label="Continua come Ospite" className="w-full mt-2" severity="secondary" onClick={() => props.renderComponent('bookingPage')} /> : <></>}
                </div>
            </div>
        )
    }

    return (
        <>
            {renderLogin()}
        </>
    );
}

export default Login;
