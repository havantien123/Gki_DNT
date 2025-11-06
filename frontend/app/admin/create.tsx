import React, { useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import { useRouter } from "expo-router";
import { ImagePickerAsset } from "expo-image-picker";

export default function CreateUserScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [avatar, setAvatar] = useState<ImagePickerAsset | null>(null);
  const router = useRouter();

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

  const handleCreate = async () => {
    if (!username || !email || !password) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);

      if (avatar) {
        // For Expo / React Native form uploads append an object with uri/name/type
        (formData as any).append("avatar", {
          uri: avatar.uri,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any);
      }

      const token = await AsyncStorage.getItem("token");
      await axios.post(`${API_URL}/auth/users`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Do not set Content-Type manually so axios can add the correct boundary
        },
      });

      Alert.alert(" Tạo người dùng thành công!");
      router.replace("/admin");
    } catch (err: any) {
      console.error("Lỗi tạo user:", err);
      Alert.alert(
        " Lỗi",
        err.response?.data?.message || "Không thể tạo người dùng"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo người dùng mới</Text>

      <TouchableOpacity onPress={pickImage}>
        {avatar ? (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
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
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Vai trò (user hoặc admin)"
        value={role}
        onChangeText={setRole}
      />

      <Button title="Tạo người dùng" onPress={handleCreate} />
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
