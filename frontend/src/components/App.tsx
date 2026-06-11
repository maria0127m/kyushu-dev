import styled from "@emotion/styled";
import { css, Global } from "@emotion/react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ja";

import PageMain from "./PageMain";

const globalStyles = css`
  * {
    font-family: "Noto Sans Mono", "Noto Sans JP", sans-serif;
    font-optical-sizing: auto;
    font-style: normal;
  }

  body {
    color: #333;
    line-height: 1.8;
    font-size: 15px;
    margin: 0;
    background: #fff;
    overflow: hidden;
  }
`;

const Wrapper = styled.div`
  width: 100vw;
  height: 100dvh;
  overflow-y: auto;
  background: #fff;
`;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");
dayjs.locale("ja");

const App = () => {
  return (
    <>
      <Global styles={globalStyles} />
      <Wrapper>
        <PageMain />
      </Wrapper>
    </>
  );
};

export default App;