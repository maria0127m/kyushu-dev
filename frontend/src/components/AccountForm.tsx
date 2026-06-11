import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import {
  createUser,
  fetchCurrentToken,
  fetchUserMe,
  postSignin,
  postSignout,
  updateUser,
} from "../libs/api";

const Wrapper = styled.div`
  width: 100%;
  max-width: 800px;
  min-height: auto;
  flex-shrink: 0;
  margin: 0 auto;
  padding-top: 0;
  flex-direction: column;
  background: #fff;
  box-sizing: border-box;
`;

const FormWrapper = styled.div`
  display: flex;
  gap: 32px;

  @media screen and (width < 800px) {
    flex-direction: column;
  }
`;

const Form = styled.form`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const H2 = styled.h2`
  color: #333;
  font-size: 1em;
  margin: 0;
`;

const FormContent = styled.div`
  display: flex;
  margin-bottom: auto;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;

  @media screen and (width < 800px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const TextBox = styled.input`
  width: 100%;
  font-size: inherit;
  margin-top: -4px;
  padding: 4px 8px 4px 8px;
  border: none;
  border-bottom: 1px solid #ccc;
  border-radius: 0;
  box-sizing: border-box;
`;

const Heading = styled.div`
  color: #666;
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 4px;
`;

const Visibility = styled.div`
  display: flex;
  gap: 16px;

  @media screen and (width < 800px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;

  @media screen and (width < 600px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Button = styled.button`
  width: 100%;
  color: inherit;
  font-size: inherit;
  padding: 6px 0;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background: #f6f6f6;

  &:hover {
    background: #eee;
  }
`;

const TokenBox = styled.textarea`
  width: 100%;
  min-height: 88px;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  resize: vertical;
`;

const TokenNote = styled.p`
  color: #666;
  font-size: 13px;
  margin: 4px 0 0 0;
`;

const AccountForm = () => {
  const [registered, setRegistered] = useState<
    "registered" | "unregistered" | "loading"
  >("loading");

  const [screenName, setScreenName] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState<
    "public" | "private" | "internal"
  >("public");
  const [displaysPast, setDisplaysPast] = useState(true);
  const [listed, setListed] = useState(false);

  const [token, setToken] = useState("");
  const [currentToken, setCurrentToken] = useState("");

  const register = async () => {
    const result = await createUser(screenName, name);

    if (result.type === "success") {
      setRegistered("registered");
      setCurrentToken("");
    } else {
      if (result.subtype === "ID_ALREADY_USED") {
        alert("指定された ID は既に使用されています");
      } else {
        alert("登録に失敗しました");
      }
    }
  };

  const update = async () => {
    const result = await updateUser(
      screenName,
      name,
      message,
      visibility,
      listed,
      displaysPast
    );

    if (result.type === "success") {
      alert("更新しました");
    } else {
      if (result.subtype === "ID_ALREADY_USED") {
        alert("指定された ID は既に使用されています");
      } else {
        alert("更新に失敗しました");
      }
    }
  };

  const showCurrentToken = async () => {
    if (currentToken) {
      setCurrentToken("");
      return;
    }

    const result = await fetchCurrentToken();

    if (result.type === "success") {
      setCurrentToken(result.value);
    } else {
      alert("トークンの取得に失敗しました");
    }
  };

  const copyCurrentToken = async () => {
    if (!currentToken) {
      return;
    }

    try {
      await navigator.clipboard.writeText(currentToken);
      alert("トークンをコピーしました");
    } catch {
      alert("コピーに失敗しました。手動で選択してコピーしてください");
    }
  };

  const regenerateToken = async () => {
    const ok = window.confirm(
      "トークンを再発行して表示しますか？\n（現在のトークンは失効します。サインインの状態は維持されます）"
    );

    if (!ok) {
      return;
    }

    setCurrentToken("");
    window.open("/api/users/me/token", "_blank");
  };

  const signin = async () => {
    const result = await postSignin(token);

    if (result.type === "success") {
      const user = result.value;

      setRegistered("registered");
      setScreenName(user.screenName);
      setName(user.name);
      setMessage(user.message);
      setVisibility(user.visibility);
      setDisplaysPast(user.displaysPast);
      setListed(user.listed);
      setToken("");
      setCurrentToken("");
    } else {
      alert("サインインに失敗しました");
    }
  };

  const signout = async () => {
    const ok = window.confirm(
      "サインアウトしますか？\n（サインアウトする前に、必ず現在のトークンをメモしてください）"
    );

    if (!ok) {
      return;
    }

    const result = await postSignout();

    if (result.type === "success") {
      setRegistered("unregistered");
      setScreenName("");
      setName("");
      setMessage("");
      setVisibility("public");
      setDisplaysPast(true);
      setListed(false);
      setToken("");
      setCurrentToken("");
    } else {
      alert("サインアウトに失敗しました");
    }
  };

  useEffect(() => {
    (async () => {
      const result = await fetchUserMe();

      if (result.type === "success") {
        const user = result.value;

        setRegistered("registered");
        setScreenName(user.screenName);
        setName(user.name);
        setMessage(user.message);
        setVisibility(user.visibility);
        setDisplaysPast(user.displaysPast);
        setListed(user.listed);
      } else {
        setRegistered("unregistered");
      }
    })();
  }, []);

  return (
    <Wrapper>
      {registered === "loading" ? (
        <p>Loading...</p>
      ) : (
        <>
          {registered === "registered" ? (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <H2>アカウント情報</H2>

              <FormContent>
                <Row>
                  <label>
                    <Heading>ID（[a-zA-Z0-9_]、4–16文字）</Heading>
                    <TextBox
                      type="text"
                      value={screenName}
                      onChange={(e) => setScreenName(e.target.value)}
                    />
                  </label>

                  <label>
                    <Heading>名前</Heading>
                    <TextBox
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                </Row>

                <label>
                  <Heading>ひとこと</Heading>
                  <TextBox
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </label>

                <div>
                  <Heading>公開設定</Heading>

                  <Visibility>
                    <label>
                      <input
                        type="radio"
                        checked={visibility === "public"}
                        onChange={() => setVisibility("public")}
                      />
                      公開
                    </label>

                    <label>
                      <input
                        type="radio"
                        checked={visibility === "private"}
                        onChange={() => setVisibility("private")}
                      />
                      非公開
                    </label>

                    <label>
                      <input
                        type="radio"
                        checked={visibility === "internal"}
                        onChange={() => setVisibility("internal")}
                      />
                      学内限定
                    </label>
                  </Visibility>
                </div>

                <label>
                  <input
                    type="checkbox"
                    checked={listed}
                    onChange={(e) => setListed(e.target.checked)}
                  />
                  一覧に表示
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={displaysPast}
                    onChange={(e) => setDisplaysPast(e.target.checked)}
                  />
                  過去の記録を表示
                </label>

                <TokenNote>
                  自動チェックイン設定に使う場合は、現在のトークンを表示してコピーしてください。
                  トークンは他人に見せないでください。
                </TokenNote>

                {currentToken && (
                  <TokenBox readOnly value={currentToken} />
                )}
              </FormContent>

              <Buttons>
                <Button type="button" onClick={update}>
                  更新
                </Button>

                <Button type="button" onClick={showCurrentToken}>
                  {currentToken ? "トークンを隠す" : "現在のトークンを表示"}
                </Button>

                {currentToken && (
                  <Button type="button" onClick={copyCurrentToken}>
                    トークンをコピー
                  </Button>
                )}

                <Button type="button" onClick={regenerateToken}>
                  トークン再生成
                </Button>

                <Button type="button" onClick={signout}>
                  サインアウト
                </Button>
              </Buttons>
            </Form>
          ) : (
            <FormWrapper>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <H2>アカウント登録</H2>

                <FormContent>
                  <label>
                    <Heading>ID（[a-z0-9_]、4–16文字）</Heading>
                    <TextBox
                      type="text"
                      value={screenName}
                      onChange={(e) => setScreenName(e.target.value)}
                    />
                  </label>

                  <label>
                    <Heading>名前</Heading>
                    <TextBox
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                </FormContent>

                <Buttons>
                  <Button type="button" onClick={register}>
                    登録
                  </Button>
                </Buttons>
              </Form>

              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <H2>サインイン</H2>

                <FormContent>
                  <label>
                    <Heading>トークン</Heading>
                    <TextBox
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                  </label>
                </FormContent>

                <Buttons>
                  <Button type="button" onClick={signin}>
                    サインイン
                  </Button>
                </Buttons>
              </Form>
            </FormWrapper>
          )}
        </>
      )}
    </Wrapper>
  );
};

export default AccountForm;