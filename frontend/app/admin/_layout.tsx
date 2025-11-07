import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminLayout() {
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const user = await AsyncStorage.getItem("user");
    if (!user || JSON.parse(user).role !== "admin") {
      router.replace("/login");
    }
  };

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Quản lý người dùng",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen name="add" options={{ title: "Thêm người dùng mới" }} />
      <Stack.Screen
        name="edit/[id]"
        options={{ title: "Sửa thông tin người dùng" }}
      />
    </Stack>
  );
}
