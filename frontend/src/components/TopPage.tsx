import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Link } from "react-router";

import {
  type UserWithLatestCheckin,
  fetchAllUsers,
} from "../libs/api";
import { StatusCircle } from "./utils";
import kyudaiCampus from "../assets/kyudai-campus.png";

const H3 = styled.h3`
  font-size: 1em;
  margin: 24px 0 0 0;
`;

const List = styled.ul`
  padding-left: 0;
  list-style: none;
`;

const ListLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  display: block;
  padding: 4px 0;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

const HeroImage = styled.img`
  width: 100%;
  display: block;
  margin: 8px 0 28px 0;
`;

const TopPage = () => {
  const [allUsers, setAllUsers] = useState<UserWithLatestCheckin[]>([]);

  useEffect(() => {
    (async () => {
      const result = await fetchAllUsers();
      if (result.type === "success") {
        setAllUsers(result.value);
      }
    })();
  }, []);

  return (
    <>
      <HeroImage src={kyudaiCampus} alt="九州大学キャンパス" />

      <H3 id="everyone">みんなのきろく</H3>

      <List>
        {allUsers.map((user) => {
          const status =
            user.latestLocationId === "kyudai"
              ? "internal"
              : user.latestLocationId === "others"
                ? "others"
                : "inactive";

          const statusText =
            status === "internal"
              ? "九州大学"
              : status === "others"
                ? "学外"
                : "不明";

          return (
            <li key={user.screenName}>
              <ListLink to={`/@${user.screenName}`}>
                <StatusCircle status={status} />
                {user.name}（@{user.screenName}） 現在：{statusText}
              </ListLink>
            </li>
          );
        })}
      </List>
    </>
  );
};

export default TopPage;