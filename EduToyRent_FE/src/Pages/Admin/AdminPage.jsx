import React, { useState, useEffect } from "react";
import HeaderForStaff from "../../Component/HeaderForStaff/HeaderForStaff";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import Cookies from "js-cookie"; // Import thư viện Cookies
import apiToys from "../../service/ApiToys";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import apiUser from "../../service/ApiUser";
import apiMedia from "../../service/ApiMedia";
import apiCategory from "../../service/ApiCategory";
import apiOrderDetail from "../../service/ApiOrderDetail";
import apiOrder from "../../service/ApiOrder";
import apiWallets from "../../service/ApiWallets";
import CardDataStats from "../../Component/DashBoard/CardDataStats";
import apiWalletTransaction from "../../service/ApiWalletTransaction";
import ChartOne from "../../Component/DashBoard/ChartOne";
import ChartTwo from "../../Component/DashBoard/ChartTwo";

import apiLogin from "../../service/ApiLogin";
import apiCart from "../../service/ApiCart";
import { jwtDecode } from "jwt-decode";

import { useNavigate } from "react-router-dom";


const AdminPage = () => {
  const [userData, setUserData] = useState("");
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 5; // Số mục trên mỗi trang

  const [orders, setOrders] = useState([]); // State để lưu trữ danh sách đơn hàng

  const [editedData, setEditedData] = useState({});
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userUpData, setUserUpData] = useState([]);
  const [selectedUserUp, setSelectedUserUp] = useState(null);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isEmployeeCardVisible, setIsEmployeeCardVisible] = useState(false);
  const [selectedToy, setSelectedToy] = useState(null);

  const [userUpBanData, setUserUpBanData] = useState([]);
  const [selectedUserUpBan, setSelectedUserUpBan] = useState(null);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    status: "",
    createDate: "",
    phone: "",
    dob: "",
    address: "",
    avatarUrl: "",
    description: "",
    walletId: "",
  });
  const [isUserCardVisible, setIsUserCardVisible] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    const userDataCookie = Cookies.get("userData");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);

      console.log(parsedUserData.roleId);
      if (parsedUserData.roleId == 4) {
        navigate("/staff");
      } else if (parsedUserData.roleId == 3) {
        navigate("/");
      } else if (parsedUserData.roleId == 2) {
        navigate("/toySupplier");
      } else if (parsedUserData == "") {
        navigate("/login");
      }

      setUserData(parsedUserData);
      const email = parsedUserData.email;

      const fetchUserData = async () => {
        try {
          const token = Cookies.get("userToken");

          if (!token) {
            console.error("Token không hợp lệ hoặc hết hạn.");
            return;
          }

          //  Lấy thông tin người dùng dựa trên email
          const userResponse = await apiUser.get(
            `/ByEmail?email=${encodeURIComponent(
              email
            )}&pageIndex=1&pageSize=5`,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );

          console.log("Dữ liệu người dùng:", userResponse.data);

          if (userResponse.data && userResponse.data.length > 0) {
            const user = userResponse.data[0]; // Lấy đối tượng người dùng đầu tiên trong mảng
            setUserData(user);
            setUserId(user.id);
            setEditedData(user); // Cập nhật dữ liệu chỉnh sửa với thông tin của người dùng
            setImageUrl(user.avatarUrl); // Đặt URL ảnh nếu có
          } else {
            console.error("Không tìm thấy thông tin người dùng.");
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu:", error);
        }
      };
      loadCategories();
      fetchUserData();
      LoadUser();
      LoadOrder("");
    } else {
      console.error("Không tìm thấy thông tin người dùng trong cookie.");
    }
  }, []);
  useEffect(() => {
    if (selectedToy && selectedToy.media && selectedToy.media.length > 0) {
      setSelectedMedia(selectedToy.media[0].mediaUrl); // Đặt ảnh/video đầu tiên làm mặc định
    }
  }, [selectedToy]);
  const loadCategories = async () => {
    try {
      // Gửi yêu cầu GET để lấy danh sách categories
      const response = await apiCategory.get("?pageIndex=1&pageSize=50", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Danh sách categories:", response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đồ chơi:", error);
    }
  };
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    letter: false,
    number: false,
    specialChar: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Function to check password rules
  const validatePassword = (password) => {
    const lengthValid = password.length >= 8;
    const letterValid = /[a-zA-Z]/.test(password);
    const numberValid = /\d/.test(password);
    const specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordValidations({
      length: lengthValid,
      letter: letterValid,
      number: numberValid,
      specialChar: specialCharValid,
    });
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    setPasswordsMatch(newPassword === confirmPassword);
  };

  // Handle confirm password input change
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordsMatch(password === newConfirmPassword);
  };
  const handleEditClick = () => {
    setEditedData(userData);
    setIsEditing(true);
  };
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile)); // Hiển thị ảnh ngay lập tức

      // Gửi ảnh lên API ngay khi người dùng chọn ảnh
      if (userId) {
        const formData = new FormData();
        formData.append("userImage", selectedFile);

        try {
          const response = await apiUser.put(
            `/update-user-image/${userId}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );

          console.log("Cập nhật ảnh thành công:", response.data);
          setImageUrl(response.data.avatarUrl); // Cập nhật lại URL ảnh mới từ API
          window.location.reload();
        } catch (error) {
          console.error("Lỗi khi cập nhật ảnh:", error);
        }
      } else {
        console.error("Không có userId.");
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(userData); // Đặt lại dữ liệu về ban đầu
  };
  const handleUpdate = async () => {
    // Kiểm tra các điều kiện
    const emailRegex = /^[\w-\.]+@gmail\.com$/;
    const phoneRegex = /^\d{10}$/;

    if (!emailRegex.test(editedData.email || "")) {
      console.error("Email không hợp lệ: Phải có đuôi @gmail.com");
      alert("Email không hợp lệ: Phải có đuôi @gmail.com");
      return;
    }

    if (!phoneRegex.test(editedData.phone || "")) {
      console.error("Số điện thoại không hợp lệ: Phải có đúng 10 chữ số");
      alert("Số điện thoại không hợp lệ: Phải có đúng 10 chữ số");
      return;
    }

    // Tiếp tục xử lý nếu các điều kiện hợp lệ
    if (userId) {
      try {
        const formData = new FormData();

        // Thêm các trường dữ liệu vào formData
        formData.append("fullName", editedData.fullName || "Default Name");
        formData.append("email", editedData.email || "default@example.com");
        formData.append("password", editedData.password || "defaultPassword");
        formData.append(
          "createDate",
          editedData.createDate || new Date().toISOString()
        );
        formData.append("phone", editedData.phone || "0000000000");
        formData.append("dob", editedData.dob || new Date().toISOString());
        formData.append("address", editedData.address || "Default Address");
        formData.append("status", editedData.status || "Active");
        formData.append("roleId", editedData.role.id || "");
        formData.append("avatarUrl", editedData.avatarUrl || "");

        const response = await apiUser.put(`/${userId}`, formData, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Cập nhật thành công:", response.data);
        setUserData(response.data);
        setIsEditing(false);
        window.location.reload();
      } catch (error) {
        console.error("Lỗi khi cập nhật thông tin người dùng:", error);
        console.log("Chi tiết lỗi:", error.response?.data);
      }
    } else {
      console.error("Không tìm thấy ID người dùng.");
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };
  const handleNext = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const LoadOrder = async (statusFilter) => {
    const userToken = Cookies.get("userToken");
    if (!userToken) {
      alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    // Nếu không có statusFilter thì mặc định là "Delivering"
    statusFilter = statusFilter || "Delivering";

    try {
      // Lấy danh sách đơn hàng với trạng thái lọc
      const OrderResponse = await apiOrderDetail.get(
        `/?pageIndex=1&pageSize=20000&status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      console.log("Danh sách đơn hàng 1:", OrderResponse.data);
      // Lọc lại đơn hàng theo trạng thái
      const filteredOrders = OrderResponse.data.filter(
        (order) => order.status == "Delivering" || order.status == "Checking"
      );
      console.log("Danh sách đơn hàng sau khi lọc:", filteredOrders);

      // Cập nhật state orders
      setOrders(filteredOrders);
      console.log("Danh sách đơn hàng:", filteredOrders);
    } catch (error) {
      console.error(
        "Lỗi khi tải danh sách đơn hàng hoặc chi tiết đơn hàng:",
        error
      );
    }
  };

  const handleChecking = (order) => {
    var tmp = order;
    tmp.status = "Checking";

    apiOrderDetail
      .put("/" + order.id, tmp, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        LoadOrder();
      });
  };

  const handleCheckingBroke = (order) => {
    var tmp = order;
    tmp.status = "DeliveringToUser";

    apiOrderDetail
      .put("/" + order.id, tmp, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        LoadOrder();
      });
  };

  const handleCheckingGood = (order) => {
    var tmp = order;
    tmp.status = "DeliveringToShop";

    apiOrderDetail
      .put("/" + order.id, tmp, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      })
      .then((response) => {
        LoadOrder();
      });
  };
  const LoadUser = async () => {
    try {
      const UserResponse = await apiUser.get(`?pageIndex=1&pageSize=2000`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Danh sách user mới log:", UserResponse.data);
      // Lọc đồ chơi có trạng thái "Inactive"
      // Lọc người dùng có role ID là 2 hoặc 3
      const UserData = UserResponse.data.filter(
        (user) =>
          (user.role?.id === 2 || user.role?.id === 3 || user.role?.id === 4) &&
          user.status === "Active"
      );

      console.log(`Danh sách người dùng load:`, UserData);

      // Cập nhật dữ liệu đồ chơi
      setUserUpData(UserData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng", error);
    }
  };
  const handleUserBan = async (userId) => {
    // Hiển thị hộp thoại xác nhận
    const isConfirmed = window.confirm("Bạn có chắc muốn cấm người dùng này?");

    // Nếu người dùng không xác nhận, dừng lại
    if (!isConfirmed) {
      return;
    }

    try {
      // Gửi giá trị chuỗi trực tiếp thay vì đối tượng
      const requestBody = "Banned"; // Thay đổi thành chuỗi trực tiếp

      // Log request body trước khi gửi đi
      console.log("Request body:", requestBody);
      console.log("d:", selectedUserUp);
      const formData = new FormData();

      //Thêm các trường dữ liệu vào formData
      formData.append("fullName", selectedUserUp.fullName || "Default Name");
      formData.append("email", selectedUserUp.email || "default@example.com");
      formData.append("password", selectedUserUp.password || "defaultPassword");
      formData.append(
        "createDate",
        selectedUserUp.createDate || new Date().toISOString()
      );
      formData.append("phone", selectedUserUp.phone || "0000000000");
      formData.append("dob", selectedUserUp.dob || new Date().toISOString());
      formData.append("address", selectedUserUp.address || "Default Address");
      formData.append("status", requestBody || "Banned");
      formData.append("roleId", selectedUserUp.role.id || "");
      formData.append("avatarUrl", selectedUserUp.avatarUrl || "");
      // formData.append("description", selectedUserUp.description || "");
      console.log("dữ liệu sẽ gửi", formData.data);

      const response = await apiUser.put(`/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Log dữ liệu nhận được từ API khi thành công
      console.log("Response on success:", response.data);

      if (response.status === 204) {
        setSelectedUserUp(null);
        LoadUser(userUpData);
        LoadUserBan(userUpBanData);
      } else {
        throw new Error(`Failed to update status for user with ID ${userId}`);
      }
    } catch (error) {
      // Log lỗi chi tiết nhận được từ API khi có lỗi
      if (error.response) {
        console.error("Error response:", error.response);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };
  const LoadUserBan = async () => {
    try {
      const UserResponse = await apiUser.get(`?pageIndex=1&pageSize=2000`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Danh sách user mới log:", UserResponse.data);
      // Lọc đồ chơi có trạng thái "Inactive"
      // Lọc người dùng có role ID là 2 hoặc 3
      const UserData = UserResponse.data.filter(
        (user) =>
          (user.role?.id === 2 || user.role?.id === 3 || user.role?.id === 4) &&
          user.status === "Banned"
      );

      console.log(`Danh sách người dùng ban load:`, UserData);

      // Cập nhật dữ liệu đồ chơi
      setUserUpBanData(UserData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng", error);
    }
  };

  const statusMapping = {
    Delivering: "Đang giao",
    Checking: "Đợi đánh giá đồ chơi",
  };
  const handleCreateUser = async () => {
    const createDate = new Date().toISOString();
    const dob = new Date().toISOString();
    const { fullName, email, phone, withdrawalMethod, withdrawInfo } = newUser;

    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log("Password:", newUser.password); // Access password from state

    // Kiểm tra các trường nhập vào
    if (!fullName || !email || !phone) {
      alert("Vui lòng nhập đầy đủ tất cả các trường!");
      return;
    }

    // Kiểm tra email phải có đuôi @gmail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      alert("Email phải có đuôi @gmail.com");
      return;
    }

    // Gửi yêu cầu kiểm tra email đã tồn tại
    const checkUserResponse = await apiUser.get(
      `/ByEmail?email=${encodeURIComponent(email)}&pageIndex=1&pageSize=5000`
    );
    console.log("dữ liệu email check", checkUserResponse.data);

    // Nếu email đã tồn tại, hiển thị thông báo và dừng
    if (checkUserResponse.data && checkUserResponse.data.length > 0) {
      alert("Email đã tồn tại, vui lòng chọn email khác!");
      return;
    }

    // Kiểm tra số điện thoại phải là 10 số và bắt đầu bằng số 0
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại phải là 10 số và bắt đầu bằng số 0");
      return;
    }

    // Tiếp tục xử lý sau khi kiểm tra thành công
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", newUser.password); // Access password from state
    formData.append("phone", phone);
    formData.append("dob", dob);
    formData.append("address", "string");
    formData.append("avatarUrl", null);
    formData.append("status", "Active");
    formData.append("walletId", "");
    formData.append("roleId", 2);
    formData.append("createDate", createDate);

    console.log("Form Data trước khi gửi:", Object.fromEntries(formData));

    // Kiểm tra dữ liệu đã chuẩn bị
    const formDataObj = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    console.log("Form Data trước khi gửi:", formDataObj);

    try {
      // Gửi yêu cầu đăng ký
      const response = await apiUser.post("", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      const dataOld = response.data;
      console.log("Wallet Id old:", dataOld);
      // Kiểm tra trạng thái thành công
      if (response.status === 201) {
        alert("Đăng ký thành công!");

        // Đăng nhập và lấy token
        const loginResponse = await apiLogin.post("", {
          email: email,
          password: newUser.password, // Use password from state
        });

        // Kiểm tra nếu login thành công và nhận token
        if (loginResponse.data && loginResponse.data.token) {
          const token = loginResponse.data.token;
          Cookies.set("userToken", token, { expires: 7, path: "/" });
          console.log("Token đã lưu:", Cookies.get("userToken"));

          // Tạo ví người dùng
          const tokenFromCookie = Cookies.get("userToken");
          if (tokenFromCookie) {
            const decodedToken = jwtDecode(tokenFromCookie);
            console.log("Decoded Token:", decodedToken);
            const userId =
              decodedToken[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ];
            console.log("UserId:", userId); // Kết quả: "32"
            const walletData = {
              balance: 0,
              withdrawMethod: "string",
              withdrawInfo: "string",
              status: "Active",
              userId: userId, // Gắn userId vào đây
            };

            console.log("Wallet Data:", walletData);

            try {
              // Tạo ví cho người dùng
              const walletResponse = await apiWallets.post("", walletData, {
                headers: {
                  Authorization: `Bearer ${tokenFromCookie}`,
                },
              });

              if (walletResponse.status === 201) {
                console.log("Tạo ví thành công:", walletResponse.data);
                const walletId = walletResponse.data.id; // Giả sử id là walletId
                console.log("Wallet Id:", walletId);
                console.log("Wallet Id old2:", dataOld);
                // Cập nhật walletId vào người dùng
                const dateSend = {
                  fullName: dataOld.fullName,
                  email: dataOld.email,
                  password: dataOld.password,
                  createDate: dataOld.createDate,
                  phone: dataOld.phone,
                  dob: dataOld.dob,
                  address: dataOld.address,
                  roleId: 2,
                  status: dataOld.status,
                  walletId: walletId, // Thêm walletId vào request
                };
                console.log("Data send:", dateSend);
                const formData = new FormData();
                Object.entries(dateSend).forEach(([key, value]) => {
                  formData.append(key, value);
                });
                const updateUserResponse = await apiUser.put(
                  `/${userId}`,
                  formData,
                  {
                    headers: {
                      Authorization: `Bearer ${tokenFromCookie}`,
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );

                if (updateUserResponse.status === 204) {
                  console.log(
                    "Cập nhật người dùng thành công:",
                    updateUserResponse.data
                  );
                  Cookies.remove("userToken");
                  const dataCart = {
                    userId: userId,
                    status: "Active",
                    totalPrice: 0,
                  };
                  console.log("Data Cart trước khi gửi:", dataCart);

                  const createCartResponse = await apiCart.post("", dataCart, {
                    Authorization: `Bearer ${tokenFromCookie}`,
                    "Content-Type": "application/json",
                  });

                  if (createCartResponse.status === 201) {
                    console.log("Cart Response đã tạo :", createCartResponse);
                    // Sau khi thành công, xóa token và chuyển hướng
                  } else {
                    console.error(
                      "Lỗi khi tạo giỏ hàng:",
                      createCartResponse.data
                    );
                  }
                } else {
                  console.error(
                    "Lỗi khi cập nhật người dùng:",
                    updateUserResponse.data
                  );
                }
              } else {
                console.error("Lỗi khi tạo ví:", walletResponse.data);
              }
            } catch (walletError) {
              console.error("Lỗi khi gọi API tạo ví:", walletError);
            }
          }
          Cookies.set("userToken", token, { expires: 7, path: "/" });
          console.log("Token đã lưu:", Cookies.get("userToken"));
          setIsCardVisible(false); // Đóng card sau khi tạo
          LoadUser(userUpData);
        } else {
          console.error("Lỗi: Không nhận được token từ API login");
          alert(
            "Đăng ký thành công nhưng không thể đăng nhập. Vui lòng thử lại."
          );
        }
      } else {
        console.error("Lỗi khi đăng ký:", response.data);
        alert(`Đăng ký thất bại: ${response.data.message || "Có lỗi xảy ra"}`);
      }
    } catch (error) {
      console.error("Lỗi hệ thống:", error);
      alert("Không thể kết nối đến server. Vui lòng thử lại sau!");
    }
  };
  const handleCreateUsers = async () => {
    const createDate = new Date().toISOString();
    const dob = new Date().toISOString();
    const { fullName, email, phone, withdrawalMethod, withdrawInfo } = newUser;

    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log("Password:", newUser.password); // Access password from state

    // Kiểm tra các trường nhập vào
    if (!fullName || !email || !phone) {
      alert("Vui lòng nhập đầy đủ tất cả các trường!");
      return;
    }

    // Kiểm tra email phải có đuôi @gmail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      alert("Email phải có đuôi @gmail.com");
      return;
    }

    // Gửi yêu cầu kiểm tra email đã tồn tại
    const checkUserResponse = await apiUser.get(
      `/ByEmail?email=${encodeURIComponent(email)}&pageIndex=1&pageSize=5000`
    );
    console.log("dữ liệu email check", checkUserResponse.data);

    // Nếu email đã tồn tại, hiển thị thông báo và dừng
    if (checkUserResponse.data && checkUserResponse.data.length > 0) {
      alert("Email đã tồn tại, vui lòng chọn email khác!");
      return;
    }

    // Kiểm tra số điện thoại phải là 10 số và bắt đầu bằng số 0
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại phải là 10 số và bắt đầu bằng số 0");
      return;
    }

    // Tiếp tục xử lý sau khi kiểm tra thành công
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", newUser.password); // Access password from state
    formData.append("phone", phone);
    formData.append("dob", dob);
    formData.append("address", "string");
    formData.append("avatarUrl", null);
    formData.append("status", "Active");
    formData.append("walletId", "");
    formData.append("roleId", 3);
    formData.append("createDate", createDate);

    console.log("Form Data trước khi gửi:", Object.fromEntries(formData));

    // Kiểm tra dữ liệu đã chuẩn bị
    const formDataObj = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    console.log("Form Data trước khi gửi:", formDataObj);

    try {
      // Gửi yêu cầu đăng ký
      const response = await apiUser.post("", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      const dataOld = response.data;
      console.log("Wallet Id old:", dataOld);
      // Kiểm tra trạng thái thành công
      if (response.status === 201) {
        alert("Đăng ký thành công!");

        // Đăng nhập và lấy token
        const loginResponse = await apiLogin.post("", {
          email: email,
          password: newUser.password, // Use password from state
        });

        // Kiểm tra nếu login thành công và nhận token
        if (loginResponse.data && loginResponse.data.token) {
          const token = loginResponse.data.token;
          Cookies.set("userToken", token, { expires: 7, path: "/" });
          console.log("Token đã lưu:", Cookies.get("userToken"));

          // Tạo ví người dùng
          const tokenFromCookie = Cookies.get("userToken");
          if (tokenFromCookie) {
            const decodedToken = jwtDecode(tokenFromCookie);
            console.log("Decoded Token:", decodedToken);
            const userId =
              decodedToken[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ];
            console.log("UserId:", userId); // Kết quả: "32"
            const walletData = {
              balance: 0,
              withdrawMethod: "string",
              withdrawInfo: "string",
              status: "Active",
              userId: userId, // Gắn userId vào đây
            };

            console.log("Wallet Data:", walletData);

            try {
              // Tạo ví cho người dùng
              const walletResponse = await apiWallets.post("", walletData, {
                headers: {
                  Authorization: `Bearer ${tokenFromCookie}`,
                },
              });

              if (walletResponse.status === 201) {
                console.log("Tạo ví thành công:", walletResponse.data);
                const walletId = walletResponse.data.id; // Giả sử id là walletId
                console.log("Wallet Id:", walletId);
                console.log("Wallet Id old2:", dataOld);
                // Cập nhật walletId vào người dùng
                const dateSend = {
                  fullName: dataOld.fullName,
                  email: dataOld.email,
                  password: dataOld.password,
                  createDate: dataOld.createDate,
                  phone: dataOld.phone,
                  dob: dataOld.dob,
                  address: dataOld.address,
                  roleId: 2,
                  status: dataOld.status,
                  walletId: walletId, // Thêm walletId vào request
                };
                console.log("Data send:", dateSend);
                const formData = new FormData();
                Object.entries(dateSend).forEach(([key, value]) => {
                  formData.append(key, value);
                });
                const updateUserResponse = await apiUser.put(
                  `/${userId}`,
                  formData,
                  {
                    headers: {
                      Authorization: `Bearer ${tokenFromCookie}`,
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );

                if (updateUserResponse.status === 204) {
                  console.log(
                    "Cập nhật người dùng thành công:",
                    updateUserResponse.data
                  );
                  Cookies.remove("userToken");
                  const dataCart = {
                    userId: userId,
                    status: "Active",
                    totalPrice: 0,
                  };
                  console.log("Data Cart trước khi gửi:", dataCart);

                  const createCartResponse = await apiCart.post("", dataCart, {
                    Authorization: `Bearer ${tokenFromCookie}`,
                    "Content-Type": "application/json",
                  });

                  if (createCartResponse.status === 201) {
                    console.log("Cart Response đã tạo :", createCartResponse);
                    // Sau khi thành công, xóa token và chuyển hướng
                  } else {
                    console.error(
                      "Lỗi khi tạo giỏ hàng:",
                      createCartResponse.data
                    );
                  }
                } else {
                  console.error(
                    "Lỗi khi cập nhật người dùng:",
                    updateUserResponse.data
                  );
                }
              } else {
                console.error("Lỗi khi tạo ví:", walletResponse.data);
              }
            } catch (walletError) {
              console.error("Lỗi khi gọi API tạo ví:", walletError);
            }
          }
          Cookies.set("userToken", token, { expires: 7, path: "/" });
          console.log("Token đã lưu:", Cookies.get("userToken"));
          setIsUserCardVisible(false);
          LoadUser(userUpData);
        } else {
          console.error("Lỗi: Không nhận được token từ API login");
          alert(
            "Đăng ký thành công nhưng không thể đăng nhập. Vui lòng thử lại."
          );
        }
      } else {
        console.error("Lỗi khi đăng ký:", response.data);
        alert(`Đăng ký thất bại: ${response.data.message || "Có lỗi xảy ra"}`);
      }
    } catch (error) {
      console.error("Lỗi hệ thống:", error);
      alert("Không thể kết nối đến server. Vui lòng thử lại sau!");
    }
  };
  const handleCreateStaff = async () => {
    const createDate = new Date().toISOString();
    const dob = new Date().toISOString();
    const { fullName, email, phone, withdrawalMethod, withdrawInfo } = newUser;

    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log("Password:", newUser.password); // Access password from state

    // Kiểm tra các trường nhập vào
    if (!fullName || !email || !phone) {
      alert("Vui lòng nhập đầy đủ tất cả các trường!");
      return;
    }

    // Kiểm tra email phải có đuôi @gmail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      alert("Email phải có đuôi @gmail.com");
      return;
    }

    // Gửi yêu cầu kiểm tra email đã tồn tại
    const checkUserResponse = await apiUser.get(
      `/ByEmail?email=${encodeURIComponent(email)}&pageIndex=1&pageSize=5000`
    );
    console.log("dữ liệu email check", checkUserResponse.data);

    // Nếu email đã tồn tại, hiển thị thông báo và dừng
    if (checkUserResponse.data && checkUserResponse.data.length > 0) {
      alert("Email đã tồn tại, vui lòng chọn email khác!");
      return;
    }

    // Kiểm tra số điện thoại phải là 10 số và bắt đầu bằng số 0
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại phải là 10 số và bắt đầu bằng số 0");
      return;
    }

    // Tiếp tục xử lý sau khi kiểm tra thành công
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", newUser.password); // Access password from state
    formData.append("phone", phone);
    formData.append("dob", dob);
    formData.append("address", "string");
    formData.append("avatarUrl", null);
    formData.append("status", "Active");
    formData.append("walletId", "");
    formData.append("roleId", 4);
    formData.append("createDate", createDate);

    console.log("Form Data trước khi gửi:", Object.fromEntries(formData));

    // Kiểm tra dữ liệu đã chuẩn bị
    const formDataObj = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    console.log("Form Data trước khi gửi:", formDataObj);

    try {
      // Gửi yêu cầu đăng ký
      const response = await apiUser.post("", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      const dataOld = response.data;
      if (response.status === 201) {
        alert("Đăng ký thành công!");

        setIsEmployeeCardVisible(false);
        LoadUser(userUpData);
      } else {
        console.error("Lỗi khi đăng ký:", response.data);
        alert(`Đăng ký thất bại: ${response.data.message || "Có lỗi xảy ra"}`);
      }
    } catch (error) {
      console.error("Lỗi hệ thống:", error);
      alert("Không thể kết nối đến server. Vui lòng thử lại sau!");
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };
  const renderContent = () => {
    switch (selectedTab) {
      case "info":
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Hồ Sơ Của Tôi
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý thông tin hồ sơ để bảo mật tài khoản
            </p>

            <div className="flex mt-6">
              <div className="w-2/3 pr-6">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Xin chào {userData.fullName || userData.name}</p>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Email: {userData.email}</p>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Số điện thoại: {userData.phone}</p>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>
                      Ngày sinh:{" "}
                      {userData.dob
                        ? new Date(userData.dob).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "Chưa cập nhật"}
                    </p>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Địa chỉ: {userData.address}</p>
                  </label>
                </div>

                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none"
                >
                  Chỉnh sửa
                </button>
              </div>
              {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">
                      Chỉnh sửa thông tin
                    </h2>

                    {/* Form chỉnh sửa */}
                    <div className="mb-4">
                      <label className="block text-gray-700">Họ và tên</label>
                      <input
                        type="text"
                        value={editedData.fullName || ""}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Email</label>
                      <input
                        type="email"
                        value={editedData.email || ""}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Số điện thoại
                      </label>
                      <input
                        type="number"
                        value={editedData.phone || ""}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700">Ngày sinh</label>
                      <input
                        type="date"
                        value={
                          editedData.dob ? editedData.dob.split("T")[0] : ""
                        } // Đảm bảo sử dụng đúng cú pháp
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            dob: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700">Địa chỉ</label>
                      <input
                        type="text"
                        value={editedData.address || ""}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            address: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>

                    {/* Nút lưu và hủy */}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="w-1/3 flex flex-col items-center mr-52">
                <div className="w-36 h-36 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 text-2xl font-semibold">
                  {/* Hiển thị ảnh nếu có */}
                  {imageUrl ? (
                    <img
                      src={imageUrl} // Hiển thị ảnh từ URL tạm thời
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : file ? (
                    <img
                      src={URL.createObjectURL(file)} // Hiển thị ảnh từ file được chọn tạm thời
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : userData && userData.avatarUrl ? (
                    <img
                      src={userData.avatarUrl} // Hiển thị ảnh từ URL trong userData
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : userData && userData.fullName ? (
                    userData.fullName.charAt(0) // Hiển thị chữ cái đầu tiên từ fullName nếu không có ảnh
                  ) : (
                    ""
                  )}
                </div>

                {/* Input ẩn để chọn ảnh */}
                <input
                  type="file"
                  accept=".jpg, .png"
                  onChange={handleFileChange} // Gọi hàm xử lý khi người dùng chọn file
                  className="hidden"
                  id="fileInput"
                />

                <button
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                  onClick={() => document.getElementById("fileInput").click()} // Mở input file khi click nút này
                >
                  Chọn Ảnh
                </button>

                <p className="text-sm text-gray-500 mt-2 text-center">
                  <br />
                  Định dạng: .JPG, .PNG
                </p>
              </div>
            </div>
          </div>
        );

      case "User":
        return (
          <div>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
              <div className="w-full mb-1">
                <div className="items-center justify-between block sm:flex md:divide-x md:divide-gray-100 dark:divide-gray-700">
                  <div className="flex flex-wrap gap-4 justify-start mt-4">
                    <button
                      type="button"
                      onClick={() => setIsCardVisible(true)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tạo nhà cung cấp đồ chơi
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEmployeeCardVisible(true)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tạo nhân viên
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUserCardVisible(true)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-blue-500"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tạo người dùng
                    </button>
                    {/* Card tạo người dùng */}
                    {isCardVisible && (
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                          <h2 className="text-xl font-bold mb-4 text-center">
                            Tạo nhà cung cấp đồ chơi
                          </h2>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Tên nhà cung cấp
                              </label>
                              <input
                                type="text"
                                name="fullName"
                                value={newUser.fullName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={newUser.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Password
                              </label>
                              <input
                                type="password"
                                name="password"
                                value={newUser.password}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Số điện thoại
                              </label>
                              <input
                                type="text"
                                name="phone"
                                value={newUser.phone}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Trạng thái
                              </label>
                              <select
                                name="status"
                                value={newUser.status}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              >
                                <option value="">Chọn trạng thái</option>
                                <option value="Active">Hoạt động</option>
                                <option value="Inactive">
                                  Không hoạt động
                                </option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end mt-6 space-x-3">
                            <button
                              type="button"
                              onClick={() => setIsCardVisible(false)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleCreateUser}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Tạo mới
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {isEmployeeCardVisible && (
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                          <h2 className="text-xl font-bold mb-4 text-center">
                            Tạo nhân viên mới
                          </h2>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Tên nhân viên
                              </label>
                              <input
                                type="text"
                                name="fullName"
                                value={newUser.fullName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={newUser.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Password
                              </label>
                              <input
                                type="password"
                                name="password"
                                value={newUser.password}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Số điện thoại
                              </label>
                              <input
                                type="text"
                                name="phone"
                                value={newUser.phone}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Trạng thái
                              </label>
                              <select
                                name="status"
                                value={newUser.status}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              >
                                <option value="">Chọn trạng thái</option>
                                <option value="Active">Hoạt động</option>
                                <option value="Inactive">
                                  Không hoạt động
                                </option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end mt-6 space-x-3">
                            <button
                              type="button"
                              onClick={() => setIsEmployeeCardVisible(false)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleCreateStaff}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Tạo mới
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {isUserCardVisible && (
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                          <h2 className="text-xl font-bold mb-4 text-center">
                            Tạo người dùng mới
                          </h2>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Tên người dùng
                              </label>
                              <input
                                type="text"
                                name="fullName"
                                value={newUser.fullName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={newUser.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Password
                              </label>
                              <input
                                type="password"
                                name="password"
                                value={newUser.password}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Số điện thoại
                              </label>
                              <input
                                type="text"
                                name="phone"
                                value={newUser.phone}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Trạng thái
                              </label>
                              <select
                                name="status"
                                value={newUser.status}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              >
                                <option value="">Chọn trạng thái</option>
                                <option value="Active">Hoạt động</option>
                                <option value="Inactive">
                                  Không hoạt động
                                </option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end mt-6 space-x-3">
                            <button
                              type="button"
                              onClick={() => setIsUserCardVisible(false)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleCreateUsers}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Tạo mới
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                      <thead className=" bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          ></th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Tên người dùng
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Email
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Số điện thoại
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Vai trò
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Trạng thái
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {userUpData &&
                        Array.isArray(userUpData) &&
                        userUpData.length > 0 ? (
                          userUpData.map((user) => (
                            <tr
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              key={user.id}
                            >
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                  {user.avatarUrl &&
                                  user.avatarUrl.length > 0 ? (
                                    <img
                                      src={user.avatarUrl}
                                      alt="User-Avatar"
                                      className="w-full max-w-[50px] h-auto object-contain mr-2"
                                    />
                                  ) : (
                                    <span>No media available</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                  {user.fullName}
                                </div>
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {user.email}
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {user.phone}
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {user.role.name}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {statusMapping[user.status] ||
                                  "Trạng thái không xác định"}
                              </td>

                              <td className="p-4 space-x-2 whitespace-nowrap">
                                {/* Nút "Detail" */}
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedUserUp(user); // Lưu thông tin toy vào state
                                  }}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900"
                                >
                                  Thông tin
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="13" className="p-4 text-center"></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center mb-4 sm:mb-0"></div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-red-500 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  <svg
                    className="w-5 h-5 mr-1 -ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Trước
                </button>
                <button
                  onClick={handleNext}
                  className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-red-500 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Sau
                  <svg
                    className="w-5 h-5 ml-1 -mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            {selectedUserUp && !isEditing && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center  z-[1000]">
                <div className="bg-white p-16 rounded-2xl shadow-2xl max-w-7xl w-full h-auto overflow-auto relative z-[1010]">
                  {/* Nút đóng ở góc phải */}
                  <button
                    type="button"
                    onClick={() => setSelectedUserUp(null)} // Đóng chi tiết khi bấm nút
                    className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>

                  <div className="flex flex-wrap lg:flex-nowrap gap-10">
                    {/* Phần hình ảnh */}
                    <div className="flex-1 flex justify-center items-center flex-col max-w-md mx-auto mt-20">
                      {/* Hiển thị ảnh hoặc video */}
                      <div className="w-auto h-auto">
                        {selectedUserUp.avatarUrl &&
                        selectedUserUp.avatarUrl.length > 0 ? (
                          <img
                            src={selectedUserUp.avatarUrl}
                            alt="User-Avatar"
                            className=" w-full max-w-[70%] h-auto object-contain "
                          />
                        ) : (
                          <span>No media available</span>
                        )}
                      </div>
                    </div>

                    {/* Phần thông tin */}
                    <div className="flex-1 text-sm space-y-6">
                      <h2 className="text-4xl font-bold mb-10 text-center">
                        Thông tin người dùng
                      </h2>
                      <p>
                        <strong>Tên người dùng:</strong>{" "}
                        {selectedUserUp.fullName}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedUserUp.email}
                      </p>
                      <p>
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(
                          selectedUserUp.createDate
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Số điện thoại:</strong> {selectedUserUp.phone}
                      </p>

                      <p>
                        <strong>Ngày sinh:</strong>{" "}
                        {new Date(selectedUserUp.dob).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Địa chỉ:</strong>
                        {selectedUserUp.address}
                      </p>
                      <p>
                        <strong>Vai trò:</strong> {selectedUserUp.role.name}
                      </p>

                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        {statusMapping[selectedUserUp.status] ||
                          "Trạng thái không xác định"}
                      </p>
                      <p className=" space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation(); // Ngăn sự kiện lan truyền lên <tr>
                            handleUserBan(selectedUserUp.id); // Gọi hàm handleDelete
                          }}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                        >
                          Cấm
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "dashboard":
        return (
          <div>
            {" "}
            <h3 className="text-lg font-semibold">Bảng thống kê</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
              <CardDataStats
                title="Total views"
                total="$3.456K"
                rate="0.43%"
                levelUp
              >
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="16"
                  viewBox="0 0 22 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z"
                    fill="currentColor"
                  />
                  <path
                    d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z"
                    fill="currentColor"
                  />
                </svg>
              </CardDataStats>
              <CardDataStats
                title="Total Profit"
                total="$45,2K"
                rate="4.35%"
                levelUp
              >
                <svg
                  className="fill-primary dark:fill-white"
                  width="20"
                  height="22"
                  viewBox="0 0 20 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.0937 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.825 19.4562 10.825 18.9406C10.825 18.425 11.2375 18.0125 11.7531 18.0125C12.2687 18.0125 12.6812 18.425 12.6812 18.9406C12.6812 19.4219 12.2343 19.8687 11.7531 19.8687Z"
                    fill="currentColor"
                  />
                  <path
                    d="M5.22183 16.4312C3.84683 16.4312 2.74683 17.5312 2.74683 18.9062C2.74683 20.2812 3.84683 21.3812 5.22183 21.3812C6.59683 21.3812 7.69683 20.2812 7.69683 18.9062C7.69683 17.5656 6.56245 16.4312 5.22183 16.4312ZM5.22183 19.8687C4.7062 19.8687 4.2937 19.4562 4.2937 18.9406C4.2937 18.425 4.7062 18.0125 5.22183 18.0125C5.73745 18.0125 6.14995 18.425 6.14995 18.9406C6.14995 19.4219 5.73745 19.8687 5.22183 19.8687Z"
                    fill="currentColor"
                  />
                  <path
                    d="M19.0062 0.618744H17.15C16.325 0.618744 15.6031 1.23749 15.5 2.06249L14.95 6.01562H1.37185C1.0281 6.01562 0.684353 6.18749 0.443728 6.46249C0.237478 6.73749 0.134353 7.11562 0.237478 7.45937C0.237478 7.49374 0.237478 7.49374 0.237478 7.52812L2.36873 13.9562C2.50623 14.4375 2.9531 14.7812 3.46873 14.7812H12.9562C14.2281 14.7812 15.3281 13.8187 15.5 12.5469L16.9437 2.26874C16.9437 2.19999 17.0125 2.16562 17.0812 2.16562H18.9375C19.35 2.16562 19.7281 1.82187 19.7281 1.37499C19.7281 0.928119 19.4187 0.618744 19.0062 0.618744ZM14.0219 12.3062C13.9531 12.8219 13.5062 13.2 12.9906 13.2H3.7781L1.92185 7.56249H14.7094L14.0219 12.3062Z"
                    fill="currentColor"
                  />
                </svg>
              </CardDataStats>
              <CardDataStats
                title="Total Product"
                total="2.450"
                rate="2.59%"
                levelUp
              >
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6656 19.4907 19.0438 19.2157 19.3531Z"
                    fill="currentColor"
                  />
                  <path
                    d="M14.3345 5.29375C13.922 5.39688 13.647 5.80938 13.7501 6.22188C13.7845 6.42813 13.8189 6.63438 13.8189 6.80625C13.8189 8.35313 12.547 9.625 11.0001 9.625C9.45327 9.625 8.1814 8.35313 8.1814 6.80625C8.1814 6.6 8.21577 6.42813 8.25015 6.22188C8.35327 5.80938 8.07827 5.39688 7.66577 5.29375C7.25327 5.19063 6.84077 5.46563 6.73765 5.87813C6.6689 6.1875 6.63452 6.49688 6.63452 6.80625C6.63452 9.2125 8.5939 11.1719 11.0001 11.1719C13.4064 11.1719 15.3658 9.2125 15.3658 6.80625C15.3658 6.49688 15.3314 6.1875 15.2626 5.87813C15.1595 5.46563 14.747 5.225 14.3345 5.29375Z"
                    fill="currentColor"
                  />
                </svg>
              </CardDataStats>
              <CardDataStats
                title="Total Users"
                total="3.456"
                rate="0.95%"
                levelDown
              >
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="18"
                  viewBox="0 0 22 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z"
                    fill="currentColor"
                  />
                  <path
                    d="M15.8124 9.6875C17.6687 9.6875 19.1468 8.24375 19.1468 6.42188C19.1468 4.6 17.6343 3.15625 15.8124 3.15625C13.9905 3.15625 12.478 4.6 12.478 6.42188C12.478 8.24375 13.9905 9.6875 15.8124 9.6875ZM15.8124 4.7375C16.8093 4.7375 17.5999 5.49375 17.5999 6.45625C17.5999 7.41875 16.8093 8.175 15.8124 8.175C14.8155 8.175 14.0249 7.41875 14.0249 6.45625C14.0249 5.49375 14.8155 4.7375 15.8124 4.7375Z"
                    fill="currentColor"
                  />
                  <path
                    d="M15.9843 10.0313H15.6749C14.6437 10.0313 13.6468 10.3406 12.7874 10.8563C11.8593 9.61876 10.3812 8.79376 8.73115 8.79376H5.67178C2.85303 8.82814 0.618652 11.0625 0.618652 13.8469V16.3219C0.618652 16.975 1.13428 17.4906 1.7874 17.4906H20.2468C20.8999 17.4906 21.4499 16.9406 21.4499 16.2875V15.4625C21.4155 12.4719 18.9749 10.0313 15.9843 10.0313ZM2.16553 15.9438V13.8469C2.16553 11.9219 3.74678 10.3406 5.67178 10.3406H8.73115C10.6562 10.3406 12.2374 11.9219 12.2374 13.8469V15.9438H2.16553V15.9438ZM19.8687 15.9438H13.7499V13.8469C13.7499 13.2969 13.6468 12.7469 13.4749 12.2313C14.0937 11.7844 14.8499 11.5781 15.6405 11.5781H15.9499C18.0812 11.5781 19.8343 13.3313 19.8343 15.4625V15.9438H19.8687Z"
                    fill="currentColor"
                  />
                </svg>
              </CardDataStats>
            </div>
            <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
              <ChartOne />
              <ChartTwo />
            </div>
          </div>
        );

        return (
          <div className="container mx-auto py-4">
            <h2 className="text-2xl font-semibold">Danh sách đơn hàng</h2>
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden mt-4"
              >
                <div className="flex items-center p-4 border-b">
                  <img
                    src={
                      order.toyImgUrls?.length > 0
                        ? order.toyImgUrls[0]
                        : "default_image_url_here"
                    }
                    alt={`Ảnh đồ chơi cho đơn hàng ${order.id}`}
                    style={{ width: "100px", height: "100px", margin: "5px" }}
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold">
                      Đơn hàng mã số: {order.id}
                    </h3>
                    <h3 className="text-lg font-semibold">
                      Tên đồ chơi: {order.toyName}
                    </h3>

                    <p className="text-sm text-gray-600">
                      Tổng giá: {order.unitPrice}₫
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <h1 className="text-lg font-bold text-gray-600">
                      {statusMapping[order.status] ||
                        "Trạng thái không xác định"}
                    </h1>
                  </div>
                </div>
                <div className="flex justify-between p-4">
                  <div className="ml-auto flex gap-4">
                    {order.status == "Delivering" && (
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        onClick={() => handleChecking(order)}
                      >
                        Chờ đánh giá đồ chơi
                      </button>
                    )}
                    {order.status == "Checking" && (
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        onClick={() => handleCheckingBroke(order)}
                      >
                        Đồ chơi bị hỏng
                      </button>
                    )}
                    {order.status == "Checking" && (
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                        onClick={() => handleCheckingGood(order)}
                      >
                        Đồ chơi bình thường
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header
        className="bg-white shadow-md p-4"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "white",
        }}
      >
        <HeaderForStaff />
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-1/5 bg-white p-6 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <button
              onClick={() => setSelectedTab("dashboard")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "dashboard" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🏢</span> Bảng thống kê
            </button>
            <button
              onClick={() => setSelectedTab("info")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "info" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">👤</span> Thông tin cá nhân
            </button>

            <button
              onClick={() => setSelectedTab("User")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "User" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">📦</span> Danh sách người dùng
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow w-4/5 bg-gray-50 p-6">
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <div className=" p-4 border-l">{renderContent()}</div>
          </div>
        </main>
      </div>
      <footer className="bg-white shadow-md p-4">
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default AdminPage;
