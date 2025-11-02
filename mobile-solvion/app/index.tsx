import { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, TextInput, Button, Text, Platform } from 'react-native';
import { supabase } from '../lib/supabase';


import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const redirectUrl = makeRedirectUri({
    scheme: Platform.OS === 'web' ? undefined : 'mobilesolvion',
    path: 'auth/callback',
  });

  useEffect(() => {
    console.log('🔗 Redirect URL (final):', redirectUrl);
  }, [redirectUrl]);


  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'dummy',
      scopes: ['read:user', 'user:email'],
      redirectUri: redirectUrl,
    },
    {

      async getAuthorizeUrl(config) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: config.redirectUri,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          Alert.alert('Error (getAuthorizeUrl)', error.message);
          console.error('❌ Supabase OAuth error:', error);
          return '';
        }

        console.log('✅ GitHub Auth URL:', data.url);
        return data.url;
      },
    }
  );

  useEffect(() => {
    const handleAuthResponse = async () => {
      if (!response) return;

      setLoading(true);

      if (response.type === 'success' && response.params?.code) {
        console.log('✅ Received auth code:', response.params.code);
        const { error } = await supabase.auth.exchangeCodeForSession(response.params.code);
        if (error) {
          Alert.alert('Error (exchangeCode)', error.message);
        }
      } else if (response.type === 'error') {
        Alert.alert('Error (AuthSession)', response.error?.message || 'Login dibatalkan.');
      }

      setLoading(false);
    };

    handleAuthResponse();
  }, [response]);

  async function signInWithGitHub() {
    try {
      setLoading(true);
      const result = await promptAsync();
      if (result.type === 'dismiss') {
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ signInWithGitHub error:', err);
      Alert.alert('Error', 'Gagal membuka halaman login GitHub.');
      setLoading(false);
    }
  }


  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error', error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Error', error.message);
    if (!session) Alert.alert('Sukses', 'Silakan cek email Anda untuk verifikasi!');
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Solvion Medsos</Text>
      <Text style={styles.description}>Login atau Register untuk melanjutkan.</Text>

      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="email@address.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        placeholder="Password (min. 6 karakter)"
        autoCapitalize="none"
      />

      <View style={styles.buttonContainer}>
        <Button title={loading ? 'Loading...' : 'Login'} onPress={signInWithEmail} disabled={loading} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title={loading ? 'Loading...' : 'Register'} onPress={signUpWithEmail} disabled={loading} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? 'Loading...' : 'Sign in with GitHub'}
          onPress={signInWithGitHub}
          disabled={loading || !request}
          color="#333333"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: { marginTop: 10 },
});
