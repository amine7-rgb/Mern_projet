import axios from "axios";

const API_URL = "http://localhost:8000/api/auth/";

const register = (username, email, password ,photo) => {
  return axios.post(API_URL + "signup", {
    username,
    email,
    password,
    photo
  });
};

const login = (username, password) => {
  return axios
    .post(API_URL + "signin", {
      username,
      password,
    })
    .then((response) => {
      if (response.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
};

const resetPassword = (email) => {
  return axios.post(API_URL + "reset", { email });
};

const verifyemail=(id)=>{
  return axios.post("http://localhost:8000/verify-email/"+`${id}`)
 
}
 const posttoken =(token, {code ,password})=> {
  return axios.post("http://localhost:8000/reset-password/"+`${token}`, {code ,password});
}

const authService = {
  register,
  login,
  logout,
  resetPassword,
  posttoken,
  verifyemail,
};

export default authService;
