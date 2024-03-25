import * as Permissions from "expo-permissions";

export async function requestLocationPermission() {
  const { status } = await Permissions.askAsync(Permissions.MOTION);
  if (status !== "granted") {
    alert("Permission to access location was denied");
  }
}
