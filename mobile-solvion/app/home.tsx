import { View, Text, Button, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';


export default function HomeScreen() {
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
   
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selamat Datang!</Text>
      <Text style={styles.text}>Anda berhasil login.</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 30,
  },
});