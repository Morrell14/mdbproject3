import React, { useState, useEffect  } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { Appbar, Card, Text } from 'react-native-paper';

import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../../models/social.js";
import { getFirestore, doc, onSnapshot, collection, query, orderBy } from "firebase/firestore"; 
import { styles } from "./FeedScreen.styles";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../MainStackScreen.js";
import { SafeAreaView } from "react-native-safe-area-context";

/* HOW TYPESCRIPT WORKS WITH PROPS:

  Remember the navigation-related props from Project 2? They were called `route` and `navigation`,
  and they were passed into our screen components by React Navigation automatically.  We accessed parameters 
  passed to screens through `route.params` , and navigated to screens using `navigation.navigate(...)` and 
  `navigation.goBack()`. In this project, we explicitly define the types of these props at the top of 
  each screen component.

  Now, whenever we type `navigation.`, our code editor will know exactly what we can do with that object, 
  and it'll suggest `.goBack()` as an option. It'll also tell us when we're trying to do something 
  that isn't supported by React Navigation! */

interface Props {
  navigation: StackNavigationProp<MainStackParamList, "FeedScreen">;
}

export default function FeedScreen({ navigation }: Props) {
  // TODO: Initialize a list of SocialModel objects in state.
  const[SocialModelInstances, setSocials ] = useState<SocialModel[]>([])

  /* TYPESCRIPT HINT: 
    When we call useState(), we can define the type of the state
    variable using something like this:
        const [myList, setMyList] = useState<MyModelType[]>([]); */

  /*
    TODO: In a useEffect hook, start a Firebase observer to listen to the "socials" node in Firestore.
    Read More: https://firebase.google.com/docs/firestore/query-data/listen
  
    Reminders:
      1. Make sure you start a listener that's attached to this node!
      2. The onSnapshot method returns a method. Make sure to return the method
          in your useEffect, so that it's called and the listener is detached when
          this component is killed. 
          Read More: https://firebase.google.com/docs/firestore/query-data/listen#detach_a_listener
      3. You'll probably want to use the .orderBy method to order by a particular key.
      4. It's probably wise to make sure you can create new socials before trying to 
          load socials on this screen.
  */

          useEffect(() => {
            // Create a reference to the "socials" collection
            const socialsRef = collection(getFirestore(), "socials");
        
            // Create a query for the socials collection, ordered by a particular key
            const q = query(socialsRef, orderBy("eventName")); // Assuming "createdAt" is the field to order by
        
            // Subscribe to the query snapshot changes
            const unsubscribe = onSnapshot(q, (snapshot) => {
              const socialsData: SocialModel[] = [];
              snapshot.forEach((doc) => {
                const social = doc.data() as SocialModel;
                socialsData.push(social);
              });
              setSocials(socialsData);
            });
        
            // Return a cleanup function to unsubscribe from the snapshot listener
            return () => unsubscribe();
          }, []); // Empty dependency array means this effect runs once after the first render
        
   
   

  const renderItem = ({ item }: { item: SocialModel }) => {
     // TODO: Return a Card corresponding to the social object passed in
    // to this function. On tapping this card, navigate to DetailScreen
    // and pass this social.


    
    return (
 
      <SafeAreaView> 
        <Card 
        mode = "outlined"
        onPress={() => navigation.navigate("DetailScreen", { social: item })}>
        <Card.Cover source={{ uri: item.eventImage }} />
        <Card.Title title={item.eventName} subtitle = <Text> {item.eventLocation} {new Date(item.eventDate).toLocaleDateString()} </Text> />
        </Card>
        </SafeAreaView>
    );
  };

  const NavigationBar = () => {
    // TODO: Return an AppBar, with a title & a Plus Action Item that goes to the NewSocialScreen.
    return (  
      <View>
        <Appbar.Header style={{ backgroundColor: '#FDAE44' }}>
        <Appbar.Content title= "Socials" />
        <Appbar.Action icon="plus" onPress={() => navigation.navigate("NewSocialScreen")} />
        </Appbar.Header>
    </View>
    );
  };

  return (
    <>
      {NavigationBar()}
      <FlatList
        data={SocialModelInstances}
        renderItem={renderItem}
        keyExtractor={(item) => item.id} 
      />
    </>
  );
}
