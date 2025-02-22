import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import GroupRow from "groups/components/GroupRow";
import { IParentInfo } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";

const GroupList = ({ title, parentGroup, level }: IParentInfo) => {
    const { state, getSubGroups } = useGroupContext();
    useEffect(() => {
        console.log('getSubGroups', title, level)
        getSubGroups({ parentGroup, level });
    }, [getSubGroups, title, parentGroup, level]);

    const mySubGroups = state.groups.filter(c => c.parentGroup === parentGroup);
    return (
        <div className={level>1?'ms-2':''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubGroups.map(group => 
                        <GroupRow group={group} key={group.id} />)
                    }
                </ListGroup>

                {/* {state.error && state.error} */}
                {/* {state.loading && <div>...loading</div>} */}
            </>
        </div>
    );
};

export default GroupList;
