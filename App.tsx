import React, {useEffect, useState} from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {StripeProvider, usePaymentSheet} from '@stripe/stripe-react-native';

type Props = {};

const App = (props: Props) => {
  const [ready, setReady] = useState<boolean>(false);
  const {presentPaymentSheet, initPaymentSheet, loading} = usePaymentSheet();

  useEffect(() => {
    initialisePaymentSheet();
  }, []);

  const customAppearance = {
    font: {},
    shapes: {
      borderRadius: 12,
      borderWidth: 0.5,
    },
    primaryButton: {
      shapes: {
        borderRadius: 100,
      },
    },
    colors: {
      primary: '#000000',
      background: '#ffffff',
      componentBackground: '#f3f8fa',
      componentBorder: '#999999',
      componentDivider: '#000000',
      primaryText: '#000000',
      secondaryText: '#000000',
      componentText: '#000000',
      placeholderText: '#73757b',
    },
  };

  const initialisePaymentSheet = async () => {
    const paymentIntent = await fetchPaymentSheetParams();
    const {error: paymentSheetError} = await initPaymentSheet({
      merchantDisplayName: 'Example, Inc.',
      paymentIntentClientSecret: paymentIntent,
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: 'Tauqeer',
      },
      googlePay: {
        merchantCountryCode: 'US',
        testEnv: true, // use test environment
      },
      appearance: customAppearance,
    });
    if (paymentSheetError) {
      Alert.alert('Something went wrong', paymentSheetError.message);
      return;
    } else {
      setReady(true);
    }
  };

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(
      'http://stripeback.netlify.app/.netlify/functions/payments/intent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 17950,
        }),
      },
    );
    const {paymentIntent} = await response.json();
    return paymentIntent;
  };

  async function buy() {
    const {error} = await presentPaymentSheet();
    if (error) {
      Alert.alert(`Error Code ${error.code}`, error.message);
    } else {
      Alert.alert('Success', 'The payment was confirmed Successfully');
      setReady(false);
    }
  }

  return (
    <StripeProvider publishableKey="pk_test_51ME4hvCJpCL8QUhka83Gj65RxJqlwVfoqGJNmyqnPtVKg5vyZLmfkq6A0iThknBzErBKMjBP0e9wJI6nXIGPLyAV00xL7mNi2u">
      <View style={styles.container}>
        <Text>React Native Stripe</Text>
        <TouchableOpacity
          style={[
            styles.button,
            (loading || !ready) && {backgroundColor: '#878'},
          ]}
          activeOpacity={0.8}
          onPress={buy}
          disabled={loading || !ready}>
          <Text style={styles.text}>Pay</Text>
        </TouchableOpacity>
      </View>
    </StripeProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#000',
    paddingBottom: 12,
    paddingTop: 12,
    width: 300,
    borderRadius: 4,
    color: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    alignSelf: 'center',
  },
});
