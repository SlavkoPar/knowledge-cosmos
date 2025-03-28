import { useEffect } from 'react'
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, useMsalAuthentication, useIsAuthenticated  } from '@azure/msal-react';
import { InteractionStatus, InteractionType, InteractionRequiredAuthError } from "@azure/msal-browser";
import { Nav, Navbar, Dropdown, DropdownButton } from 'react-bootstrap';

import { loginRequest, protectedResources } from 'authConfig';

export const NavigationBar = () => {
    const { instance, accounts, inProgress } = useMsal();

    let activeAccount;
    if (instance) {
        activeAccount = instance.getActiveAccount();
    }
    console.log(activeAccount ? activeAccount.name : 'Unknown')

    const request = {
        loginHint: "name@example.com",
        scopes: protectedResources.KnowledgeAPI.scopes.read
    }
    const { login, result, error: msalError } = useMsalAuthentication(InteractionType.Silent, request);

    // useEffect(() => {
    //     if (msalError instanceof InteractionRequiredAuthError) {
    //         login(InteractionType.Popup, request);
    //     }
    // }, [msalError]);

    // if (msalError) {
    //     console.log(msalError)
    //     // setError(msalError);
    //     return null;
    // }

    if (result) {
        localStorage.setItem('accessToken', result.accessToken)
    }


    const handleLoginRedirect = () => {
        instance.loginRedirect(loginRequest)
            .catch((error) => console.log(error));
    };

    const handleLoginPopup = () => {
        /**
         * When using popup and silent APIs, we recommend setting the redirectUri to a blank page or a page 
         * that does not implement MSAL. Keep in mind that all redirect routes must be registered with the application
         * For more information, please follow this link: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/login-user.md#redirecturi-considerations 
         */

        instance.loginPopup({
            ...loginRequest,
            redirectUri: '/redirect'
        }).catch((error) => console.log(error));
    };

    const handleLogoutRedirect = () => {
        instance.logoutRedirect({
            account: instance.getActiveAccount(),
        });
    };

    const handleLogoutPopup = () => {
        instance.logoutPopup({
            mainWindowRedirectUri: '/', // redirects the top level app after logout
            account: instance.getActiveAccount(),
        });
    };
    
    if (accounts.length > 0) {
        return <span>There are currently {accounts.length} users signed in!</span>
    } else if (inProgress === "login") {
        return <span>Login is currently in progress!</span>
    }

    /**
     * Most applications will need to conditionally render certain components based on whether a user is signed in or not.
     * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will
     * only render their children if a user is authenticated or unauthenticated, respectively.
     */
    return (
        <>
            <Navbar bg="primary" variant="dark" className="navbarStyle">
                <a className="navbar-brand" href="/">
                    Microsoft identity platform
                </a>
                <AuthenticatedTemplate>
                    <Nav.Link className="navbarButton" href="/todolist">
                        ToDoList
                    </Nav.Link>
                    <div className="collapse navbar-collapse justify-content-end">
                        <DropdownButton
                            variant="warning"
                            drop="start"
                            title={activeAccount ? activeAccount.name : 'Unknown'}
                        >
                            <Dropdown.Item as="button" onClick={handleLogoutPopup}>
                                Sign out using Popup
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={handleLogoutRedirect}>
                                Sign out using Redirect
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <div className="collapse navbar-collapse justify-content-end">
                        <DropdownButton variant="secondary" className="ml-auto" drop="start" title="Sign In">
                            <Dropdown.Item as="button" onClick={handleLoginPopup}>
                                Sign in using Popup
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={handleLoginRedirect}>
                                Sign in using Redirect
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </UnauthenticatedTemplate>
            </Navbar>
        </>
    );
};