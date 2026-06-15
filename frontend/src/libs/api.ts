interface Success<T> {
  type: "success";
  value: T;
}

interface Error {
  type: "error";
  subtype?: string;
}

export type Result<T> = Success<T> | Error;

const success = <T>(value: T): Success<T> => {
  return { type: "success", value };
};

const error = (subtype?: string): Error => {
  return { type: "error", subtype };
};

export interface User {
  id: string;
  screenName: string;
  name: string;
  message: string;
  visibility: "public" | "private" | "internal";
  listed: boolean;
  displaysPast: boolean;
}

export type UserWithLatestCheckin = User & {
  latestLocationId: string;
};

export type UserWithCheckins = User & {
  checkins: Checkin[];
};

export interface Checkin {
  year: number;
  month: number;
  day: number;
  hours: number;
  locationId: string;
  count: number;
  updatedAt: string;
}

export const fetchAllUsers = async () => {
  try {
    const response = await fetch("/api/users");
    if (!response.ok) {
      return error();
    }
    return success((await response.json()) as UserWithLatestCheckin[]);
  } catch {
    return error();
  }
};

export const fetchUser = async (screenName: string) => {
  try {
    const response = await fetch(`/api/users/@${screenName}`);
    if (!response.ok) {
      return error();
    }
    return success((await response.json()) as UserWithCheckins);
  } catch {
    return error();
  }
};

export const fetchUserMe = async () => {
  try {
    const response = await fetch("/api/users/me");
    if (!response.ok) {
      return error();
    }
    return success((await response.json()) as User);
  } catch (e) {
    return error();
  }
};

export const createUser = async (screenName: string, name: string) => {
  try {
    const response = await fetch("/api/users/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        screenName,
        name,
        message: "",
        visibility: "private",
        listed: false,
        displaysPast: false,
      }),
    });
    if (!response.ok) {
      const result = await response.json();
      if (result.type === "ID_ALREADY_USED") {
        return error("ID_ALREADY_USED");
      }
      return error();
    }
    return success(undefined);
  } catch {
    return error();
  }
};

export const updateUser = async (
  screenName: string,
  name: string,
  message: string,
  visibility: "public" | "private" | "internal",
  listed: boolean,
  displaysPast: boolean
) => {
  try {
    const response = await fetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        screenName,
        name,
        message,
        visibility,
        listed,
        displaysPast,
      }),
    });
    if (!response.ok) {
      const result = await response.json();
      if (result.type === "ID_ALREADY_USED") {
        return error("ID_ALREADY_USED");
      }
      return error();
    }
    return success(undefined);
  } catch {
    return error();
  }
};

export const postSignin = async (token: string) => {
  try {
    const response = await fetch("/api/users/me/signin", {
      method: "POST",
      headers: {
        authorization: token.trim(),
      },
    });
    if (!response.ok) {
      return error();
    }
    return success((await response.json()) as User);
  } catch {
    return error();
  }
};

export const postSignout = async () => {
  try {
    const response = await fetch("/api/users/me/signout", {
      method: "POST",
    });
    if (!response.ok) {
      return error();
    }
    return success(undefined);
  } catch {
    return error();
  }
};

export const fetchCurrentToken = async () => {
  try {
    const response = await fetch("/api/users/me/token/current");

    if (!response.ok) {
      return error();
    }

    return success(await response.text());
  } catch {
    return error();
  }
};