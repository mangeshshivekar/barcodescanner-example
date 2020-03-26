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

export class SearchCommand extends RestCommand {

    constructor(protocol, host, port, storeId) {
        super(protocol, host, port);
        this.storeId = storeId;

    }
    /**
     * 
     * @param {*} stateFullObject 
     * @param {*} data 
     */
    fetchProductBySKU(stateFullObject, data){

        var url = this.protocol+'://'+this.host+':'+this.port+'/search/resources/store/1/productview/'+data;
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
                // itemId = responseJson.catalogEntryView.uniqueID;
            });

            // alert('success');
        })
        .catch((error) =>{
            alert('error');
            console.error(error);
        });

        // return itemId;

    }
}