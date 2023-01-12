import axios from "axios";
import crypto from "crypto";

const algorithm = process.env.ENCRYPTION_ALGORITHM;
const secretKey = process.env.ENCRYPTION_KEY;

export const convertToBase64 = (string) => {
  try {
    return new Buffer(string).toString("base64");
  } catch (e) {
    return string;
  }
};

export const convertFromBase64 = (base64String) => {
  try {
    return new Buffer(base64String, "base64").toString("ascii");
  } catch (e) {
    return base64String;
  }
};

export const encrypt = (text) => {
  if (text === null || text === undefined) {
    return text;
  }
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
};

export const decrypt = (hash) => {
  let decrpyted;
  try {
    if (typeof hash === "string") {
      hash = JSON.parse(hash);
    }
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(hash.iv, "hex")
    );

    decrpyted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, "hex")),
      decipher.final(),
    ]);
  } catch (e) {
    return hash;
  }

  return decrpyted.toString();
};

export class Calls {
  constructor() {
    this.verifyUser = async (instance) => {
      const data = await instance
        .get(`${process.env.API_DOMAIN}api/user/validate`)
        .catch((e) => {
          // console.log("Server error", e?.config?.headers, e?.message);
          // return e?.response?.status;
        });

      if (data) {
        // console.log("Data worked!", data?.data);
        return data;
      }
    };
    this.getChatRooms = async (instance) => {
      const response = await instance
        .get(`${process.env.API_DOMAIN}api/chatroom`)
        .catch((e) => {});

      if (response) {
        const chatRooms = response?.data?.Data;
        return chatRooms;
      }
    };
    this.getUser = async (instance) => {
      const url = `${process.env.API_DOMAIN}api/user`;
      const response = await instance.get(url).catch();
      if (response) {
        return response?.data;
      }
    };
    this.getDiscussions = async (instance) => {
      const response = await instance
        .get(`${process.env.API_DOMAIN}api/discussion`)
        .catch((e) => {});

      if (response) {
        const chatRooms = response?.data?.Data;
        return chatRooms;
      }
    };
    this.getNotifications = async (instance) => {
      const response = await instance
        .get(`${process.env.API_DOMAIN}api/notification`)
        .catch((e) => {});

      if (response) {
        const notifications = response?.data?.Data;
        return notifications;
      }
    };
    this.getAllUsers = async (instance) => {
      const response = await instance
        .get(`${process.env.API_DOMAIN}api/user/all`)

        .catch((e) => {});
      if (response) {
        const allUsers = response?.data?.Data;
        return allUsers;
      }
    };
    this.getAllGroups = async (instance) => {
      const response = await instance
        .get(`${process.env.API_DOMAIN}api/chatroom/group`)

        .catch((e) => {});

      if (response) {
        const allGroups = response?.data?.Data;
        return allGroups;
      }
    };
    this.getSentRequests = async (instance) => {
      const response = await instance
        .get(`${process.env.API_DOMAIN}api/requests/sent`)
        .catch((e) => {});
      if (response) {
        const requests = response.data.Data;
        return requests;
      }
    };
    this.getRecievedRequests = async (instance) => {
      const response = await instance
        .get(`${process.env.API_DOMAIN}api/requests/recieved`)
        .catch((e) => {});
      if (response) {
        const requests = response.data?.Data;
        return requests;
      }
    };
  }
}

export class Table {
  constructor(initial /**@type object*/) {
    if (initial) {
      this.instance = { ...initial };
    } else {
      this.instance = null;
    }
  }

  append(values /**@type object*/) {
    if (typeof values === "object") {
      const oldValues = { ...this.instance };
      this.instance = { ...oldValues, ...values };
    }

    return false;
  }

  prepend(values /**@type object*/) {
    if (typeof values === "object") {
      const oldValues = { ...this.instance };
      this.instance = { ...values, ...oldValues };
    }

    return false;
  }

  update(key, value) {
    if (!this.instance) {
      return;
    }
    this.instance[key] = value;
  }

  delete(key) {
    if (!this.instance) {
      return;
    }
    delete this.instance[key];
  }
  get(key) {
    if (!this.instance) {
      return;
    }
    return this.instance[key];
  }
  map(executable /**@type function */) {
    if (!this.instance) {
      return;
    }
    const entries = Object.entries(this.instance);
    return entries.map(([key, value]) => {
      return executable(value, key);
    });
  }

  toArray() {
    if (this.instance === null) {
      return [];
    }

    const elements = [];

    for (const key in this.instance) {
      elements.push(this.instance[key]);
    }

    return elements;
  }

  isEmpty() {
    if (this.instance === null) {
      return true;
    }

    return Object.keys(this.instance).length < 1;
  }

  values() {
    return { ...this.instance };
  }
}
