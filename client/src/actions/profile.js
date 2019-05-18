import { setAlert } from "./alert";
import { GET_PROFILE, PROFILE_ERROR } from "./types";
import getBaseHeaders from "../utils/baseHeaders";

export const getCurrentProfile = () => async dispatch => {
  const config = {
    method: "GET",
    headers: getBaseHeaders(localStorage.token)
  };

  try {
    const res = await fetch("/api/profile/current", config);
    const data = await res.json();
    if (!res.ok) {
      const errors = data.errors;
      if (errors) {
        errors.map(error => dispatch(setAlert(error.msg, "danger")));
      }

      dispatch({
        type: PROFILE_ERROR,
        data: { msg: res.statusText, status: res.status }
      });
      return;
    }

    dispatch({
      type: GET_PROFILE,
      data
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      data: { msg: err.response.statusText, status: err.response.status }
    });
  }
};
