import React, { useState, useRef, createContext } from "react";
import { Toast } from 'primereact/toast';

import MainArea from "./MainArea";


// Creo un Context per gestire l'autenticazione e lo passo come value al Provider
export const AuthContext = createContext();
// Creo un Context per gestire le notifiche toast uniformemente per l'intera appllicazione e lo passo come value al Provider
export const ToastContext = createContext();


const App = () => {
  const [userInfo, setUserInfo] = useState(sessionStorage.getItem("reactiveHoteluserInfo") ? JSON.parse(sessionStorage.getItem("reactiveHoteluserInfo")) : { token: "", isLogged: false, userInitials: "", firstName: "", surname: "", bookings: [] });
  const toast = useRef(null);

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo }}>
      <ToastContext.Provider value={toast}>
        <div className="App">
          <Toast ref={toast} position="top-center" />
          <MainArea />
        </div>
      </ToastContext.Provider>
    </AuthContext.Provider >
  );
}

export default App;
