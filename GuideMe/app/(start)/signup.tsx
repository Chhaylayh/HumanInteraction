import { useContext, useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../universalStyles";
import { AuthContext } from "../_layout";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth, db } from "@/firebase";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authContext = useContext(AuthContext);

  const handleSignUp = () => {
    // Simple validation
    if (email === "" || password === "" || !email.includes('@')) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed up
        const user = userCredential.user;
        const username = user.displayName;
        try {
          const docRef = await setDoc(doc(collection(db, "users"), user.uid), {
            uid: user.uid,
            username: user.email?.split("@")[0],
            accountDate: new Date(),
            inProgress: [],
            contributed: [],
            relevantApps: [],
            score: 0,
          });
          console.log("Document written with ID: ", docRef);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
        // Navigate to profile with the username passed as a parameter
        authContext?.setLoggedIn(user);
      })
      .catch((error) => {
        Alert.alert("Error", "Please try again");
        console.error(error);
      });
  };
  const handleLogin = () => {
    router.push({ pathname: "/login" });
  };

  return (
    <View style={styles.container}>
      {/* Welcome Message */}
      <Text style={styles.titleBlue}>Get Started!</Text>

      {/* Username Label */}
      <Text style={styles.inputLabel}>Username</Text>
      <TextInput
        placeholder="Enter your username"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      {/* Password Label */}
      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* Log In Button */}
      <Pressable style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>

      <Text style={[styles.inputLabel, { marginTop: 50 }]}>
        Already have an account?{" "}
      </Text>
      {/* Sign Up Button */}
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </Pressable>
    </View>
  );
}
