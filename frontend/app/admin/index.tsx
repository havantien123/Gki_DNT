import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../config";
import { useRouter } from "expo-router";

export default function AdminScreen() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  const fetchUsers = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.get(`${API_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  };

  const deleteUser = async (id: string) => {
    const token = await AsyncStorage.getItem("token");
    await axios.delete(`${API_URL}/auth/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Alert.alert("Xóa thành công!");
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Quản lý người dùng
      </Text>

      {/* ✅ Nút thêm người dùng */}
      <View style={{ marginBottom: 15 }}>
        <Button
          title="➕ Thêm người dùng"
          onPress={() => router.push("/admin/create")}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#ddd",
            }}
          >
            <Text>
              {item.username} ({item.role})
            </Text>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <View style={{ marginRight: 10 }}>
                <Button
                  title="✏️ Sửa"
                  onPress={() =>
                    router.push({
                      pathname: "/admin/edit/[id]",
                      params: { id: item._id },
                    })
                  }
                />
              </View>
              <Button
                title="🗑️ Xóa"
                color="#e74c3c"
                onPress={() => deleteUser(item._id)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
