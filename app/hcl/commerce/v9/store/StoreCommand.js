 /*************************************************************************
 * 
 * Copyright 2020 HCL America, Inc 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { RestCommand } from '../RestCommand';

export class StoreCommand extends RestCommand {

    constructor(protocol, host, port, storeId) {
        super(protocol, host, port);
        this.storeId = storeId;
    }

    /**
     * Logon Registered User
     * loginidentity
     * 
     * @param {*} stateFullObject 
     * @param {*} data 
     */
    loginIdentity(stateFullObject, userName, password){

        //wcs/resources/store/{{storeId}}/loginidentity
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/loginidentity';
        var thisObject = this;
        // alert('url - '+url);
        // alert('userName - '+userName);
        // alert('password - '+password);


        let dataRequest = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
            },
            body: JSON.stringify({
                logonId: userName,
                logonPassword: password,
            }),
          };

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            // alert('data - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isUserAuthenticated: true,
                isLoading: false,
                userId: responseJson.userId,
                WCToken: responseJson.WCToken,
                WCTrustedToken: responseJson.WCTrustedToken,
                personalizationID: responseJson.personalizationID,
            }, function(){
                // get the person's info
                thisObject.getPersonSelf(stateFullObject);
                //load the shopping cart
                thisObject.getCart(stateFullObject);
            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });
    }

    /**
     * 
     * @param {*} stateFullObject 
     */
    getPersonSelf(stateFullObject){

        //wcs/resources/store/{{storeId}}/loginidentity
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/person/@self';
        var thisObject = this;
        // alert('url - '+url);

        let dataRequest = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'WCToken': stateFullObject.state.WCToken,
                'WCTrustedToken': stateFullObject.state.WCTrustedToken,
            },
          };

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            // alert('data - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                firstName: responseJson.firstName,
                lastName: responseJson.lastName,
                billingAddressId: responseJson.addressId,
                shippingAddressId: responseJson.addressId,
            }, function(){
                
            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });
    }




    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} data 
     */
    fetchProductBySKUandAddToCart(stateFullObject, data){
        //port is purposely set to 7738 for the search service
        var url = this.protocol+'://'+this.host+':7738/search/resources/store/1/productview/'+data;
        var thisObject = this;
        // var itemId = null;
        // alert('url - '+url);

        fetch(url)
        .then((response) => response.json())
        .then((responseJson) => {

            // alert('data - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isLoading: false,
                scannedProductData: responseJson.catalogEntryView,
            }, function(){
                var productId = responseJson.catalogEntryView[0].uniqueID;
                // alert('catalogEntryView: '+JSON.stringify(responseJson.catalogEntryView));
                // alert('productId: '+JSON.stringify(responseJson.catalogEntryView[0].uniqueID));
                //alert('productId: '+productId);
                thisObject.addToCart(stateFullObject, productId, 1);
            });

            // alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

        // return itemId;

    }

    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} productId 
     * @param {*} quantity 
     */
    addToCart(stateFullObject, productId, qty){

        // https://{{bda-hostname}}/wcs/resources/store/{{storeId}}/cart
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/cart';
        var thisObject = this;

        //alert('productId - '+productId);
        //alert('qty - '+qty);
        //alert('url - '+url);

        let dataRequest = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'WCToken': stateFullObject.state.WCToken,
                'WCTrustedToken': stateFullObject.state.WCTrustedToken,
            },
            body: JSON.stringify({
                x_inventoryValidation: 'true',
                orderId: '.',
                orderItem:[{
                    productId: productId,
                    quantity: ''+qty
                }],
                x_calculateOrder:'1'
            }),
          };

        //alert('dataRequest - '+JSON.stringify(dataRequest));

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            //alert('responseJson - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isLoading: false,
                orderId: responseJson.orderId,
                orderItemId: responseJson.orderItemId,
                
            }, function(){
                //load the shopping cart
                thisObject.getCart(stateFullObject);
            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

    }

    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} orderItemId 
     */
    deleteCartItem(stateFullObject, orderId, orderItemId){

        // https://{{bda-hostname}}/wcs/resources/store/{{storeId}}/cart
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/cart/@self/delete_order_item';
        var thisObject = this;

        //alert('orderItemId - '+orderItemId);
        // alert('url - '+url);

        let dataRequest = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'WCToken': stateFullObject.state.WCToken,
                'WCTrustedToken': stateFullObject.state.WCTrustedToken,
            },
            body: JSON.stringify({
                orderId: orderId,
                orderItemId: orderItemId
            }),
          };

        //    alert('dataRequest - '+JSON.stringify(dataRequest));

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            //alert('responseJson - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isLoading: false,
                orderId: responseJson.orderId,
                
            }, function(){
                //load the shopping cart
                thisObject.getCart(stateFullObject);
            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

    }

    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} orderItemId 
     */
    updateCartItem(stateFullObject, orderId, orderItemId, qty){

        // https://{{bda-hostname}}/wcs/resources/store/{{storeId}}/cart
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/cart/@self/update_order_item';
        var thisObject = this;

        // alert('productId - '+productId);
        // alert('url - '+url);

        let dataRequest = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'WCToken': stateFullObject.state.WCToken,
                'WCTrustedToken': stateFullObject.state.WCTrustedToken,
            },
            body: JSON.stringify({
                x_inventoryValidation: 'true',
                orderId: orderId,
                orderItem:[{
                    orderItemId: orderItemId,
                    quantity: ''+qty,
                }],
                x_calculateOrder:"1"
            }),
          };

        //    alert('dataRequest - '+JSON.stringify(dataRequest));

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            // alert('responseJson - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isLoading: false,
                orderId: responseJson.orderId,
                
            }, function(){
                //load the shopping cart
                thisObject.getCart(stateFullObject);
            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

    }

    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} orderId 
     */
    getCart(stateFullObject){

        // https://{{bda-hostname}}/wcs/resources/store/{{storeId}}/cart
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/cart/@self';
        // alert('productId - '+productId);
        // alert('GET CART url - '+url);

        let dataRequest = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'WCToken': stateFullObject.state.WCToken,
                'WCTrustedToken': stateFullObject.state.WCTrustedToken,
            },
          };


        // alert('dataRequest - '+JSON.stringify(dataRequest));

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            // alert('responseJson - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isLoading: false,
                orderId: responseJson.orderId,
                shoppingCartData: responseJson.orderItem,
                grandTotal: responseJson.grandTotal,
                recordSetTotal: responseJson.recordSetTotal
            }, function(){

            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

    }


    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} orderId 
     * @param {*} addressId 
     */
    setShippingAddressOnCart(stateFullObject, orderId, addressId){

        // https://{{bda-hostname}}/wcs/resources/store/{{storeId}}/cart/@self/shipping_info
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/cart/@self/shipping_info';
        var thisObject = this;

        let dataRequest = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'WCToken': stateFullObject.state.WCToken,
                'WCTrustedToken': stateFullObject.state.WCTrustedToken,
            },
            body: JSON.stringify({
                x_calculationUsage: '-1,-2,-3,-4,-5,-6,-7',
                orderId: orderId,
                addressId: addressId,
                x_calculateOrder: 1,
                x_allocate:'***',
                x_backorder:'***',
                x_remerge:'***',
                x_check:'*n'
            }),
          };

        //    alert('dataRequest - '+JSON.stringify(dataRequest));

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            // alert('responseJson - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isLoading: false,
                // orderId: responseJson.orderId,
            }, function(){
                //load the shopping cart
            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

    }

    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} orderId 
     * @param {*} addressId 
     */
    setPaymentInstructionsOnCart(stateFullObject, orderId, paymentAmount, addressId, paymentMethodId){

        // https://{{bda-hostname}}/wcs/resources/store/{{storeId}}/cart/@self/payment_instruction
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/cart/@self/payment_instruction';
        var thisObject = this;

        let dataRequest = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'WCToken': stateFullObject.state.WCToken,
                'WCTrustedToken': stateFullObject.state.WCTrustedToken,
            },
            body: JSON.stringify({
                orderId: orderId,
                piAmount: paymentAmount,
                billing_address_id: addressId,
                payMethodId: paymentMethodId
            }),
          };

        //    alert('dataRequest - '+JSON.stringify(dataRequest));

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            // alert('responseJson - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isLoading: false,
                // orderId: responseJson.orderId,
            }, function(){
                //load the shopping cart
            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

    }

    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} orderId 
     */
    prepareCartForCheckout(stateFullObject, orderId){

        // https://{{bda-hostname}}/wcs/resources/store/{{storeId}}/cart/@self/payment_instruction
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/cart/@self/payment_instruction';
        var thisObject = this;

        let dataRequest = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'WCToken': stateFullObject.state.WCToken,
                'WCTrustedToken': stateFullObject.state.WCTrustedToken,
            },
            body: JSON.stringify({
                orderId: orderId
            }),
          };

        //    alert('dataRequest - '+JSON.stringify(dataRequest));

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            // alert('responseJson - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isLoading: false,
                // orderId: responseJson.orderId,
            }, function(){
                //load the shopping cart
            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

    }

    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} orderId 
     */
    submitCartAsOrder(stateFullObject, orderId){

        // https://{{bda-hostname}}/wcs/resources/store/{{storeId}}/cart/@self/checkout
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/cart/@self/checkout';
        var thisObject = this;

        let dataRequest = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'WCToken': stateFullObject.state.WCToken,
                'WCTrustedToken': stateFullObject.state.WCTrustedToken,
            },
            body: JSON.stringify({
                orderId: orderId
            }),
          };

        //    alert('dataRequest - '+JSON.stringify(dataRequest));

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            // alert('responseJson - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isLoading: false,
                // orderId: responseJson.orderId,
            }, function(){
                //load the shopping cart
            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

    }

    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} orderId 
     */
    getOrder(stateFullObject, orderId){

        // https://{{bda-hostname}}/wcs/resources/store/{{storeId}}/order/{{orderId}}
        var url = this.protocol+'://'+this.host+':'+this.port+'/wcs/resources/store/'+this.storeId+'/order/'+orderId;
        var thisObject = this;

        let dataRequest = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'WCToken': stateFullObject.state.WCToken,
                'WCTrustedToken': stateFullObject.state.WCTrustedToken,
            },
          };

        //    alert('dataRequest - '+JSON.stringify(dataRequest));

        fetch(url, dataRequest)
        .then((response) => response.json())
        .then((responseJson) => {

            // alert('responseJson - '+JSON.stringify(responseJson));

            stateFullObject.setState({
                isLoading: false,
                // orderId: responseJson.orderId,
            }, function(){
                //load the shopping cart
            });

            //alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

    }
}