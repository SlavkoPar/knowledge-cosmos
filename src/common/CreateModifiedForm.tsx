import React from "react";
import { Form, Container, Row, Col } from "react-bootstrap";
import { formatDate } from 'common/utilities'
import { ICreatedModifiedProps } from './types'

export const CreatedModifiedForm = ({ created, createdBy, modified, modifiedBy, classes }: ICreatedModifiedProps) => {
  return (
    <Container className="my-1">
      <Row>
        <Col className="px-0">

          {created &&
            <>
              {/* <legend style={{ margin: '0px' }}>Created</legend> */}
              <fieldset className="fieldsets">

                <Form.Group>
                  <Form.Label>Created By: </Form.Label>
                  <div className={classes}>{createdBy}, {formatDate(created.date)}</div>
                  {/* <div className="p-1 bg-dark text-white">{createdBy}, {formatDate(created.date)}</div> */}
                </Form.Group>
                {/* <Form.Group controlId="created_By_userName">
                  <Form.Label className="id">Created By</Form.Label>
                  <input name="createdBy" type="text" defaultValue={createdBy} className="form-control form-control-sm" disabled />
                </Form.Group>

                <Form.Group controlId="created">
                  <Form.Label className="id">Date:</Form.Label>
                  <input type="text" defaultValue={formatDate(created.date)} className="form-control form-control-sm" disabled />
                </Form.Group> */}
              </fieldset>
            </>
          }

          {modified &&
            <>
              {/* <legend style={{ margin: '0px' }}>Modified</legend> */}
              < fieldset className="fieldsets">
              <Form.Group>
                  <Form.Label>Modified By: </Form.Label>
                  <div className="text-muted">{modifiedBy}, {formatDate(modified.date)}</div>
                  {/* <div className="p-1 bg-dark text-white">{createdBy}, {formatDate(created.date)}</div> */}
                </Form.Group>
                {/* <FormGroup>
                  <label htmlFor="modifiedBy" className="form-label">Modified By</label>
                  <input name="modifiedBy" defaultValue={modifiedBy} type="text" className="form-control form-control-sm" disabled />
                </FormGroup>

                <Form.Group controlId="modified">
                  <input type="text" defaultValue={formatDate(modified.date)} className="form-control form-control-sm" disabled />
                </Form.Group> */}
              </fieldset>
            </>
          }
        </Col>
      </Row >
    </Container >
  );
};
