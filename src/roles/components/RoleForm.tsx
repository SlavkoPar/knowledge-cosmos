import React, { useEffect, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Form, CloseButton } from "react-bootstrap";
import { CreatedModifiedForm } from "common/CreateModifiedForm"
import { FormButtons } from "common/FormButtons"
import { FormMode, ActionTypes, IRoleFormProps, IRole } from "roles/types";

import { useRoleDispatch } from "roles/RoleProvider";
import UserList from "roles/components/users/UserList";

const RoleForm = ({ inLine, mode, role, submitForm, children }: IRoleFormProps) => {

  const viewing = mode === FormMode.viewing;
  const editing = mode === FormMode.editing;
  const adding = mode === FormMode.adding;

  const { title, users } = role;

  if (!document.getElementById('div-details')) {

  }
  const showUsers = !users.find(q => q.inAdding);
  /* 
  We have, at two places:
    <EditRole inLine={true} />
    <EditRole inLine={false} />
    so we execute loadRoleUsers() twice in UserList, but OK
  */

  
  const dispatch = useRoleDispatch();

  const closeForm = () => {
    dispatch({ type: ActionTypes.CLOSE_ROLE_FORM })
  }

  const cancelForm = () => {
    dispatch({ type: ActionTypes.CANCEL_ROLE_FORM })
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: role,
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Required"),
      // email: Yup.string()
      //   .email("You have enter an invalid email address")
      //   .required("Required"),
      // rollno: Yup.number()
      //   .positive("Invalid roll number")
      //   .integer("Invalid roll number")
      //   .required("Required"),
    }),
    onSubmit: (values: IRole) => {
      //alert(JSON.stringify(values, null, 2));
      console.log('RoleForm.onSubmit', JSON.stringify(values, null, 2))
      submitForm(values)
      //props.handleClose(false);
    }
  });

  // eslint-disable-next-line no-self-compare
  // const nameRef = useRef<HTMLAreaElement | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current!.focus()
  }, [nameRef])

  
  return (
    <div className="form-wrapper p-2">
      <CloseButton onClick={closeForm} className="float-end" />
      <Form onSubmit={formik.handleSubmit}>
        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            as="input"
            placeholder="New Role"
            name="title"
            ref={nameRef}
            onChange={formik.handleChange}
            //onBlur={formik.handleBlur}
            // onBlur={(e: React.FocusEvent<HTMLTextAreaElement>): void => {
            //   if (isEdit && formik.initialValues.title !== formik.values.title)
            //     formik.submitForm();
            // }}
            value={formik.values.title}
            style={{ width: '100%' }}
            disabled={viewing}
          />
          <Form.Text className="text-danger">
            {formik.touched.title && formik.errors.title ? (
              <div className="text-danger">{formik.errors.title}</div>
            ) : null}
          </Form.Text>
        </Form.Group>

        {/* <Form.Group>
          <Form.Label>Number of Users </Form.Label>
          <div className="text-secondary">{formik.values.numOfUsers}</div>
          // <div className="p-1 bg-dark text-white">{createdBy}, {formatDate(created.date)}</div> 
        </Form.Group> */}

        <Form.Group>
          <Form.Label className="m-1 mb-0">Users ({`${formik.values.numOfUsers}`}) </Form.Label>
          {showUsers &&
            <UserList level={1} parentRole={title} title={title} />
          }
        </Form.Group>

        {(viewing || editing) &&
          <CreatedModifiedForm
            created={role.created}
            createdBy={role.createdBy}
            modified={role.modified}
            modifiedBy={role.modifiedBy}
            classes="text-secondary"
          />
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

export default RoleForm;