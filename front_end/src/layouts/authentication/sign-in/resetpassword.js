import { useState } from "react";
import axios from "axios";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";
import { Link, useNavigate } from 'react-router-dom';
import BasicLayout from "layouts/authentication/components/BasicLayout";
import curved6 from "assets/images/curved-images/hero_3.jpg";
import Card from "@mui/material/Card";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetPasswordNow, setResetPasswordNow] = useState(false); // use camelCase for variable names
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState(""); // use camelCase for variable names
  const navigate = useNavigate();
  const [hideformemail,sethideemail]=useState(true);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const url = "http://localhost:8000/api/auth/reset";
      const  res  = await axios.post(url, { email });
      setSuccessMessage(res.message);
      setToken(res.data);
      setTimeout(() => {
        setResetPasswordNow(true);
        sethideemail(false);

      }, 6000);
    
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status <= 500) {
        setError(error.response.data.message);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    try {
          const response = await axios.post("http://localhost:8000/reset-password/" + `${token}`, { code, password });
          setResetPasswordNow(false);
          setSuccessMessage(response.data.message);
          setPassword("");
          setPasswordConfirm("");
          setTimeout(() => {
            navigate('/authentication/sign-in');
          }, 6000);
      } catch (error) {
          setError(
              (error.response && error.response.data && error.response.data.message) ||
              error.message ||
              error.toString()
          );
      }
  };

  const handleSubmitEmail = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/auth/reset", {
        email: email,
      });
      setToken(response.data);
      setResetPasswordNow(true);
    } catch (error) {
      setError(
        (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString()
      );
    }
  };
  return (
    <>
      <BasicLayout
        title="Welcome!"
        description="Use these forms to update your password ."
        image={curved6}
      >
      <SoftBox display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 200px)">
        <SoftBox width={400}>
          {hideformemail && (
            <><form onSubmit={handleSubmit}>
                              <Card>
                                  <SoftBox p={3}>
                                      <SoftTypography variant="h5" fontWeight="bold" mb={1}>
                                          Reset Password
                                      </SoftTypography>
                                      <SoftTypography variant="body2" color="textSecondary">
                                          Enter your email below to receive instructions on how to reset your password.
                                      </SoftTypography>
                                      <SoftBox display="flex" flexDirection="column" mt={3}>
                                          <SoftBox mb={1}>
                                              <SoftTypography component="label" variant="subtitle1" fontWeight="bold">
                                                  Email
                                              </SoftTypography>
                                          </SoftBox>
                                          <SoftInput
                                              type="email"
                                              placeholder="Enter your email"
                                              value={email}
                                              onChange={(e) => setEmail(e.target.value)}
                                              required />
                                      </SoftBox>
                                      <SoftBox mt={3}>
                                          <SoftButton variant="gradient" color="info" fullWidth type="submit">
                                              Reset Password
                                          </SoftButton>
                                      </SoftBox>

                                  </SoftBox>

                              </Card>
                          </form><SoftBox
                              mx="auto"
                              width="fit-content"
                          >
                                  {successMessage && (
                                      <SoftBox
                                          p={3}
                                          mt={3}
                                          bg="deepskyblue"
                                          color="white"
                                          sx={{
                                              fontFamily: 'Calibri',
                                              borderRadius: '5px',
                                              width: '200px',
                                              height: '80px',
                                              display: 'flex',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                              ml: 'auto',
                                              boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.2)'
                                          }}
                                      >
                                          <SoftTypography variant="h6">{successMessage}</SoftTypography>
                                      </SoftBox>
                                  )}

                                  {error && (
                                      <SoftBox
                                          p={3}
                                          mt={3}
                                          bg="red"
                                          color="white"
                                          sx={{
                                              fontFamily: 'Calibri',
                                              borderRadius: '5px',
                                              width: '200px',
                                              height: '80px',
                                              display: 'flex',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                              ml: 'auto',
                                              boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.2)'
                                          }}
                                      >
                                          <SoftTypography variant="h6">{error}</SoftTypography>
                                      </SoftBox>
                                  )}
                              </SoftBox></>
          )}



          {resetPasswordNow && (
            <><form onSubmit={handleResetPassword}>
                              <Card>
                                  <SoftBox p={3}>
                                      <SoftTypography variant="h5" fontWeight="bold" mb={1}>
                                          Reset Password
                                      </SoftTypography>
                                      <SoftBox mb={2}>
                                          <SoftInput
                                              type="password"
                                              placeholder="Password"
                                              value={password}
                                              onChange={(e) => setPassword(e.target.value)}
                                              required />
                                          <SoftInput
                                              type="password"
                                              placeholder="Confirm Password"
                                              value={passwordConfirm}
                                              onChange={(e) => setPasswordConfirm(e.target.value)}
                                              required />
                                          <SoftInput
                                              type="password"
                                              placeholder="Code"
                                              value={code}
                                              onChange={(e) => setCode(e.target.value)}
                                              required />
                                      </SoftBox>
                                      <SoftButton variant="gradient" color="info" fullWidth type="submit">
                                          Confirm Changes
                                      </SoftButton>
                                  </SoftBox>

                              </Card>
                          </form>
                          <SoftBox
                              mx="auto"
                              width="fit-content"
                          >
                                  {successMessage && (
                                      <SoftBox
                                          p={3}
                                          mt={3}
                                          bg="deepskyblue"
                                          color="white"
                                          sx={{
                                              fontFamily: 'Calibri',
                                              borderRadius: '5px',
                                              width: '200px',
                                              height: '80px',
                                              display: 'flex',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                              ml: 'auto',
                                              boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.2)'
                                          }}
                                      >
                                          <SoftTypography variant="h6">{successMessage}</SoftTypography>
                                      </SoftBox>
                                  )}

                                  {error && (
                                      <SoftBox
                                          p={3}
                                          mt={3}
                                          bg="red"
                                          color="white"
                                          sx={{
                                              fontFamily: 'Calibri',
                                              borderRadius: '5px',
                                              width: '200px',
                                              height: '80px',
                                              display: 'flex',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                              ml: 'auto',
                                              boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.2)'
                                          }}
                                      >
                                          <SoftTypography variant="h6">{error}</SoftTypography>
                                      </SoftBox>
                                  )}
                              </SoftBox></>
          )}
        </SoftBox>
      </SoftBox>
      </BasicLayout>
    </>
  );
  

}

export default ResetPassword;