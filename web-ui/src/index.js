import "./index.css";
import { jsonToSchema } from "../../lib";

const toCamel = (s) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

const isArray = function (a) {
  return Array.isArray(a);
};

const isObject = function (o) {
  return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

const keysToCamel = function (o) {
  if (isObject(o)) {
    const n = {};

    Object.keys(o)
      .forEach((k) => {
        n[toCamel(k)] = keysToCamel(o[k]);
      });

    return n;
  } else if (isArray(o)) {
    return o.map((i) => {
      return keysToCamel(i);
    });
  }

  return o;
};

const setup = () => {
  const jsonTextarea = document.getElementById("json");
  const graphqlTextarea = document.getElementById("graphql");
  const jsonSpaces = 2;

  const setGraphQLResult = () => {
    if (!jsonTextarea.value) {
      graphqlTextarea.value = "";
      return;
    }

    try {
      const jsonObject = keysToCamel(JSON.parse(jsonTextarea.value));
      jsonTextarea.value = JSON.stringify(jsonObject, null, jsonSpaces);
      jsonTextarea.classList.remove("invalid");

      const schema = jsonToSchema({ jsonInput: jsonTextarea.value });
      graphqlTextarea.value = schema.value;
    } catch (error) {
      jsonTextarea.classList.add("invalid");
      graphqlTextarea.value = `Bad JSON:\n${error.message}`;
      return;
    }
  };

  const typingTimerLength = 500;
  let timerId = null;

  jsonTextarea.addEventListener(
    "input",
    () => {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }

      timerId = setTimeout(() => {
        setGraphQLResult();
      }, typingTimerLength);
    },
    false
  );
  setGraphQLResult();
};

document.addEventListener("DOMContentLoaded", setup);
