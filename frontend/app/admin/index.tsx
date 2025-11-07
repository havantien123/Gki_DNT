import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  Image,
  StyleSheet,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, BASE_URL } from "../../config";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function AdminScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    console.log("Đã gọi handleDelete với ID:", id);
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Token:", token);

      if (!token) {
        console.log("Không tìm thấy token");
        return;
      }

      const response = await axios.delete(`${API_URL}/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      console.log("Delete response:", response.data);
      fetchUsers();
    } catch (error: any) {
      console.log("Full error:", error);
      console.error("Delete error:", error.response?.data || error.message);
    }
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        {item.avatar ? (
          <Image
            source={{ uri: `${BASE_URL}${item.avatar}` }}
            style={styles.avatar}
          />
        ) : null}
        <View>
          <Text>Username: {item.username}</Text>
          <Text>Email: {item.email}</Text>
          <Text>Role: {item.role}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Sửa"
          onPress={() => {
            console.log("ID truyền đi:", item._id);
            router.push(`/admin/edit/${item._id}` as any);
          }}
        />
        <View style={{ width: 8 }} />
        <Button
          title="Xóa"
          color="red"
          onPress={() => {
            console.log("Bấm nút XÓA");
            setConfirmId(item._id);
          }}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title="Thêm người dùng mới"
        onPress={() => router.push("/admin/add" as any)}
      />
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
      />

      <Modal visible={!!confirmId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ marginBottom: 10 }}>
              Bạn có chắc muốn xóa người dùng này?
            </Text>
            <View style={styles.buttonRow}>
              <Button title="Hủy" onPress={() => setConfirmId(null)} />
              <View style={{ width: 10 }} />
              <Button
                title="Xóa"
                color="red"
                onPress={() => {
                  if (confirmId) {
                    handleDelete(confirmId);
                    setConfirmId(null);
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  list: {
    marginTop: 10,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
