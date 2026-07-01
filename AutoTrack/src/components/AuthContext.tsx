import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../database/firebaseConfig';
import { getMechanicById, Mechanic } from '../features/mechanics/mechanicModel';

interface AuthContextType {
  user: User | null;
  userProfile: Mechanic | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Mechanic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (currentUser.isAnonymous) {
          console.log("Anonymous user detected. Signing out...");
          signOut(auth);
          setUserProfile(null);
          setIsLoading(false);
          return;
        }
        
        try {
          const profile = await getMechanicById(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
