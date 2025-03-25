import { useState, useCallback } from 'react';
import { AuthError, InteractionType, PopupRequest, RedirectRequest, SsoSilentRequest } from '@azure/msal-browser';
import { useMsal, useMsalAuthentication } from "@azure/msal-react";

/**
 * Custom hook to call a web API using bearer token obtained from MSAL
 * @param {PopupRequest} msalRequest 
 * @returns 
 */
const useFetchWithMsal = (msalRequest: PopupRequest | RedirectRequest | SsoSilentRequest) => {
    const { instance } = useMsal();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError|null>(null);
    const [data, setData] = useState<Object|null>(null);

    const { result, error: msalError } = useMsalAuthentication(InteractionType.Popup, {
        ...msalRequest//,
        //accountInfo: !instance.getActiveAccount(),
        //redirectUri: '/redirect'
    });

    // if (!result) {
    //     console.error('=================>>> !result', method, endpoint)
    //     login(InteractionType.Popup, msalRequest);
    // }

    /**
     * Execute a fetch request with the given options
     * @param {string} method: GET, POST, PUT, DELETE
     * @param {String} endpoint: The endpoint to call
     * @param {Object} data: The data to send to the endpoint, if any 
     * @returns JSON response
     */
    const execute = async (method: string, endpoint: string, data = null) : Promise<any> => {
       
        if (msalError) {
            console.log(msalError)
            setError(msalError);
            return null;
        }

        

        if (result) {
            try {
                let response = null;

                const headers = new Headers();
                const bearer = `Bearer ${result.accessToken}`;
                headers.append("Authorization", bearer);

                if (data) headers.append('Content-Type', 'application/json');

                let options = {
                    method: method,
                    headers: headers,
                    body: data ? JSON.stringify(data) : null,
                };

                setIsLoading(true);
                response = (await fetch(endpoint, options));
                console.error({response})

                if ((response.status === 200 || response.status === 201)) {
                    let responseData = response;

                    try {
                        responseData = await response.json();
                    } catch (error) {
                        console.log(error);
                    } finally {
                        setData(responseData);
                        setIsLoading(false);
                        console.log({responseData})
                        return responseData;
                    }
                }

                setIsLoading(false);
                return response;
            }
            catch (e) {
                console.log('-------------->>> execute', method, endpoint, e)
                setError(e as AuthError);
                setIsLoading(false);
                throw e;
            }
        }
    };

    return {
        isLoading,
        error,
        data,
        execute: useCallback(execute, [result, msalError]), // to avoid infinite calls when inside a `useEffect`
    };
};

export default useFetchWithMsal;