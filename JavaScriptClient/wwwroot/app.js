function log() {
    document.getElementById("results").innerText = "";

    Array.prototype.forEach.call(arguments,
        function(msg) {
            if (msg instanceof Error) {
                msg = "Error: " + msg.message;
            } else if (typeof msg !== "string") {
                msg = JSON.stringify(msg, null, 2);
            }
            document.getElementById("results").innerHTML += msg + "\r\n";
        });
}

document.getElementById("login").addEventListener("click", login, false);
document.getElementById("api").addEventListener("click", api, false);
//document.getElementById("logout").addEventListener("click", logout, false);

//var config = {
//    authority: "https://localhost:44300",
//    client_id: "js",
//    redirect_uri: "https://localhost:44302/callback.html",
//    response_type: "code",
//    scope:"openid profile schwarzenegger_api",
//    post_logout_redirect_uri: "https://localhost:44302/index.html",
//};

//var mgr = new Oidc.UserManager(config);

//mgr.getUser().then(function (user) {
//    if (user) {
//        log("User logged in", user.profile);
//    }
//    else {
//        log("User not logged in");
//    }
//});

var tokenObj = null;

function login() {
    //mgr.createSigninRequest().signinRedirect(); <--- Redirect with code flow

    var openIdConfig = getOpenIdConfiguration();
    // var code = getAuthCode(openIdConfig.authorization_endpoint);
    // var jwkInfos = getJwksInfos(openIdConfig.jwks_uri);
    tokenObj = getToken(openIdConfig.token_endpoint, "admin", "tempP@ss123");
}

function getOpenIdConfiguration() {
    var url = "https://localhost:44300/.well-known/openid-configuration";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();
    var config = JSON.parse(xhr.responseText);
    log(xhr.status, config);
    return config;
}

function getJwksInfos(jwksUri) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", jwksUri, false);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Accept", "application/jwk-set+json");
    xhr.send();
    var jwkInfos = JSON.parse(xhr.responseText);
    log(xhr.status, jwkInfos);
    return jwkInfos;
}

function getToken(tokenEndpoint, userName, password) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", tokenEndpoint, false);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(`grant_type=password&username=${userName}&password=${password}&client_id=schwarzenegger_spa&scope=schwarzenegger_api`);
    var jwkInfos = JSON.parse(xhr.responseText);
    log(xhr.status, jwkInfos);
    return jwkInfos;
}

function getAuthCode(tokenEndpoint, userName, password) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", tokenEndpoint, false);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(`grant_type=password&username=${userName}&password=${password}&client_id=schwarzenegger_spa&scope=schwarzenegger_api`);
    var jwkInfos = JSON.parse(xhr.responseText);
    log(xhr.status, jwkInfos);
    return jwkInfos;
}

function api() {
    var url = "https://localhost:44300/api/identity";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function() {
        log(xhr.status, JSON.parse(xhr.responseText));
    };
    xhr.setRequestHeader("Authorization", "Bearer " + tokenObj.access_token);
    xhr.send();
}

//function logout() {
//    mgr.signoutRedirect();
//}