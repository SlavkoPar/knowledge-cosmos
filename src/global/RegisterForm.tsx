import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton } from "react-bootstrap";
import { IRegisterUser, ROLES } from "global/types";
//import emailjs from '@emailjs/browser'

import './formik.css';

import { useGlobalContext } from 'global/GlobalProvider'
import { useNavigate, useParams } from "react-router-dom";

export interface ILoginFormProps {
}

type RegisterParams = {
  returnUrl: string;
};

const RegisterForm = () => {

  const { globalState, registerUser } = useGlobalContext();
  // const { isAuthenticated } = globalState;
  let { returnUrl } = useParams<RegisterParams>();

  let navigate = useNavigate();
  const closeForm = () => {
    // navigate('/support-cosmos/register/fromNavigation'); // '/register' will prevent: navigate('/register/' + returnUrl, { replace: true })
    navigate('/support-cosmos'); // '/register' will prevent: navigate('/register/' + returnUrl, { replace: true })
  }

  const goBack = () => {
    navigate(returnUrl && returnUrl !== 'fromNavigation' ? returnUrl : '/support-cosmos')
  }

  const [showMessage, setShowMessage] = useState(false);

  const submitForm = async (regUser: IRegisterUser) => {
    regUser.color = 'blue';
    const user = await registerUser(regUser, false, null);
    if (!user)
      return;

    // const values: IUserMail = {
    //   wsId: user.wsId,
    //   userId: user._id,
    //   wsName: loginUser.wsName,
    //   from_name: 'Admin',
    //   to_name: loginUser.userName,
    //   email_from: loginUser.email!,
    //   email_to: loginUser.email!,
    //   userName: loginUser.userName,
    //   contact_number: 0
    // }

    // values.contact_number = Math.random() * 100000 | 0;
    //emailjs.send('service_akla4ca', 'template_ag3h1tx', values, 'YeDIRPwve3mgTemkA')
    //.then(function () {
    console.log('SUCCESS!');
    setShowMessage(true);
    // }, function (error) {
    //   console.log('FAILED...', error);
    //   //closeForm();
    // });
  }

  const initialValues: IRegisterUser = {
    name: '',
    nickName: '',
    password: '',
    email: '',
    color: 'navy',
    level: 1,
    confirmed: false
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("Required"),
      nickName: Yup.string().required("Required"),
      email: Yup.string()
        .required("Required")
        .email("You have enter an invalid email address"),
      password: Yup.string()
        .required("Password is a required field")
        .min(8, "Password must be at least 8 characters")
    }),
    onSubmit: values => {
      //alert(JSON.stringify(values, null, 2));
      submitForm(values);
      //props.handleClose(false);
    }
  });

  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current!.focus()
  }, [nameRef])

  // useEffect(() => {
  //   if (isAuthenticated)
  //     navigate('/')
  // }, [isAuthenticated, navigate])

  if (showMessage) {
    return (
      <>
        <div className="form bg-warning my-2 py-2">
          <p><b>Please check your Email Inbox and confirm registration!</b></p>
          <p>You can send email to invite other people, to become members of your Workspace</p>
        </div>
        <div className="form bg-success my-2 py-2">
          <p>Small demo database has been created, to better understand relations:</p>
          <p>Supporter -{">"} Category/Questions</p>
          <p>Question -{">"} Answers</p>
          <p>You can easily remove these records</p>
        </div>
        <div className="form bg-info my-2 py-2">
          <button onClick={goBack} title='Back'>Go Back</button>
        </div>
      </>
    )
  }

  return (
    <div className="form">
      <CloseButton onClick={closeForm} className="float-end" />
      <Form onSubmit={formik.handleSubmit}>
        <span>Register</span>

        <Form.Group controlId="name">
          {/* <Form.Label>Title</Form.Label> */}
          <Form.Control
            as="input"
            name="name"
            ref={nameRef}
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.name}
            style={{ width: '100%' }}
            placeholder={'Name'}
          />
          <Form.Text className="text-danger">
            {formik.touched.name && formik.errors.name ? (
              <div className="text-danger">{formik.errors.name}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="nickName">
          {/* <Form.Label>nickName</Form.Label> */}
          <Form.Control
            as="input"
            name="nickName"
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.nickName}
            style={{ width: '100%' }}
            placeholder={'Nickname'}
          />
          <Form.Text className="text-danger">
            {formik.touched.nickName && formik.errors.nickName ? (
              <div className="text-danger">{formik.errors.nickName}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="email">
          {/* <Form.Label>email</Form.Label> */}
          <Form.Control
            as="input"
            name="email"
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.email}
            style={{ width: '100%' }}
            placeholder={'nickName@gmail.com'}
          />
          <Form.Text className="text-danger">
            {formik.touched.email && formik.errors.email ? (
              <div className="text-danger">{formik.errors.email}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="password">
          {/* <Form.Label>password</Form.Label> */}
          <Form.Control
            as="input"
            name="password"
            type="password"
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.password}
            style={{ width: '100%' }}
            placeholder={'pwd'}
          />
          <Form.Text className="text-danger">
            {formik.touched.password && formik.errors.password ? (
              <div className="text-danger">{formik.errors.password}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <button type="submit" className="submit-button">Register</button>

        {globalState.error &&
          <div>{globalState.error.message}</div>
        }

      </Form>

    </div >
  );
};

export default RegisterForm;
