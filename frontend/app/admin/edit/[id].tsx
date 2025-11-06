import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_URL } from "../../../config";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImagePickerAsset } from "expo-image-picker";

export default function EditUserScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [avatar, setAvatar] = useState<ImagePickerAsset | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_URL}/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setUsername(res.data.username);
      setEmail(res.data.email);
      setRole(res.data.role);
    };
    fetchUser();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Cần quyền truy cập thư viện ảnh!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) setAvatar(result.assets[0]);
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("role", role);

      if (avatar) {
        const response = await fetch(avatar.uri);
        const blob = await response.blob();
        formData.append("avatar", blob, "avatar.jpg");
      }

      const token = await AsyncStorage.getItem("token");
      await axios.put(`${API_URL}/auth/users/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data, headers) => data,
      });

      Alert.alert(" Cập nhật thành công!");
      router.replace("/admin");
    } catch (err: any) {
      console.error("Lỗi cập nhật:", err);
      Alert.alert(" Lỗi", err.response?.data?.message || "Không thể cập nhật");
    }
  };

  if (!user)
    return (
      <Text style={{ textAlign: "center", marginTop: 50 }}>Đang tải...</Text>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sửa thông tin người dùng</Text>

      <TouchableOpacity onPress={pickImage}>
        {avatar ? (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
        ) : user.avatar ? (
          <Image
            source={{ uri: `${API_URL.replace("/api", "")}${user.avatar}` }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text>Chọn ảnh</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Vai trò (user hoặc admin)"
        value={role}
        onChangeText={setRole}
      />

      <Button title="Cập nhật" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 15,
  },
  avatarPlaceholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
});
