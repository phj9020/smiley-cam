import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import styled from "styled-components/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

const CenterView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: cornflowerblue;
`;

const Text = styled.Text`
  color: white;
  font-size: 18px;
`;

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      if (status === "granted") {
        setHasPermission(status === "granted");
      } else {
        setHasPermission(status === false);
      }
    })();
  }, []);

  const reverseCamera = () => {
    if (cameraType === Camera.Constants.Type.front) {
      setCameraType(Camera.Constants.Type.back);
    } else if (cameraType === Camera.Constants.Type.back) {
      setCameraType(Camera.Constants.Type.front);
    }
  };
  console.log(hasPermission);

  if (hasPermission === true) {
    return (
      <CenterView>
        <Camera
          style={{
            width: WIDTH - 40,
            height: HEIGHT / 1.5,
            marginBottom: 50,
          }}
          type={cameraType}
        />
        <TouchableOpacity onPress={reverseCamera}>
            <MaterialCommunityIcons
              name={cameraType === Camera.Constants.Type.front ? "camera-rear" : "camera-front"}
              size={50}
              color="white"
            />
        </TouchableOpacity>
      </CenterView>
    );
  } else if (hasPermission === false) {
    return (
      <CenterView>
        <Text>No access to camera</Text>
      </CenterView>
    );
  } else {
    return (
      <CenterView>
        <ActivityIndicator size="large" color="#00ff00" />
      </CenterView>
    );
  }
}
