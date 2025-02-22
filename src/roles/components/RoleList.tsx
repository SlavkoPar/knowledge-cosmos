import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import RoleRow from "roles/components/RoleRow";
import { IParentInfo } from "roles/types";
import { useRoleContext } from "roles/RoleProvider";

const RoleList = ({ title, parentRole, level }: IParentInfo) => {
    const { state, getSubRoles } = useRoleContext();
    useEffect(() => {
        console.log('getSubRoles', title, level)
        getSubRoles({ parentRole, level });
    }, [getSubRoles, title, parentRole, level]);

    const mySubRoles = state.roles.filter(c => c.parentRole === parentRole);
    return (
        <div className={level>1?'ms-2':''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubRoles.map(role => 
                        <RoleRow role={role} key={role.title} />)
                    }
                </ListGroup>

                {/* {state.error && state.error} */}
                {/* {state.loading && <div>...loading</div>} */}
            </>
        </div>
    );
};

export default RoleList;
