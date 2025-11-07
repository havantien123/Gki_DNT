import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Trang chủ" }} />
      <Stack.Screen name="login" options={{ title: "Đăng nhập" }} />
      <Stack.Screen name="register" options={{ title: "Đăng ký" }} />
      <Stack.Screen name="profile" options={{ title: "Hồ sơ" }} />
      <Stack.Screen name="admin" options={{ title: "Quản lý" }} />
    </Stack>
  );
}
