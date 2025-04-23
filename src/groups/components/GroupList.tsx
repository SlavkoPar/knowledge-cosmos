import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import GroupRow from "groups/components/GroupRow";
import { IParentInfo } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";
import useFetchWithMsal from "hooks/useFetchWithMsal";
import { protectedResources } from "authConfig";

const GroupList = ({ title, groupKey, level }: IParentInfo) => {
    const { state, getSubGroups } = useGroupContext();
    const { groups } = state;
    // { error, }
    const { execute } = useFetchWithMsal("", {
        scopes: protectedResources.KnowledgeAPI.scopes.read
    });

    useEffect(() => {
        //getSubGroups(execute, groupKey);
        (async () => {
            console.log('zovem getSubGroups', {groupKey})
            await getSubGroups(groupKey)
                .then((response: boolean)=> {
                });
        })()
    }, [getSubGroups, groupKey]);

   
    const mySubGroups = groupKey.id === 'null'
        ? groups.filter(c => c.parentGroup === null)
        : groups.filter(c => c.parentGroup === groupKey.id);
    console.log("+++++++>>>>>>> GroupList ", { groupKey, groups, mySubGroups});

    return (
        <div className={level! > 1 ? 'ms-2' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    { mySubGroups.map(group =>
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
