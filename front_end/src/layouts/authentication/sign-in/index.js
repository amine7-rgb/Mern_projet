/**
=========================================================
* Soft UI Dashboard React - v4.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/


// react-router-dom components

import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";


// @mui material components
import Switch from "@mui/material/Switch";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import Socials from "layouts/authentication/components/Socials";
import Separator from "layouts/authentication/components/Separator";
// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";
import curved6 from "assets/images/curved-images/giphyyy.gif";
// Images
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../../slices/auth";
import React, { useState, useEffect ,useRef } from "react";
import { clearMessage } from "../../../slices/message";

function SignIn() {

  /////////////////////////////FACEID/////////////////////////////
  const [previewSource, setPreviewSource] = useState("");
  const [matchedUser, setMatchedUser] = useState(null);
  const videoRef = useRef(null);

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch((err) => console.error(err));
  };

  const stopCamera = () => {
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    const dataURL = canvas.toDataURL();
    setPreviewSource(dataURL);
    stopCamera();
  };

const [dataLoginFace,setdataLoginFace] = useState({ username: '', password: '' });
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!previewSource) return;
  
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
  
      const formData = new FormData();
      formData.append("faceData", dataURLtoFile(previewSource));
  
      const res = await axios.post("http://localhost:8000/compareFaces", formData, config);
  
      if (res.data) {

        setMatchedUser(res.data)
        setTimeout(()=>{
          dataLoginFace.username=res.data.username
          dataLoginFace.password=res.data.password
          // setdataLoginFace(matchedUser.username,matchedUser.pass)
          console.log("aaa",dataLoginFace)
          dispatch(login(dataLoginFace))
          .unwrap()
          .then(() => {
            navigate("/dashboard");
            window.location.reload();
           } )
          .catch(() => {
            // setLoading(false);
          });
       
        },5000)
      
        
      } else {
        setMatchedUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  
  
  

  const dataURLtoFile = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], "image.png", { type: mime });
  };
//////////////////////////////////////////////////////////////////
const [dataLogin,setdataLogin] = useState({ username: '', password: '' });
const [error, setError] = useState('');
const [rememberMe, setRememberMe] = useState(true);
const handleSetAgremment = () => setAgremment(!agreement);
const [passwordShown, setPasswordShown] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
const navigate = useNavigate();
const { message } = useSelector((state) => state.message);

const dispatch = useDispatch();


const handleChange = ({ currentTarget: input }) => {
    setdataLogin({ ...dataLogin, [input.name]: input.value });
  };

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);


const handleSubmitSignup = async (event) => {
    event.preventDefault();
    setSuccess(true);
  
  
  };
const handleLogin = (e) => {
    // const { username, password } = formValue;
    e.preventDefault();
    // setLoading(true);

    dispatch(login(dataLogin))
      .unwrap()
      .then(() => {
        navigate("/dashboard");
        window.location.reload();
      })
      .catch(() => {
        // setLoading(false);
      });
  };
  

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const url = 'http://localhost:8000/api/auth/signin';
    const { data: res } = await axios.post(url, dataLogin);
    localStorage.setItem('token', res.data);
    console.log('data', dataLogin)
    window.location = '/test';
  } catch (error) {
    if (error.response && error.response.status >= 400 && error.response.status <= 500) {
      setError(error.response.data.message);
      console.log('erreur');
    }
  }
};




  return (
    <CoverLayout
      title="Welcome back!"
      description="Enter your username and password to sign in"
      image={curved6}
    >

        <form onSubmit={handleLogin}>
        <SoftBox mb={2}>
          
        <SoftBox mb={1} ml={0.5}>
            <SoftBox >
            <SoftTypography component="label" variant="caption" fontWeight="bold">
              Username
            </SoftTypography>
            </SoftBox>
                <SoftInput
                  type="text"
                  placeholder="Name"
                  name="username"
                  value={dataLogin.username}
                  onChange={handleChange}
                  required
                />
              </SoftBox>
              <SoftBox mb={1} ml={0.5}>
            <SoftTypography component="label" variant="caption" fontWeight="bold">
              Password
            </SoftTypography>
          </SoftBox>
              <SoftBox mb={2}>
                <SoftInput
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={dataLogin.password}
                  onChange={handleChange}
                  required
                />
              </SoftBox>
               
              
              <SoftBox display="flex" alignItems="center">
          
          <SoftTypography
            variant="button"
            fontWeight="regular"
            onSubmit={handleSubmit}
            
            sx={{ cursor: "pointer", userSelect: "none" }}
          > &nbsp;&nbsp;
          </SoftTypography>

            </SoftBox>

        <SoftBox mt={4} mb={1}>
          <SoftButton  variant="gradient" color="info" fullWidth type="submit" style={{ backgroundColor: '#228b22' }} >
            sign in
          </SoftButton>
        </SoftBox>




        <SoftBox mt={3} textAlign="center">
          <SoftTypography variant="button" color="text" fontWeight="regular">
            Don&apos;t have an account?{" "}
            <SoftTypography
              component={Link}
              to="/authentication/sign-up"
              variant="button"
              color="info"
              fontWeight="medium"
              textGradient
              
            >
              Sign up
            </SoftTypography>
          </SoftTypography>
        </SoftBox>
        <SoftBox mt={3} textAlign="center">
          <SoftTypography variant="button" color="text" fontWeight="regular">
            &apos; Forget Password ?{" "}
            <SoftTypography
              component={Link}
              to="/authentication/reset"
              variant="button"
              color="info"
              fontWeight="medium"
              textGradient
              >
              Reset Password
            </SoftTypography>
          </SoftTypography>
        </SoftBox>   
        </SoftBox>
        </form>
        <SoftBox
                              mx="auto"
                              width="fit-content"
                          >
                                  {message && (
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
                                          <SoftTypography variant="h6">{message}</SoftTypography>
                                      </SoftBox>
                                  )}

                                
        </SoftBox>
        <SoftBox my={4} display="flex" flexDirection="column" alignItems="center">
  {!previewSource && (
    <>
      <SoftButton variant="outlined" color="primary" onClick={startCamera}>
        Open Camera
      </SoftButton>
      <SoftBox my={2}>
        <video ref={videoRef} />
      </SoftBox>
      <SoftButton variant="contained" color="primary" onClick={capturePhoto}>
        Take Photo
      </SoftButton>
    </>
  )}

  {previewSource && (
    <SoftBox my={2}>
<img 
  src={previewSource} 
  alt="Preview" 
  style={{ 
    width: '300px', 
    height: '300px', 
    borderRadius: '50%', 
    boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.2)',
    border: '2px solid #228b22',
    margin: '10px'
  }} 
/>    </SoftBox>
  )}

  <form onSubmit={handleFormSubmit}>
    <SoftButton type="submit" disabled={!previewSource} variant="gradient" color="info" fullWidth>
     Sign In with Face ID
    </SoftButton>
  </form>

  {matchedUser && (
    <SoftBox my={2}>
      <SoftTypography variant="h6">Welcome: {matchedUser.username}</SoftTypography>
    </SoftBox>
  )}
</SoftBox>

        {/* <div>
      {!previewSource && (
        <>
          <button onClick={startCamera}>Open Camera</button>
          <video ref={videoRef} />
          <button onClick={capturePhoto}>Take Photo</button>
        </>
      )}

      {previewSource && (
        <img src={previewSource} alt="Preview" width="300" height="300" />
      )}

      <form onSubmit={handleFormSubmit}>
        <button type="submit" disabled={!previewSource}>
          Compare Faces
        </button>
      </form>

      {matchedUser && <p>Matched user: {matchedUser.username}</p>}
    </div> */}
    </CoverLayout>
  );
}




export default SignIn;