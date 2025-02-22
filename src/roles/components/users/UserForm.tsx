import React, { useEffect, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { ActionTypes, FormMode, IRole, IUser, IUserFormProps } from "roles/types";

import { Select } from 'common/components/Select';
import { sourceOptions } from 'common/sourceOptions'
import { statusOptions } from 'common/statusOptions'
import SelRoleList from 'roles/components/SelectRole/SelRoleList'

import { useRoleDispatch } from "roles/RoleProvider";
import Dropdown from 'react-bootstrap/Dropdown';

const UserForm = ({ mode, user, submitForm, children, showCloseButton, closeModal }: IUserFormProps) => {

  const viewing = mode === FormMode.viewing;
  const editing = mode === FormMode.editing;
  const adding = mode === FormMode.adding;

  const { name, nickName } = user;

  const dispatch = useRoleDispatch();

  const closeForm = () => {
    if (closeModal) {
      closeModal();
    }
    else {
      dispatch({ type: ActionTypes.CLOSE_USER_FORM, payload: { user } })
    }
  }

  const cancelForm = () => {
    if (closeModal) {
      closeModal();
    }
    else {
      dispatch({ type: ActionTypes.CANCEL_USER_FORM, payload: { user } })
    }
  }

  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    nameRef.current!.focus();
  }, [nameRef])

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: user,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("Required"),
      nickName: Yup.string().required("Required"),
      parentRole: Yup.string().required("Required").notOneOf(['000000000000000000000000'])
    }),
    onSubmit: (values: IUser) => {
      //alert(JSON.stringify(values, null, 2));
      console.log('UserForm.onSubmit', JSON.stringify(values, null, 2))
      //submitForm({ ...values, ...cat })
      submitForm(values)
      //props.handleClose(false);
    }
  });

  const isDisabled = mode === FormMode.viewing;

  const setParentRole = (cat: IRole) => {
    formik.setFieldValue('parentRole', cat.title);
    formik.setFieldValue('roleTitle', cat.title);
  }

  return (
    <div className="form-wrapper px-3 py-1 my-0 my-1 w-100">
      {showCloseButton && <CloseButton onClick={closeForm} className="float-end" />}
      <Form onSubmit={formik.handleSubmit}>

        <Form.Label>Role</Form.Label>
        <Form.Group controlId="parentRole" className="role-select form-select-sm">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-basic" className="px-2 py-1 text-primary" disabled={isDisabled}>
              {formik.values.roleTitle}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-0">
              <Dropdown.Item className="p-0 m-0 rounded-3">
                <SelRoleList
                  parentRole='null'
                  level={1}
                  setParentRole={setParentRole}
                />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Form.Control
            as="input"
            name="parentRole"
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.parentRole.toString()}
            placeholder='Role'
            className="text-primary w-100"
            disabled={isDisabled}
            hidden={true}
          />
          <Form.Text className="text-danger">
            {formik.touched.parentRole && formik.errors.parentRole ? (
              <div className="text-danger">{formik.errors.parentRole ? 'required' : ''}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="nickName">
          <Form.Label>Nickname</Form.Label>
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
            placeholder='Nickname'
            className="text-primary w-50 text-center"
            disabled={true}
            readOnly={true}
          />
          <Form.Text className="text-danger">
            {formik.touched.nickName && formik.errors.nickName ? (
              <div className="text-danger">{formik.errors.nickName}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
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
            placeholder='New User'
            className="text-primary w-50 text-center"
            disabled={isDisabled}
          />
          <Form.Text className="text-danger">
            {formik.touched.name && formik.errors.name ? (
              <div className="text-danger">{formik.errors.name}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        {(viewing || editing) &&
          <>
            <CreatedModifiedForm
              created={user.created}
              createdBy={user.createdBy}
              modified={user.modified}
              modifiedBy={user.modifiedBy}
              classes="text-primary"
            />
          </>
        }
        {(editing || adding) &&
          <FormButtons
            cancelForm={cancelForm}
            handleSubmit={formik.handleSubmit}
            title={children}
          />
        }
      </Form>
    </div >
  );
};

export default UserForm;