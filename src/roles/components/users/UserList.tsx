import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { IParentInfo, IUser } from "roles/types";
import { useRoleContext } from "roles/RoleProvider";
import { useGlobalState } from "global/GlobalProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import UserRow from "roles/components/users/UserRow";

const UserList = ({ title, parentRole, level }: IParentInfo) => {

  const pageSize = 100;
  const { canEdit } = useGlobalState();

  const { state, loadRoleUsers, editUser, viewUser } = useRoleContext();
  const { parentNodes, roles, userLoading, error } = state;
  const { roleId, nickName } = parentNodes!;

  const role = roles.find(c => c.title === parentRole)!
  const { users, numOfUsers, hasMore } = role;

  async function loadMore() {
    try {
      const includeUserId = parentNodes.nickName ? parseInt(parentNodes.nickName) : undefined;
      await loadRoleUsers({ parentRole, startCursor: users.length, level: 0, includeUserId });
    }
    catch (error) {
    }
    finally {
    }
  }

  useEffect(() => {
    if (numOfUsers > 0 && users.length === 0) //(users.length === 0 || users.length===1 && users[0].inAdding)) 
      loadMore();
  }, [])

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: userLoading,
    hasNextPage: hasMore!,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: '0px 0px 100px 0px',
  });

  useEffect(() => {
    if (roleId != null) {
      if (roleId === parentRole!.toString() && nickName) {
        if (canEdit)
          editUser(nickName)
        else
          viewUser(nickName)
      }
    }
  }, [viewUser, parentRole, roleId, nickName, canEdit]);

  // console.log('UserList render', users, level)

  return (
    <div
      ref={rootRef}
      className="ms-2 border"
      // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
      style={{ maxHeight: '300px', overflowY: 'auto' }}
    >
      <List>
        {users.length === 0 &&
          <div>No users</div>
        }
        {users.map((user: IUser) => {
          return <ListItem key={user.nickName}>
            <UserRow
              user={user}
              roleInAdding={role!.inAdding}
            />
          </ListItem>
        })}
        {hasMore && (
          <ListItem ref={infiniteRef}>
            <Loading />
          </ListItem>
        )}
      </List>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default UserList;
