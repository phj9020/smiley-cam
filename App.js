import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Dimensions, TouchableOpacity, View } from "react-native";
import { Camera } from "expo-camera";
import styled from "styled-components/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Permissions from 'expo-permissions';
import * as FaceDetector from "expo-face-detector";
import * as MediaLibrary from 'expo-media-library';
import { MEDIA_LIBRARY } from "expo-permissions";

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
  const [smileDetected, setSmileDetected] = useState(false);
  const [smilePercentage, setSmilePercentage] = useState(0)
  const cameraRef = useRef();

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
  
  const onFacesDetected = ({faces}) => {
    const face = faces[0];
    if(face) {
      setSmilePercentage(face.smilingProbability);
      if(face.smilingProbability > 0.7) {
        setSmileDetected(true)
        // take pick
        takePhoto();
      }
    }
  }

  const takePhoto = async () => {
    try{
      if(cameraRef.current) {
        // photo.uri 
        let {uri} = await cameraRef.current.takePictureAsync({quality: 1});

        if(uri) {
          savePhoto(uri);
        }
      }
    } catch (error) {
      alert(error);
      setSmileDetected(false)
    }
  }

  // move photo in temporary to local phone
  const savePhoto = async (uri) => {
    try{
        //permissions ask
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if(status === "granted") {
          // take photo 
          const asset = await MediaLibrary.createAssetAsync(uri);
          // find album
          let album = await MediaLibrary.getAlbumAsync('Smiley-Cam');
          
          // album 이 없으면 만들자
          if(album === null) {
            album = await MediaLibrary.createAlbumAsync('Smiley-Cam', asset);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album.id);
          }

          setSmileDetected(false);
        } else {
          setHasPermission(status === false);
        }
      // create asset 
    
    } catch(error) {
      console.log(error)
    }
  }
 
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
          onFacesDetected={smileDetected ? null : onFacesDetected}
          faceDetectorSettings={{
            mode: FaceDetector.Constants.Mode.fast,
            detectLandmarks: FaceDetector.Constants.Landmarks.all,
            runClassifications: FaceDetector.Constants.Classifications.all
          }}
          ref={cameraRef}
        />
        <TouchableOpacity onPress={reverseCamera}>
            <MaterialCommunityIcons
              name={cameraType === Camera.Constants.Type.front ? "camera-rear" : "camera-front"}
              size={50}
              color="white"
            />
        </TouchableOpacity>
        <Text style={{marginTop:20}}>Smile Gauge {String(smilePercentage*100).slice(0,1)} %</Text>
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
