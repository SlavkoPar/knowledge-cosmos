import { LogLevel } from '@azure/msal-browser';

/**
* Configuration object to be passed to MSAL instance on creation. 
* For a full list of MSAL.js configuration parameters, visit:
* https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
*/

// auth: {
//     clientId: "016e711e-f4f0-4c8f-a1b3-9f8569510972",
//     authority: "https://login.microsoftonline.com/common",
//     redirectUri: "http://localhost:3000/"
// },


export const msalConfig = {


    auth: {
        clientId: 'b9eedfe8-b59c-4509-98ac-8c124dd1e59f', // This is the ONLY mandatory field that you need to supply.
        authority: 'https://login.microsoftonline.com/2f4006c5-c4ea-4165-846f-914b5b75685b', // Replace the placeholder with your tenant info
        redirectUri: 'http://localhost:3000', ///redirect', // Points to window.location.origin. You must register this URI on Microsoft Entra admin center/App Registration.
        postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
        navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
    },
    cache: {
        cacheLocation: 'sessionStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

/**
* Scopes you add here will be prompted for user consent during sign-in.
* By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
* For more information about OIDC scopes, visit: 
* https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
*/
export const loginRequest = {
    scopes: ["User.Read"],
};

/**
* An optional silentRequest object can be used to achieve silent SSO
* between applications by providing a "login_hint" property.
*/
// export const silentRequest = {
//     scopes: ["openid", "profile"],
//     loginHint: "example@domain.net"
// };