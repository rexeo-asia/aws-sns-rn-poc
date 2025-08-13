import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={{styles.safe}}>
      <Text style={{styles.title}}>Notifications</Text>
      <View style={{styles.card}}>
        <Text style={{styles.cardText}}>You have no new notifications 📭</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {{
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 20,
    paddingTop: 10,
  }},
  title: {{
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 20,
  }},
  card: {{
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {{ width: 0, height: 5 }},
    elevation: 3,
  }},
  cardText: {{
    fontSize: 16,
    color: "#333",
  }},
});
