
import { Reducer } from 'react'
import { IGlobalState, GlobalActionTypes, GlobalActions, ROLES, IAuthUser, IGlobalStateFromLocalStorage, ICat } from "./types";

const initialAuthUser: IAuthUser = {
    nickName: '',
    name: '',
    password: '',
    email: '',
    color: 'blue',
    role: ROLES.VIEWER,
    registrationConfirmed: false
}

const initGlobalState: IGlobalState = {
    dbp: null,
    authUser: initialAuthUser,
    isAuthenticated: false,
    everLoggedIn: false,
    canEdit: false,
    isOwner: false,
    isDarkMode: true,
    variant: 'dark',
    bg: 'dark',
    loading: false,
    allCategories: new Map<string, ICat>
}

let globalStateFromLocalStorage: IGlobalStateFromLocalStorage | undefined;

const hasMissingProps = (): boolean => {
    let b = false;
    // const keys = Object.keys(globalStateFromLocalStorage!)
    // Object.keys(initGlobalState).forEach((prop: string) => {
    //     if (!keys.includes(prop)) {
    //         b = true;
    //         console.log('missing prop:', prop)
    //     }
    //     else if (prop === 'authUser') {
    //         const keys = Object.keys(globalStateFromLocalStorage!.authUser)
    //         Object.keys(initGlobalState.authUser).forEach((prop: string) => {
    //             if (!keys.includes(prop)) {
    //                 b = true;
    //                 //console.log('missing prop:', prop, ' try with SignOut')
    //                 alert('missing prop: ' + prop + ' try with SignOut')
    //             }
    //         })
    //     }
    // })
    return b;
}

if ('localStorage' in window) {
    // localStorage.removeItem('GLOBAL_STATE')
    const s = localStorage.getItem('GLOBAL_STATE');
    if (s !== null) {
        globalStateFromLocalStorage = JSON.parse(s);
        if (hasMissingProps()) {
            globalStateFromLocalStorage = undefined;
        }
        /*
        else {
            const { authUser } = globalStateFromLocalStorage!;
            //authUser.userId = authUser.userId;
            console.log('===>>>globalStateFromLocalStorage', globalStateFromLocalStorage);
        }
        */
    }
}

export const initialGlobalState: IGlobalState = initGlobalState;
if (globalStateFromLocalStorage) {
    const { everLoggedIn, nickName, isDarkMode, variant, bg } = globalStateFromLocalStorage;
    initialGlobalState.everLoggedIn = everLoggedIn;
    initialGlobalState.authUser.nickName = nickName;
    initialGlobalState.isDarkMode = isDarkMode;
    initialGlobalState.variant = variant;
    initialGlobalState.bg = bg;
}

export const globalReducer: Reducer<IGlobalState, GlobalActions> = (state, action) => {
    const newState = reducer(state, action);
    const aTypesToStore = [
        GlobalActionTypes.AUTHENTICATE,
        GlobalActionTypes.DARK_MODE,
        GlobalActionTypes.LIGHT_MODE,
        GlobalActionTypes.UN_AUTHENTICATE
    ];
    if (aTypesToStore.includes(action.type)) {
        const { authUser, everLoggedIn, isDarkMode, variant, bg } = newState;
        const { nickName } = authUser;
        const obj: IGlobalStateFromLocalStorage = {
            nickName,
            everLoggedIn,
            isDarkMode,
            variant,
            bg
        }
        localStorage.setItem('GLOBAL_STATE', JSON.stringify(obj));
    }
    return newState;
}

const reducer: Reducer<IGlobalState, GlobalActions> = (state, action) => {
    const str = action.type
    switch (action.type) {

        case GlobalActionTypes.SET_LOADING:
            return {
                ...state,
                loading: true
            }

        case GlobalActionTypes.SET_ERROR: {
            const { error } = action.payload;
            return {
                ...state,
                error,
                loading: false
            };
        }

        case GlobalActionTypes.AUTHENTICATE: {
            const { user } = action.payload;
            const { nickName, name, password, parentRole, email, confirmed } = user;
            return {
                ...state,
                authUser: {
                    nickName,
                    name,
                    password,
                    role: parentRole as ROLES,
                    email,
                    color: 'blue',
                    registrationConfirmed: confirmed,
                    everLoggedIn: true,
                    registered: user.created ? user.created.date : new Date()
                    //visited: user.visited!.date
                },
                canEdit: user.parentRole !== ROLES.VIEWER,
                isOwner: user.parentRole === ROLES.OWNER,
                isAuthenticated: true,
                everLoggedIn: true,
                error: undefined
            };
        }

        case GlobalActionTypes.SET_DBP: {
            const { dbp } = action.payload;
            return {
                ...state,
                dbp,
                loading: false
            };
        }

        case GlobalActionTypes.SET_REGISTRATION_CONFIRMED: {
            return {
                ...state,
                authUser: {
                    ...state.authUser,
                    registrationConfirmed: true
                }
            }
        }

        case GlobalActionTypes.UN_AUTHENTICATE: {
            return {
                ...state,
                isAuthenticated: false,
                everLoggedIn: false,
                authUser: initialAuthUser,
                isOwner: false
            };
        }

        case GlobalActionTypes.LIGHT_MODE:
            return { ...state, isDarkMode: false, variant: 'light', bg: 'light' };

        case GlobalActionTypes.DARK_MODE:
            return { ...state, isDarkMode: true, variant: 'dark', bg: 'dark' };

        case GlobalActionTypes.SET_ALL_CATEGORIES: {
            const { allCategories } = action.payload;
            console.log("SET_CATEGORY_TAGS", allCategories)
            return {
                ...state,
                allCategories
            };
        }

        default: {
            throw Error('Unknown action: ' + str);
        }
    }
};

