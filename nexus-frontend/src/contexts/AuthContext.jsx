import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "firebase/auth";
import api from "../services/api";

const AuthContext = createContext();

// 🛑 ADD YOUR TWO ADMIN EMAILS HERE
export const ADMIN_EMAILS = ["rishichothe@gmail.com", "omchauhan0505@gmail.com"];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Register a new Client
  const registerClient = async (name, email, password) => {
    // Creates the user securely in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Attaches their name to their profile
    await updateProfile(userCredential.user, { displayName: name });

    // Saves them directly to your live Firestore Database as a Client!
    await api.post('/clients', {
      uid: userCredential.user.uid,
      name: name,
      email: email,
      plan: "Pending Request",
      mrr: 0,
      campaigns: 0,
      since: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      avatar: name.charAt(0).toUpperCase()
    });

    return userCredential;
  };

  // 2. Login an existing user
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 3. Login with Google
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if this is a new user by checking creation time vs last sign in
    const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

    if (isNewUser && !ADMIN_EMAILS.includes(user.email)) {
      // Auto-register as a client in Firestore
      try {
        await api.post('/clients', {
          uid: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          plan: "Pending Request",
          mrr: 0,
          campaigns: 0,
          since: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          avatar: (user.displayName || 'U').charAt(0).toUpperCase()
        });
      } catch (err) {
        console.error("Client auto-register failed (may already exist):", err);
      }
    }

    return result;
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

  const value = {
    currentUser,
    isAdmin,
    registerClient,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);