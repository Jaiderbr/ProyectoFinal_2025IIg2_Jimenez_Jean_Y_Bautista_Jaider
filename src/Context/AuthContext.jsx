import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../Firebase/config";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const userDocRef = doc(db, "Usuarios", firebaseUser.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                } else {
                    setUserData(null);
                }

            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });
        return () => {
            unsubscribeAuth();
        };
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
