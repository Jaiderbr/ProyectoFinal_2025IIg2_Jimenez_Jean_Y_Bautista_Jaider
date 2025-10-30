// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../Firebase/config";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // estado local
  const [user, setUser] = useState(null);        // objeto auth de Firebase (uid, email, etc.)
  const [userData, setUserData] = useState(null); // documento 'Usuarios' con rol, name
  const [loading, setLoading] = useState(true);  // evita renders prematuros (flicker)

  useEffect(() => {
    
    // Subscrición principal: escucha cambios en la sesión de Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser); // guarda el objeto user de Firebase Auth

        // Traer datos adicionales desde Firestore (perfil, rol, etc.)
        const userDocRef = doc(db, "Usuarios", firebaseUser.uid);

        // opción A: lectura única
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData(null);
        }

        // opción B (alternativa): escucha en tiempo real si quieres reaccionar
        // const unsubscribeDoc = onSnapshot(userDocRef, (snap) => {
        //   if (snap.exists()) setUserData(snap.data());
        //   else setUserData(null);
        // });

      } else {
        // no hay usuario logeado
        setUser(null);
        setUserData(null);
      }
      setLoading(false); // ya terminó la inicialización
    });

    // cleanup: desuscribirse al desmontar
    return () => {
      unsubscribeAuth();
      // if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged resolverá lo demás (setUser null etc.)
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
