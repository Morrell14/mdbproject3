import React, { useState, useEffect } from "react";
import { Platform, View } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { getFileObjectAsync, uuid } from "../../../Utils";
import {ActivityIndicator} from 'react-native';

// See https://github.com/mmazzarolo/react-native-modal-datetime-picker
// Most of the date picker code is directly sourced from the example.
import DateTimePickerModal from "react-native-modal-datetime-picker";
// See https://docs.expo.io/versions/latest/sdk/imagepicker/
// Most of the image picker code is directly sourced from the example.
import * as ImagePicker from "expo-image-picker";
import { styles } from "./NewSocialScreen.styles";

import firebase from "firebase/app";
import "firebase/firestore";
import { doc, setDoc } from "firebase/firestore"; 
//import { getStorage, ref, uploadBytes } from "firebase/storage";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { SocialModel } from "../../../models/social";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackScreen";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "NewSocialScreen">;
}

export default function NewSocialScreen({ navigation}: Props) {
  /* TODO: Declare state variables for all of the attributes 
           that you need to keep track of on this screen.
    
     HINTS:

      1. There are five core attributes that are related to the social object.
      2. There are two attributes from the Date Picker.
      3. There is one attribute from the Snackbar.
      4. There is one attribute for the loading indicator in the submit button.

  */

  // TODO: Follow the Expo Docs to implement the ImagePicker component.
  // https://docs.expo.io/versions/latest/sdk/imagepicker/

  // TODO: Follow the GitHub Docs to implement the react-native-modal-datetime-picker component.
  // https://github.com/mmazzarolo/react-native-modal-datetime-picker

  // TODO: Follow the SnackBar Docs to implement the Snackbar component.
  // https://callstack.github.io/react-native-paper/snackbar.html

  // TODO: Validate all fields (hint: field values should be stored in state variables).
    // If there's a field that is missing data, then return and show an error
    // using the Snackbar.
    // NOTE: THE BULK OF THIS FUNCTION IS ALREADY IMPLEMENTED FOR YOU IN HINTS.TSX.
      // READ THIS TO GET A HIGH-LEVEL OVERVIEW OF WHAT YOU NEED TO DO, THEN GO READ THAT FILE!
      // (0) Firebase Cloud Storage wants a Blob, so we first convert the file path
      // saved in our eventImage state variable to a Blob.
      // (1) Write the image to Firebase Cloud Storage. Make sure to do this
      // using an "await" keyword, since we're in an async function. Name it using
      // the uuid provided below.
      // (2) Get the download URL of the file we just wrote. We're going to put that
      // download URL into Firestore (where our data itself is stored). Make sure to
      // do this using an async keyword.
      // (3) Construct & write the social model to the "socials" collection in Firestore.
      // The eventImage should be the downloadURL that we got from (3).
      // Make sure to do this using an async keyword.
      // (4) If nothing threw an error, then go back to the previous screen.
      //     Otherwise, show an error.

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const [image, setImage] = useState("");
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = useState(false);


  const onToggleSnackBar = () => {
    setLoading(true); 
    setVisible(!visible); 
  };
  
  const onDismissSnackBar = () => {
    setVisible(false); 
    setLoading(false);
  };

  const showDatePicker = () => {
    
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: any) => {
    console.warn("A date has been picked: ", date);
    setSelectedDate(date.getTime())
    hideDatePicker();
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveEvent = async () => {
    try {
      // Validate all fields
      setLoading(true);
      if (!name || !location || !description || !selectedDate || !image) {
        setVisible(true);
        setLoading(false);
        return;
      }
  
      // Convert file path to Blob
      const object = await getFileObjectAsync(image);
      // Get Firestore and Storage references
      const db = getFirestore();
      const storage = getStorage();
      const storageRef = ref(storage, uuid() + ".jpg");
      // Upload image to Cloud Storage
      const result = await uploadBytes(storageRef, object as Blob);
      // Get download URL of the uploaded image
      const downloadURL = await getDownloadURL(result.ref);
      // Construct social document
      const socialDoc = {
        eventName: name,
        eventLocation: location,
        eventDescription: description,
        eventDate: selectedDate,
        eventImage: downloadURL
      };
  
      // Write social document to Firestore
      await addDoc(collection(db, "socials"), socialDoc);
      console.log("Finished social creation.");
      navigation.goBack();

    } catch (error) {
      // Handle errors
      console.error("Error saving event:", error);
  
    }
  };

  

  const Bar = () => {
    return (
      // I changed header style , first line
      <Appbar.Header style={{backgroundColor: "#FDAE44"}}>
        <Appbar.Action onPress={navigation.goBack} icon="close" />
        <Appbar.Content title="Socials" />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={{ ...styles.container, padding: 20 }}>
        <TextInput
          label="Event name"
          style={{ marginBottom: 20 }} // Add marginBottom for space
          value={name}
          onChangeText={name => setName(name)}
        />
        <TextInput
          label="Event location"
          style={{ marginBottom: 20 }} // Add marginBottom for space
          value={location}
          onChangeText={location => setLocation(location)}
          
        />
        <TextInput
          label="Event description"
          style={{ marginBottom: 20 }} // Add marginBottom for space
          value={description}
          onChangeText={description => setDescription(description)}
        />

        <View>
          <Button mode="outlined" color="#FDAE44" onPress={showDatePicker}>
          {selectedDate ? new Date(selectedDate).toLocaleString() : 'CHOOSE A DATE'}
          </Button>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            display = "inline"
          />
        </View> 

        <Button
          style={{ marginTop: 20 }}
          mode="outlined"
          color="#FDAE44"
          onPress={pickImage}
        >
          {image ? 'CHANGE IMAGE' : 'PICK AN IMAGE'} 
        </Button>

        <Button
          style={{ marginTop: 20, elevation: 0 }}
          mode="contained"
          color="#FDAE44"
          onPress={saveEvent}> 
          
          
        {loading ? ( 
          <ActivityIndicator color="white" /> 
        ) : (
          'SAVE THE DATE'
        )}
        </Button>

        <Snackbar
            visible={visible}
            onDismiss={onDismissSnackBar}
            action={{
              label: 'Undo',
            }}>
            Error, Make sure you filled out everything
        </Snackbar>   
          
       {/* DateTimePickerModal */}
       {/* Snackbar */}
       

      </View>
    </>
    
  );
}