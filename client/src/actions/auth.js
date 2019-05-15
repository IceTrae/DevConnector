import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL
} from "./types";
import { setAlert } from "./alert";
import getBaseHeaders from "../utils/baseHeaders";

export const getUser = () => async dispatch => {
  const config = {
    method: "GET",
    headers: getBaseHeaders(localStorage.token)
  };

  try {
    const res = await fetch("/api/users/current", config);
    const data = await res.json();
    if (!res.ok) {
      const errors = data.errors;
      if (errors) {
        errors.map(error => dispatch(setAlert(error.msg, "danger")));
      }

      dispatch({ type: AUTH_ERROR });
      return;
    }

    dispatch({
      type: USER_LOADED,
      data
    });
  } catch (err) {
    dispatch({ type: AUTH_ERROR });
  }
};

export const register = ({ name, email, password }) => async dispatch => {
  const body = JSON.stringify({ name, email, password });
  const config = {
    method: "POST",
    headers: getBaseHeaders(),
    body
  };

  try {
    const res = await fetch("/api/users/register", config);
    const data = await res.json();
    if (!res.ok) {
      const errors = data.errors;
      if (errors) {
        errors.map(error => dispatch(setAlert(error.msg, "danger")));
      }

      dispatch({ type: REGISTER_FAIL });
      return;
    }

    dispatch({
      type: REGISTER_SUCCESS,
      data
    });

    dispatch(getUser());
  } catch (err) {
    dispatch({ type: REGISTER_FAIL });
  }
};

export const login = (email, password) => async dispatch => {
  const body = JSON.stringify({ email, password });
  const config = {
    method: "POST",
    headers: getBaseHeaders(),
    body
  };

  try {
    const res = await fetch("/api/users/login", config);
    const data = await res.json();
    if (!res.ok) {
      const errors = data.errors;
      if (errors) {
        errors.map(error => dispatch(setAlert(error.msg, "danger")));
      }

      dispatch({ type: LOGIN_FAIL });
      return;
    }

    dispatch({
      type: LOGIN_SUCCESS,
      data
    });

    dispatch(getUser());
  } catch (err) {
    dispatch({ type: LOGIN_FAIL });
  }
};
