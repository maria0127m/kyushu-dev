import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { BrowserRouter, Link, Routes, Route } from "react-router";

import TopPage from "./TopPage";
import UserPage from "./UserPage";
import { type User, fetchUserMe } from "../libs/api";

const Wrapper = styled.div`
  width: calc(100% - 64px);
  max-width: 800px;
  min-height: 100dvh;
  flex-shrink: 0;
  margin: 0 auto;
  padding: 16px 0 48px 0;
  flex-direction: column;
  background: #fff;
  box-sizing: border-box;
  scroll-snap-align: start;
`;

const NavButtons = styled.nav`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin: 0 0 24px 0;
  padding-top: 16px;
  border-top: solid 1px #eee;

  a,
  button {
    color: inherit;
    font: inherit;
    text-decoration: none;
    padding: 6px 10px;
    border: solid 1px #eee;
    border-radius: 999px;
    background: #fff;
    cursor: pointer;
  }

  a:hover,
  button:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

interface PageMainProps {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  ref: React.RefObject<HTMLDivElement | null>;
}

const PageMain = ({ wrapperRef, ref }: PageMainProps) => {
  const [me, setMe] = useState<User | null>(null);

  const scrollToTop = () => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    (async () => {
      const result = await fetchUserMe();
      if (result.type === "success") {
        setMe(result.value);
      } else {
        setMe(null);
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      <Wrapper ref={ref}>
        <NavButtons>
          <Link to="/">ホーム</Link>
          {me && <Link to={`/@${me.screenName}`}>自分のページ</Link>}
          <Link to="/#everyone">みんなの記録</Link>
          <button type="button" onClick={scrollToTop}>
            アカウント設定／サインイン
          </button>
          <a href="https://github.com/maria0127m/kyushu-dev">
            GitHub / 使い方
          </a>
        </NavButtons>

        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/:screenName" element={<UserPage />} />
        </Routes>
      </Wrapper>
    </BrowserRouter>
  );
};

export default PageMain;