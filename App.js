import * as React from 'react';
import { AppLoading, SplashScreen } from 'expo';
import { Text, TextInput, View, Image, FlatList, TouchableHighlight, Alert, StyleSheet, Button, Vibration } from 'react-native';
import { Asset } from 'expo-asset';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { NumberFormat } from 'react-number-format';
// import { CurrencyFormat } from 'react-currency-format';
import { SearchCommand } from './app/hcl/commerce/v9/search/SearchCommand';
import { StoreCommand } from './app/hcl/commerce/v9/store/StoreCommand';

import QRCode from 'react-native-qrcode-svg';

const PROTOCOL = 'http';
const HOSTNAME = '206.198.144.241';
const STORE_API_PORT = 4443;
const SEARCH_API_PORT = 7738;
const STOREFRONT_PORT = 8843;
const STORE_ID = 1;
const IMG_URI= PROTOCOL+'://'+HOSTNAME+':'+STOREFRONT_PORT;

export default class BarcodeScannerExample extends React.Component {
  
  state = {
    isSplashReady: false,
    isAppReady: false,
  }

  constructor(props){
    super(props);
    this.state = {
        hasCameraPermission: null,
        scanned: false,

        isUserAuthenticated: false,
        userName: '',
        password: '',
        firstName: null,
        lastName: null,
        billingAddressId: null,
        shippingAddressId: null,
        preferredPaymentMethodId: 'COD',
        
        latitude: 0,
        longitude: 0,
        
        isLoading: true,
        scannedProductData: null,
        barcode: null,
        error:'',
        
        userId: -1,
        WCToken: null,
        WCTrustedToken: null,
        personalizationID: null,
        
        orderId: '.',
        orderItemId: 0,
        shoppingCartData: null,
        grandTotal: 0,
        recordSetTotal: 0,

        isOrderPrepared: false,
        isOrderConfirmed: false,
    };

    searchCommand = new SearchCommand(PROTOCOL, HOSTNAME, SEARCH_API_PORT, STORE_ID);
    storeCommand = new StoreCommand(PROTOCOL, HOSTNAME, STORE_API_PORT, STORE_ID);

  }

  onClickListener = (viewId) => {
    Alert.alert("Alert", "Button pressed "+viewId);
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  componentDidMount() {
    this.getPermissionsAsync();
    // alert('mounted');
    
  }

  checkoutCart(orderId) {

    // alert('checkout Cart '+orderId);
    storeCommand.setShippingAddressOnCart(this, orderId, this.state.shippingAddressId);
    storeCommand.setPaymentInstructionsOnCart(this, orderId, this.state.grandTotal, this.state.billingAddressId, this.state.preferredPaymentMethodId);
    storeCommand.prepareCartForCheckout(this, orderId);

    // storeCommand.submitCartAsOrder(this, orderId);
    // storeCommand.getOrder(this, orderId);

    this.setState({ isOrderPrepared: true });

  }

  confirmCheckout(orderId) {

    storeCommand.submitCartAsOrder(this, orderId);

    storeCommand.getOrder(this, orderId);

    this.setState({ isOrderConfirmed: true });
    
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  _cacheSplashResourcesAsync = async () => {
    const gif = require('./assets/splash.png');
    return Asset.fromModule(gif).downloadAsync();
  };

  _cacheResourcesAsync = async () => {
    SplashScreen.hide();
    const images = [
      require('./assets/table_x_delete.png'),
      require('./assets/icon.png')
    ];

    const cacheImages = images.map(image => {
      return Asset.fromModule(image).downloadAsync();
    });

    await Promise.all(cacheImages);
    this.setState({ isAppReady: true });
  };

  render() {
    const { hasCameraPermission, scanned } = this.state;

    // var CurrencyFormat = require('react-currency-format');
    // var NumberFormat = require('react-number-format');

    if (!this.state.isSplashReady) {
      return (
        <AppLoading
          startAsync={this._cacheSplashResourcesAsync}
          onFinish={() => this.setState({ isSplashReady: true })}
          onError={console.warn}
          autoHideSplash={false}
        />
      );
    }

    if (!this.state.isAppReady) {
      return (
        <View style={{ flex: 1 }}>
          <Image
            source={require('./assets/splash.png')}
            onLoad={this._cacheResourcesAsync}
          />
        </View>
      );
    }

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }

    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }

    if (!this.state.isUserAuthenticated) {
      return (
        <View style={styles.container}>
          <View style={styles.containerIcon}>
            <Image style={styles.icon}
              source={require('./assets/icon.png')}
              onLoad={this._cacheResourcesAsync}
            />
            <Text style={styles.appTitle}>HCL Commerce Mobile Checkout</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.inputs}
              placeholder="User Name"
              keyboardType="default"
              autoCapitalize = 'none'
              underlineColorAndroid='transparent'
              onChangeText={(userName) => this.setState({userName})}
              value={this.state.userName}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.inputs}
              placeholder="Password"
              secureTextEntry={true}
              underlineColorAndroid='transparent'
              onChangeText={(password) => this.setState({password})}
            />
          </View>

          <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => storeCommand.loginIdentity(this, this.state.userName, this.state.password)}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableHighlight>

          <TouchableHighlight style={[styles.buttonContainer, styles.forgotPasswordButton]} onPress={() => this.onClickListener('restore_password')}>
              <Text style={styles.buttonText}>Forgot your password?</Text>
          </TouchableHighlight>

          <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('register')}>
              <Text style={styles.buttonText}>Register</Text>
          </TouchableHighlight>
        </View>
      );
    }

    if(this.state.isOrderConfirmed){
      return (
        <View style={styles.container}>
          <Text style={styles.summaryText}>Thank You for Your Purchase.</Text>
          <Text style={styles.summaryText}>Grand Total: {this.state.grandTotal}</Text>
          <Text style={styles.summaryText}>Number of Items: {this.state.recordSetTotal}</Text>
          <QRCode
            value={this.state.orderId}
            color={'#000000'}
            backgroundColor={'white'}
            size={200}
          />
          <Text style={styles.summaryText}>Order ID: {this.state.orderId}</Text>
        </View>
      );
    }

    if(this.state.isOrderPrepared){
      return (
        <View style={styles.container}>
          <Text style={styles.summaryText}>Confirm your Order.</Text>
          <Text style={styles.summaryText}>Grand Total: {this.state.grandTotal}</Text>
          <Text style={styles.summaryText}>Number of Items: {this.state.recordSetTotal}</Text>
          
          <TouchableHighlight style={[styles.confirmButtonContainer, styles.confirmButton]} onPress={() => this.confirmCheckout(this.state.orderId)}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableHighlight>
          <TouchableHighlight style={[styles.backToCartButtonContainer, styles.backToCartButton]}>
            <Text style={styles.buttonText}>Back to Cart</Text>
          </TouchableHighlight>

        </View>
      );
    }
    
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          marginTop: 30,
        }}>
          <View style={{flex: 1, marginTop: 10}}>
            <Text>Welcome Back {this.state.firstName} {this.state.lastName}, ({this.state.userId})</Text>
            <Text>Scanned Item: - sku: {this.state.barcode}</Text>
            <FlatList
              data={this.state.scannedProductData}
              renderItem={({item}) => 
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Image
                    style={{width: 100, height: 100}}
                    source={{uri: IMG_URI+item.thumbnail}}
                  />
                  <View>
                    <Text style={styles.titleText}>{item.name}</Text>
                    <Text>{item.shortDescription}</Text>
                    <Text style={styles.basePriceText}>${item.price[0].value}</Text>
                    <Text style={styles.priceText}>${item.price[0].value}</Text>
                    {/* <Button
                      title="Add to Basket"
                      onPress={() => { 
                        storeCommand.addToCart(this, item.uniqueID, 1);
                      }}
                    /> */}
                  </View>
                </View>
              } keyExtractor={item => item.uniqueID}
            />
          </View>
          <View style={{flex: 2}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text>Shopping Cart - ({this.state.orderId})</Text>
              <Text>${this.state.grandTotal}</Text>
            </View>
            <FlatList
              data={this.state.shoppingCartData}
              renderItem={({item}) => 
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text>OID: {item.orderItemId}, QTY: {item.quantity}, SKU: {item.partNumber}</Text>
                  {/* <Image
                    style={{width: 50, height: 50}}
                    source={{uri: IMG_URI+item.thumbnail}}
                  /> */}
                  <View>
                    <TouchableHighlight style={[styles.removeButtonContainer, styles.removeButton]} onPress={() => storeCommand.deleteCartItem(this, this.state.orderId, item.orderItemId)}>
                      {/* <Image
                        source={require('./assets/table_x_delete.png')}
                        onLoad={this._cacheResourcesAsync}
                      /> */}
                      <Text style={styles.buttonText}>Remove</Text>
                    </TouchableHighlight>
                  </View>
                </View>
              } keyExtractor={item => item.orderItemId}
            />
            <View>
              <TouchableHighlight style={[styles.removeButtonContainer, styles.removeButton]} onPress={() => this.checkoutCart(this.state.orderId)}>
                {/* <Image
                  source={require('./assets/table_x_delete.png')}
                  onLoad={this._cacheResourcesAsync}
                /> */}
                <Text style={styles.buttonText}>Checkout Now</Text>
              </TouchableHighlight>
            </View>
          </View>
          <View style={{flex: 3}}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
              style={{flex: 1}}
            />
          </View>
        {scanned && (
          <Button
            title={'Tap to Scan Again'}
            onPress={() => this.setState({ scanned: false })}
          />
        )}
      </View>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true, barcode: data, });

    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    
    storeCommand.fetchProductBySKUandAddToCart(this, data);
    
    Vibration.vibrate(1000);
    
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  containerIcon: {
    // flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#000000',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#F5FCFF',
  },
  instructions: {
    textAlign: 'center',
    color: '#F5FCFF',
    marginBottom: 5,
  },
  icon: {
    width:100,
    height:100,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  // container: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: '#DCDCDC',
  // },
  inputContainer: {
      borderBottomColor: '#F5FCFF',
      backgroundColor: '#FFFFFF',
      borderRadius:30,
      borderBottomWidth: 1,
      width:250,
      height:45,
      marginBottom:20,
      flexDirection: 'row',
      alignItems:'center'
  },
  inputs:{
      height:45,
      marginLeft:16,
      borderBottomColor: '#FFFFFF',
      flex:1,
  },
  inputIcon:{
    width:30,
    height:30,
    marginLeft:15,
    justifyContent: 'center'
  },
  buttonContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20,
    width:250,
    borderRadius:30,
  },
  loginButton: {
    backgroundColor: "#652d90",
  },
  forgotPasswordButton: {
    backgroundColor: "#E91848",
  },
  registerButton: {
    backgroundColor: "#652d90",
  },
  buttonText: {
    color: 'white',
  },
  summaryText: {
    fontSize: 20,
    color: 'white',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: "#652d90",
  },
  removeButtonContainer: {
    height:20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom:10,
    borderRadius:30,
  },
  confirmButtonContainer: {
    height:30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom:20,
    borderRadius:30,
  },
  removeButton: {
    backgroundColor: "#652d90",
  },
  backToCartButtonContainer: {
    height:30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom:20,
    borderRadius:30,
  },
  removebackToCartButton: {
    backgroundColor: "#652d90",
  },
  basePriceText: {
    textDecorationLine: 'line-through',
    color: 'red',
  },
  priceText: {
    fontWeight: 'bold',
  },
});