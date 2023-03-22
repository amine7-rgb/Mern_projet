/**
 * =========================================================
 * Soft UI Dashboard React - v4.0.0
 * =========================================================
 *
 * Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
 * Copyright 2022 Creative Tim (https://www.creative-tim.com)
 *
 * Coded by www.creative-tim.com
 *
 * =========================================================
 *
 * The above copyright notice and this permission notice shall
 * be included in all copies or substantial portions of the Software.
 */

import axios from "axios";
import React, { useEffect, useState } from "react";
import { MDBBadge, MDBBtn, MDBTable, MDBTableBody, MDBTableHead } from 'mdb-react-ui-kit';

// @mui material components
import Card from "@mui/material/Card";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import UserService from "../../services/user.service";

import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { Photo } from "@mui/icons-material";

function Tables() {

  const [data, setData] = useState({
    photo:"" ,
    username: '',
    email: '',
    isVerified:false,
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ViewEdit, SetEditShow] = useState(false)
  const [editMode, setEditMode] = useState(false); 
  const [id,setid]=useState('');
  const handleEditShow = () => { SetEditShow(true) }
  const handleFileSelect = (e) => {
    ///   setSelectedFile(selectedFile)
  
    // setSelectedFile(e.target.files)
    setSelectedFile(e.target.files);
  
    console.log('e.target.files ', e.target.files);
  };
  const fetchData = async () => {
    try {
      const { data: response } = await axios.get('http://localhost:8000/api/auth/users');
      setData(response);
      console.log("egrsqgrqgrq", response)
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    UserService.getAdminBoard().then(
      (response) => {
        fetchData();
      },
      (error) => {
        const _content =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      }
    );
  }, []);

  const banUser = async (id) => {
    try {
      const { data: response } = await axios.get(`http://localhost:8000/api/auth/bannedUser/${id}`);
      window.location.reload(); 
      console.log(response);
    } catch (error) {
      console.error(error.message);
    }
  };
  const unbanUser = async (id) => {
    try {
      const { data: response } = await axios.get(`http://localhost:8000/api/auth/unbannedUser/${id}`);
      window.location.reload(); 
      console.log(response);
    } catch (error) {
      console.error(error.message);
    }
  };
  const handleEdit = () =>{
    const url = `http://localhost:8000/api/auth/update/${id}`
    const credentials = new FormData();
    
    // set the values in the FormData object
    //credentials.append('photo', selectedFile[0]);
    credentials.append('username', username);
    credentials.append('email', email);
    credentials.append('password', password);
   console.log("cccc",credentials)
  
    axios.put(url, credentials)
      .then(response => {
        const result = response.data;
        const { status, message } = result;
  
        console.log("edittttttt", credentials);
        console.log("idddddddddd", id);
  
        if (status !== 'SUCCESS') {
         // alert("la modification est  traité", status)
          window.location = '/tables';
        } else {
          alert(message);
          // window.location.reload()
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  const SetRowData = (item) => {
    setUsername(item.username);
    setEmail(item.email);
    setPassword(item.password);
  }

  

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Card>
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <SoftTypography variant="h6">Authors table</SoftTypography>
            </SoftBox>
            <SoftBox
              sx={{
                "& .MuiTableRow-root:not(:last-child)": {
                  "& td": {
                    borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                      `${borderWidth[1]} solid ${borderColor}`,
                  },
                },
              }}
            >
              <MDBTable align='middle'>
                <MDBTableHead>
                  <tr>
                    <th scope='col'>User</th>
                    <th scope='col'>Email</th>
                    <th scope='col'>Status</th>
                    <th scope='col'>Actions</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody id="myTable">
                  {data.user?.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className='d-flex align-items-center'>
                          <img
                            src={`http://localhost:8000/${item.photo}`}
                            alt=''
                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                            className='rounded-circle'
                          />
                          <div className='ms-3'>
                            <p className='fw-bold mb-1'>{item.username}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className='text-muted mb-0'>{item.email}</p>
                      </td>
                      <td>
                      <MDBBadge color={item.isVerified ? 'success' : 'danger'} pill>
  {item.isVerified.toString()}
</MDBBadge>
                      </td>
                      <td>
                      {item.isVerified ? null :
  <MDBBtn color='link' rounded size='sm' onClick={() => { unbanUser(item._id); }}>
    UNBlock 
  </MDBBtn>
}
{item.isVerified ? (
  <MDBBtn color='link' rounded size='sm' onClick={() => { banUser(item._id); }}>
    Block 
  </MDBBtn>
) : null}
                        
                        
                        <button className="btn btn-sm btn-primary ms-2" size='sm' variant='warning' onClick={() => { handleEditShow(SetRowData(item), setid(item._id)); } }>Edit</button>
                      </td>
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>
            </SoftBox>
            {ViewEdit && (
              <SoftBox p={3}>
                <div className="d-flex flex-column">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input type="text" className="form-control" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  <label htmlFor="email" className="form-label mt-3">Email</label>
                  <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <label htmlFor="password" className="form-label mt-3">Password</label>
                  <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
  
                  <button className="btn btn-primary mt-3" onClick={handleEdit}>Save Changes</button>
                </div>
              </SoftBox>
            )}
          </Card>
        </SoftBox>
      </SoftBox>
    </DashboardLayout>
  );
  
}

export default Tables;
