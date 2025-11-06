import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Alert, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_URL, BASE_URL } from "../config";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Fetch profile error:", err);
        Alert.alert("Phiên đăng nhập hết hạn");
        router.replace("/login");
      }
    };
    fetchProfile();
  }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    router.replace("/login");
  };

  if (!user)
    return (
      <Text style={{ textAlign: "center", marginTop: 50 }}>Đang tải...</Text>
    );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/*  Hiển thị avatar nếu có */}
        {user.avatar ? (
          <Image
            source={{ uri: `${BASE_URL}${user.avatar}` }}
            style={styles.avatar}
          />
        ) : null}

        <Text style={styles.name}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>Role: {user.role}</Text>

        {user.role === "admin" && (
          <View style={styles.button}>
            <Button
              title=" Quản lý người dùng"
              onPress={() => router.push("/admin")}
            />
          </View>
        )}

        <View style={styles.button}>
          <Button title="Đăng xuất" color="#e74c3c" onPress={logout} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  email: { fontSize: 16, color: "#555", marginBottom: 5 },
  role: { fontSize: 16, color: "#888", marginBottom: 15 },
  button: { width: "100%", marginTop: 10 },
});
