import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import io from "socket.io-client";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase config (replace with your details)
const firebaseConfig = {

    apiKey: "AIzaSyB7DIVpwsaLzIfz5EFQN90nuyueNfNh41E",
  
    authDomain: "fir-test-c1f02.firebaseapp.com",
  
    databaseURL: "https://fir-test-c1f02-default-rtdb.firebaseio.com",
  
    projectId: "fir-test-c1f02",
  
    storageBucket: "fir-test-c1f02.firebasestorage.app",
  
    messagingSenderId: "411129309840",
  
    appId: "1:411129309840:web:1a70ab8a5bc22920bf8615"
  
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const socket = io("http://localhost:3000");

export default function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    // Fetch messages from Firestore
    const loadMessages = async () => {
      const querySnapshot = await getDocs(collection(db, "messages"));
      const loadedMessages = querySnapshot.docs.map(doc => doc.data());
      setMessages(loadedMessages);
    };
    loadMessages();
  },[]);

  const sendMessage = () => {
    socket.emit("message", { text: message });
    setMessage("");
  };

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text>{item.text}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
      <TextInput value={message} onChangeText={setMessage} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}
