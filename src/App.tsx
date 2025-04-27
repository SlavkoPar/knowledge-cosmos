import React, { useEffect } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route, redirect, useLocation, useNavigate } from "react-router-dom";

import { Navigation } from 'Navigation'
import { useGlobalContext, useGlobalDispatch, useGlobalState } from 'global/GlobalProvider'

import './App.css';

import Categories from "categories/Categories"
import Groups from "groups/Groups"
import About from 'About';
import Health from 'Health';
import SupportPage from './SupportPage';
import ChatBotPage from 'ChatBotPage';
import Export from 'Export';
import { GlobalActionTypes, IUser } from 'global/types';
import { AccountInfo } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';

function App() {
  console.log('-----------> App')

  const { getUser, OpenDB } = useGlobalContext();
  const { dbp, authUser, isAuthenticated, everLoggedIn, catsLoaded, shortGroupsLoaded } = useGlobalState()
  const { nickName, role } = authUser;

  const formInitialValues = {
    who: '',
    nickName: '',
    email: ''
  };

  let location = useLocation();
  const navigate = useNavigate();
  const dispatch = useGlobalDispatch();

  const { instance } = useMsal();

  useEffect(() => {
    //(async () => {
    //if (isAuthenticated) {
    //await OpenDB(execute);
    //}
    //})()
    if (!isAuthenticated) {
      if (instance) {
        const activeAccount: AccountInfo | null = instance.getActiveAccount();
        const user: IUser = {
          nickName: (activeAccount && activeAccount.name) ? activeAccount.name : 'Unknown',
          name: ''
        }
        dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user } });
      }
    }

  }, [isAuthenticated]) // , isAuthenticated

  const locationPathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);

  useEffect(() => {
    (async () => {
      const isAuthRoute =
        locationPathname.startsWith('/invitation') ||
        locationPathname.startsWith('/register') ||
        locationPathname.startsWith('/sign-in') ||
        locationPathname.startsWith('/about');  // allow about without registration
      if (!isAuthenticated && !isAuthRoute && dbp) {
        if (everLoggedIn) {
          let signedIn = false;
          // if (/*dbp &&*/ nickName !== '') {
          //   console.log(`await signInUser(${nickName} })`);
          //   const loginUser = {
          //     nickName
          //   }
          //   // signedIn = await signInUser(loginUser);
          //   // if (!signedIn) {
          //   //   navigate('/sign-in')
          //   // }
          // }
        }
        else {
          // const regUser: IRegisterUser = { 
          //   nickName
          // }
          // const user = await registerUser(regUser, true, null);

          // if (!user.confirmed) {
          //   let user: IUser = await getUser('Boss');
          //   const { nickName, name, password, wsId, email } = user;
          //   const loginUser: ILoginUser = { nickName  }
          //   user = await registerUser(loginUser, true);
          //   if (!user) {
          //     return null;
          //   }
          // }

          // let user = await getUser('Boss');
          // if (!user) {
          //   alert('User Boss, as the OWNER, should be in database')
          //   return;
          // }
          // if (!user.confirmed) {
          //   let user: IUser = await getUser('Boss');
          //   const { nickName, name, password, wsId, email } = user;
          //   const loginUser: ILoginUser = { wsId, nickName, name, password, email }
          //   user = await registerUser(loginUser);
          //   if (!user) {
          //     return null;
          //   }
          // }
          /*
          const returnUrl = encodeURIComponent(locationPathname);
          console.log('PATH prije navigate(register)', locationPathname)
          if (!locationPathname.includes('/register')) {
            navigate('/register/' + returnUrl, { replace: true });
          }
          */
        }
      }
      else {
        // const returnUrl = encodeURIComponent(locationPathname);
        // console.log('PATH prije navigate(register)', locationPathname)
        // if (locationPathname.includes('/supporter')) {
        //   // save params
        //   // navigate('/' + returnUrl, { replace: true });
        //   navigate('/', { replace: true });
        // }
      }
      const supporter = searchParams.get('supporter');
      if (isAuthenticated && supporter === '1') {
        const source = searchParams.get('source');
        const question = searchParams.get('subject');
        const email = searchParams.get('email');
        if (!email || email === 'xyz') {
          localStorage.removeItem('emailFromClient')
        }
        else {
          localStorage.setItem('emailFromClient', email ?? 'slavko.parezanin@gmail.com')
        }
        navigate(`/supporter/${source}/${question}`);
      }

    })()

  }, [dbp, isAuthenticated, nickName, everLoggedIn, locationPathname, navigate])

  if (!isAuthenticated || !catsLoaded || !shortGroupsLoaded)
    return <div>App loading</div>

  return (
    <Container fluid className="App" data-bs-theme="light">
      {/* <header className="App-header">
        <Navigation />
      </header> */}
      <Row>
        <Col md={12}>
          <div className="wrapper">
            <Routes>
              <Route path="/" element={(!isAuthenticated && !everLoggedIn) ? <About /> : <Categories />} />
              <Route path="/knowledge-cosmos" element={(!isAuthenticated && !everLoggedIn) ? <About /> : <Categories />} />
              {/* <Route path="" element={(!isAuthenticated && !everLoggedIn) ? <About /> : <Categories />} /> */}
              {/* <Route path="/register/:returnUrl" element={<RegisterForm />} />
              <Route path="/sign-in" element={<LoginForm initialValues={formInitialValues} invitationId='' />} /> */}
              <Route path="/supporter/:source/:tekst" element={<SupportPage />} />
              <Route path="/supporter/:source/:tekst/:email" element={<SupportPage />} />
              <Route path="/ChatBotPage/:source/:tekst/:email" element={<ChatBotPage />} />
              <Route path="/categories/:categoryId_questionId" element={<Categories />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/groups/:groupId_AnswerId" element={<Groups />} />
              <Route path="/groups" element={<Groups />} />

              <Route path="/export" element={<Export />} />
              <Route path="/about" element={<About />} />
              <Route path="/health" element={<Health />} />
            </Routes>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
