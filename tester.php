<?php

class AccessTokenAuthentication {

    function getTokens($grantType, $scopeUrl, $clientID, $clientSecret, $authUrl){
        
        $paramArr = array (
                         'grant_type'    => $grantType,
                         'scope'         => $scopeUrl,
                         'client_id'     => $clientID,
                         'client_secret' => $clientSecret
                    );


        $ch = curl_init();
        $paramArr = http_build_query($paramArr);
        curl_setopt($ch, CURLOPT_URL, $authUrl);

        curl_setopt($ch, CURLOPT_POST, TRUE);

        curl_setopt($ch, CURLOPT_POSTFIELDS, $paramArr);

        curl_setopt ($ch, CURLOPT_RETURNTRANSFER, TRUE);

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $strResponse = curl_exec($ch);

        curl_close($ch);

        $objResponse = json_decode($strResponse);
        print $objResponse->access_token;
    }
}


Class HTTPTranslator {
    
    function curlRequest($url, $authHeader, $postData=''){

        $ch = curl_init();

        curl_setopt ($ch, CURLOPT_URL, $url);

        curl_setopt ($ch, CURLOPT_HTTPHEADER, array($authHeader,"Content-Type: text/xml"));

        curl_setopt ($ch, CURLOPT_RETURNTRANSFER, TRUE);

        curl_setopt ($ch, CURLOPT_SSL_VERIFYPEER, False);
        if($postData) {

            curl_setopt($ch, CURLOPT_POST, TRUE);

            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        }

        $curlResponse = curl_exec($ch);

        $curlErrno = curl_errno($ch);
        if ($curlErrno) {
            $curlError = curl_error($ch);
            throw new Exception($curlError);
        }

        curl_close($ch);
        return $curlResponse;
    }
   
    function createReqXML($languageCode) {

        $requestXml = '<ArrayOfstring xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
        if($languageCode) {
            $requestXml .= "<string>$languageCode</string>";
        } else {
            throw new Exception('Language Code is empty.');
        }
        $requestXml .= '</ArrayOfstring>';
        return $requestXml;
    }
}


try {

    $grantType    = "client_credentials";
    $authUrl      = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13/";
    $scopeUrl= "http://api.microsofttranslator.com";
    $clientID="be843ac9-d754-4b20-8003-710a832a8e6c";
    $clientSecret="F5bY4K6G//7O1jFVF5tcciNh9gJ0hBx8X9uCizmBHrM=";

    $authObj      = new AccessTokenAuthentication();

    $accessToken  = $authObj->getTokens($grantType, $scopeUrl, $clientID, $clientSecret, $authUrl);

  
}
catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . PHP_EOL;
}


?>