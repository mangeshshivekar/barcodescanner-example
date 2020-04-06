React Native Barcode Scanning Shopping App 

francis.booth@hcl.com 

March 24th, 2020 

Copyright 2020 HCL America, Inc 
Licensed under the Apache License

 
IMPORTANT NOTE:

REMEMBER TO SET TEH FOLLOWING IN App.js for your environment.  NGINX SSL termination was done to bypass the need for a tructed cert or working with apple or android trust stores.

const PROTOCOL = 'http';
const HOSTNAME = '206.198.144.241';
const STORE_API_PORT = 4443;
const SEARCH_API_PORT = 7738;
const STOREFRONT_PORT = 8843;
const STORE_ID = 1;
const IMG_URI= PROTOCOL+'://'+HOSTNAME+':'+STOREFRONT_PORT;


Explain the use case(s) 

Define pre-requisites of what is needed to support/run app 

Create step-by-step documentation on setting up pre-requisites 

Create step-by-step documentation on setting up / installing the app 

Create step-by step documentation on setting up / running the app 

Produce end-to-end video of usage 

 

Purpose / UseCase:  Demonstrate the ability to integrate a REACT-Native application with HCL Commerce v9.  The use case is that the user can scan barcodes (CODE-128), add these items to the cart, and prepare for checkout with a registered user. 

 

Technology Knowledge Requirements:  nginx, npm, node.js, REACT-Native, expo, and HCL Commerce REST APIs 

Installation & Set Up 

 

HCL Commerce v9 installed, running, and visible from the environment.  localhost is preferred. 

Install nginx and configure the nginx server to operate as a HTPS/SSL termination proxy. 

Install nginx for Windows - nginx v1.17.9 - docs here - https://nginx.org/en/docs/ 

http://nginx.org/download/nginx-1.17.9.zip 

Configure nginx.conf located in the C:\nginx\nginx-1.17.8\conf directory 

Add the following entries to listen on cleartext alternate ports to bypass the SSL verification because iOS and Android require adding of certs to the keystore. 

 

    server { 

        listen 4443; 

        location / { 

#            resolver 127.0.0.1; 

            proxy_ssl_verify off; 

            proxy_pass https://10.0.0.1:443$uri$is_args$args; 

        } 

    } 

     

    server { 

        listen 8843; 

        location / { 

#            resolver 127.0.0.1; 

            proxy_ssl_verify off; 

            proxy_pass https://10.0.0.1:8443$uri$is_args$args; 

        } 

    } 

     

    server { 

        listen 7738; 

        location / { 

#            resolver 127.0.0.1; 

            proxy_ssl_verify off; 

            proxy_pass https://10.0.0.1:3738$uri$is_args$args; 

        } 

    } 

 

Start nginx v1.17.8 - nginx installation instructions here - https://nginx.org/en/docs/ 

Install Git for Windows – providing this project is committed to GIT 

Download git for Windows -  https://gitforwindows.org/ 

I recommend using gitBash – and then (when checked in code) - clone and checkout this project 

Checkout / clone pull this project – needs to be in GIT 

Install Visual Studio v1.43.0 https://code.visualstudio.com/ 

Follow the installation instructions - https://code.visualstudio.com/docs/setup/windows 

Install node.js version v10.19.0 

Installed Node.js - download version v10.19.0 

https://nodejs.org/en/download/releases/ 

Or https://nodejs.org/download/release/v10.19.0/ 

Install npm version 6.13.4 - see video - https://www.youtube.com/watch?v=WnS7dcY5Hys 

install expo - v3.13.5  - see video - https://www.youtube.com/watch?v=WnS7dcY5Hys 

Follow this video on youtube.  Video Help - https://www.youtube.com/watch?v=WnS7dcY5Hys 

 

Checkout Code and Setup Project 

Recommend the following project path in the BDA 

Create the C:\Users\wcsadmin\Projects 

Checkout from the git repository this code base into this directory (to be published) - should look like this - C:\Users\wcsadmin\Projects\barcodescanner-example 

Start the VS Code application and then add as a workspace project – so it looks like this – VSCode Documentation – Learn vsCode basics here it is an IDE...https://code.visualstudio.com/docs/getstarted/introvideos 

The project should look like this: 

 

Then start expo local server using this command line command from the project’s barcode directory(C:\Users\wcsadmin\Projects\barcodescanner-example) 

C:\Users\wcsadmin\Projects\barcodescanner-example>dir 

Volume in drive C has no label. 

Volume Serial Number is CCBE-951A 

  

Directory of C:\Users\wcsadmin\Projects\barcodescanner-example 

  

03/17/2020  12:32 PM    <DIR>          . 

03/17/2020  12:32 PM    <DIR>          .. 

02/21/2020  04:38 PM             6,148 .DS_Store 

03/17/2020  11:28 AM    <DIR>          .expo 

02/21/2020  04:38 PM               120 ._.DS_Store 

02/28/2020  07:07 PM               213 ._App.js 

02/21/2020  04:22 AM               213 ._app.json 

02/28/2020  10:23 AM               213 ._assets 

02/21/2020  04:22 AM               213 ._babel.config.js 

02/21/2020  04:22 AM               213 ._components 

02/21/2020  04:22 AM               213 ._README.md 

03/09/2020  09:51 AM    <DIR>          app 

02/28/2020  07:07 PM            14,570 App.js 

02/21/2020  04:22 AM               704 app.json 

03/09/2020  09:44 AM    <DIR>          assets 

02/21/2020  04:22 AM               104 babel.config.js 

03/09/2020  09:44 AM    <DIR>          components 

03/09/2020  09:44 AM    <DIR>          node_modules 

03/09/2020  07:26 PM         1,861,578 npm-debug.log 

02/28/2020  06:17 PM           325,688 package-lock.json 

02/28/2020  06:17 PM               581 package.json 

03/17/2020  12:53 PM             1,655 README 

02/21/2020  04:22 AM               904 README.md 

03/09/2020  09:51 AM    <DIR>          web-build 

              16 File(s)      2,213,330 bytes 

               8 Dir(s)  10,516,291,584 bytes free 

  

C:\Users\wcsadmin\Projects\barcodescanner-example>expo start 

Then the expo server will start – note the QR code will point to the internal IP Address- example URL, exp://10.0.0.1:19000 

 

 

 

With your iPhone or android device install the expo app client. 

IOS – Apple Store - https://apps.apple.com/us/app/expo-client/id982107779 

Android – Google Store - https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en_US 

Install the expo client 

Make sure you have network visibility to the expo server.  If in a BDA use the external IP Address, for instance my BDA is 206.198.144.241. 

 

 scan the QR code or in a browser on your device connect to:  exp://206.198.144.241:19000 

 

 

 

 

Username: sallysmith Password: passw0rd 

Use the application scanning barcode (CODE-128) where the value is the SKU string as a generated barcode.  Use this site for the barcode generation.  https://barcode.tec-it.com/en/Code128 

Here is a video of the Barcode scanning application at work.  https://hclo365-my.sharepoint.com/:v:/r/personal/francis_booth_hcl_com/Documents/Attachments/HCLCommerceMobileShoppingApp-B2C.mov?csf=1&e=d6QXyD 

 

 

 

 

 