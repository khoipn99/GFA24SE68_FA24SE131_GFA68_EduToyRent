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
import apiWalletTransaction from "../../service/ApiWalletTransaction";
import { useNavigate } from "react-router-dom";
import { use } from "react";
import apiOrderCheckImages from "../../service/ApiOrderCheckImages";
import axios from "axios";
import apiNotifications from "../../service/ApiNotifications";
import ChatForm from "../Chat/ChatForm";
const StaffPage = () => {
  const [userData, setUserData] = useState("");
  const [selectedTab, setSelectedTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [currentPageData, setCurrentPageData] = useState(1); // Trang hiện tại cho toysData
  const [currentPageData1, setCurrentPageData1] = useState(1); // Trang hiện tại cho toysData
  const [currentPageData2, setCurrentPageData2] = useState(1); // Trang hiện tại cho toysData
  const [currentPageData3, setCurrentPageData3] = useState(1); // Trang hiện tại cho toysData
  const [currentPageData4, setCurrentPageData4] = useState(1); // Trang hiện tại cho toysData
  const [currentPageData5, setCurrentPageData5] = useState(1); // Trang hiện tại cho toysData
  const itemsPerPage = 5; // Số mục trên mỗi trang

  const [orders, setOrders] = useState([]); // State để lưu trữ danh sách đơn hàng

  const [editedData, setEditedData] = useState({});
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [toysData, setToysData] = useState([]);
  const [toysRentData, setToysRentData] = useState([]);
  const [toysBuyData, setToysBuyData] = useState([]);
  const [toysBanData, setToysBanData] = useState([]);
  const [userUpData, setUserUpData] = useState([]);
  const [userUpBanData, setUserUpBanData] = useState([]);
  const [selectedUserUpBan, setSelectedUserUpBan] = useState(null);
  const [selectedToyRent, setSelectedToyRent] = useState(null);
  const [selectedToyBuy, setSelectedToyBuy] = useState(null);
  const [selectedToyBan, setSelectedToyBan] = useState(null);
  const [selectedUserUp, setSelectedUserUp] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedToy, setSelectedToy] = useState(null);
  const navigate = useNavigate();

  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const userDataCookie = Cookies.get("userData");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);

      if (parsedUserData.roleId == 3) {
        navigate("/");
      } else if (parsedUserData.roleId == 1) {
        navigate("/admin");
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
      LoadToy();
      LoadToyRent();
      LoadToyBuy();
      LoadToyBan();
      LoadUser();
      LoadUserBan();
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
  useEffect(() => {
    if (
      selectedToyRent &&
      selectedToyRent.media &&
      selectedToyRent.media.length > 0
    ) {
      setSelectedMedia(selectedToyRent.media[0].mediaUrl); // Đặt ảnh/video đầu tiên làm mặc định
    }
  }, [selectedToyRent]);
  useEffect(() => {
    if (
      selectedToyBuy &&
      selectedToyBuy.media &&
      selectedToyBuy.media.length > 0
    ) {
      setSelectedMedia(selectedToyBuy.media[0].mediaUrl); // Đặt ảnh/video đầu tiên làm mặc định
    }
  }, [selectedToyBuy]);
  useEffect(() => {
    if (
      selectedToyBan &&
      selectedToyBan.media &&
      selectedToyBan.media.length > 0
    ) {
      setSelectedMedia(selectedToyBan.media[0].mediaUrl); // Đặt ảnh/video đầu tiên làm mặc định
    }
  }, [selectedToyBan]);
  const loadCategories = async () => {
    try {
      // Gửi yêu cầu GET để lấy danh sách categories
      const response = await apiCategory.get("?pageIndex=1&pageSize=50", {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      setCategories(response.data); // Lưu dữ liệu vào state

      console.log("Danh sách categories:", response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đồ chơi:", error);
    }
  };
  const [newImage, setNewImage] = useState("");

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
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
  const handleDelete = async (toyId) => {
    // Hiển thị hộp thoại xác nhận
    const isConfirmed = window.confirm("Bạn có chắc muốn từ chối đồ chơi này?");

    // Nếu người dùng không xác nhận, dừng lại
    if (!isConfirmed) {
      return;
    }

    try {
      // Gửi giá trị chuỗi trực tiếp thay vì đối tượng
      const requestBody = "Not Qualified"; // Thay đổi thành chuỗi trực tiếp

      // Log request body trước khi gửi đi
      console.log("Request body:", requestBody);

      // Gửi yêu cầu PATCH
      const response = await apiToys.patch(
        `/${toyId}/update-status`,
        requestBody, // Gửi body như chuỗi
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Log dữ liệu nhận được từ API khi thành công
      console.log("Response on success:", response);

      if (response.status === 200) {
        // Cập nhật lại state
        setToysData((prevData) =>
          prevData.map((toy) =>
            toy.id === toyId ? { ...toy, status: "Inactive" } : toy
          )
        );

        setSelectedToy(null);
        LoadToy(userId);
        LoadToyBuy(toysBuyData);

        LoadToyRent(toysRentData);
        LoadToyBan(toysBanData);
      } else {
        throw new Error(`Failed to update status for toy with ID ${toyId}`);
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
  const handleBan = async (toyId) => {
    // Hiển thị hộp thoại xác nhận
    const isConfirmed = window.confirm("Bạn có chắc muốn xoá đồ chơi này?");

    // Nếu người dùng không xác nhận, dừng lại
    if (!isConfirmed) {
      return;
    }

    try {
      // Gửi giá trị chuỗi trực tiếp thay vì đối tượng
      const requestBody = "Banned"; // Thay đổi thành chuỗi trực tiếp

      // Log request body trước khi gửi đi
      console.log("Request body:", requestBody);

      // Gửi yêu cầu PATCH
      const response = await apiToys.patch(
        `/${toyId}/update-status`,
        requestBody, // Gửi body như chuỗi
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Log dữ liệu nhận được từ API khi thành công
      console.log("Response on success:", response);

      if (response.status === 200) {
        setSelectedToyRent(null);
        setSelectedToyBuy(null);
        LoadToyBuy(toysBuyData);
        LoadToyRent(toysRentData);
        LoadToyBan(toysBanData);
      } else {
        throw new Error(`Failed to update status for toy with ID ${toyId}`);
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
  const handleUnBan = async (toyId) => {
    // Hiển thị hộp thoại xác nhận
    const isConfirmed = window.confirm("Bạn có chắc muốn bỏ cấm đồ chơi này?");

    // Nếu người dùng không xác nhận, dừng lại
    if (!isConfirmed) {
      return;
    }

    try {
      // Gửi giá trị chuỗi trực tiếp thay vì đối tượng
      const requestBody = "Active"; // Thay đổi thành chuỗi trực tiếp

      // Log request body trước khi gửi đi
      console.log("Request body:", requestBody);

      // Gửi yêu cầu PATCH
      const response = await apiToys.patch(
        `/${toyId}/update-status`,
        requestBody, // Gửi body như chuỗi
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Log dữ liệu nhận được từ API khi thành công
      console.log("Response on success:", response);

      if (response.status === 200) {
        setSelectedToyBan(null);
        LoadToyBan(toysBanData);
        LoadToyBuy(toysBuyData);
        LoadToyRent(toysRentData);
      } else {
        throw new Error(`Failed to update status for toy with ID ${toyId}`);
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
  const LoadToy = async () => {
    try {
      const toyResponse = await apiToys.get(`?pageIndex=1&pageSize=2000`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      // Lọc đồ chơi có trạng thái "Inactive"
      const inactiveToys = toyResponse.data.filter(
        (toy) => toy.status === "Inactive"
      );

      console.log(`Danh sách đồ chơi có trạng thái chờ duyệt:`, inactiveToys);

      // Cập nhật dữ liệu đồ chơi
      setToysData(inactiveToys);
      updateCurrentPageData1(inactiveToys);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đồ chơi:", error);
    }
  };
  const LoadToyRent = async () => {
    try {
      const toyResponse = await apiToys.get(`?pageIndex=1&pageSize=2000`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Danh sách đồ chơi mới log:", toyResponse.data);
      // Lọc đồ chơi có trạng thái "Inactive"
      const inactiveToysRent = toyResponse.data.filter(
        (toy) => toy.status === "Active" && toy.buyQuantity === -1
      );

      console.log(`Danh sách đồ chơi có trạng thái thuê:`, inactiveToysRent);

      // Cập nhật dữ liệu đồ chơi
      setToysRentData(inactiveToysRent);
      // Cập nhật các đồ chơi của trang hiện tại
      updateCurrentPageData(inactiveToysRent);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đồ chơi: thuê", error);
    }
  };
  const LoadToyBuy = async () => {
    try {
      const toyResponse = await apiToys.get(`?pageIndex=1&pageSize=2000`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Danh sách đồ chơi mới log:", toyResponse.data);
      // Lọc đồ chơi có trạng thái "Inactive"
      const inactiveToysBuy = toyResponse.data.filter(
        (toy) => toy.status === "Active" && toy.buyQuantity >= 1
      );

      console.log(`Danh sách đồ chơi có trạng thái mua:`, inactiveToysBuy);

      // Cập nhật dữ liệu đồ chơi
      setToysBuyData(inactiveToysBuy);
      updateCurrentPageData2(inactiveToysBuy);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đồ chơi: thuê", error);
    }
  };
  const LoadToyBan = async () => {
    try {
      const toyResponse = await apiToys.get(`?pageIndex=1&pageSize=2000`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Danh sách đồ chơi mới log:", toyResponse.data);
      // Lọc đồ chơi có trạng thái "Inactive"
      const inactiveToysBan = toyResponse.data.filter(
        (toy) => toy.status === "Banned"
      );

      console.log(`Danh sách đồ chơi có trạng thái ban:`, inactiveToysBan);

      // Cập nhật dữ liệu đồ chơi
      setToysBanData(inactiveToysBan);
      updateCurrentPageData3(inactiveToysBan);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đồ chơi ban:", error);
    }
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
          (user.role?.id === 2 || user.role?.id === 3) &&
          user.status === "Active"
      );

      console.log(`Danh sách người dùng load:`, UserData);

      // Cập nhật dữ liệu đồ chơi
      setUserUpData(UserData);
      updateCurrentPageData4(UserData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng", error);
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
          (user.role?.id === 2 || user.role?.id === 3) &&
          user.status === "Banned"
      );

      console.log(`Danh sách người dùng ban load:`, UserData);

      // Cập nhật dữ liệu đồ chơi
      setUserUpBanData(UserData);
      updateCurrentPageData5(UserData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng", error);
    }
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
      updateCurrentPageData6(filteredOrders);
    } catch (error) {
      console.error(
        "Lỗi khi tải danh sách đơn hàng hoặc chi tiết đơn hàng:",
        error
      );
    }
  };
  useEffect(() => {
    // Gọi hàm khi currentPage thay đổi để cập nhật dữ liệu cho trang hiện tại
    updateCurrentPageData(toysRentData);
  }, [currentPage, toysRentData]); // Cập nhật khi currentPage hoặc toysRentData thay đổi

  useEffect(() => {
    // Gọi hàm khi currentPage thay đổi để cập nhật dữ liệu cho trang hiện tại
    updateCurrentPageData1(toysData);
  }, [currentPageData, toysData]); // Cập nhật khi currentPage hoặc toysRentData thay đổi

  useEffect(() => {
    // Gọi hàm khi currentPage thay đổi để cập nhật dữ liệu cho trang hiện tại
    updateCurrentPageData2(toysBuyData);
  }, [currentPageData1, toysBuyData]); // Cập nhật khi currentPage hoặc toysRentData thay đổi
  useEffect(() => {
    // Gọi hàm khi currentPage thay đổi để cập nhật dữ liệu cho trang hiện tại
    updateCurrentPageData3(toysBanData);
  }, [currentPageData2, toysBanData]); // Cập nhật khi currentPage hoặc toysRentData thay đổi
  useEffect(() => {
    // Gọi hàm khi currentPage thay đổi để cập nhật dữ liệu cho trang hiện tại
    updateCurrentPageData4(userUpData);
  }, [currentPageData3, userUpData]); // Cập nhật khi currentPage hoặc toysRentData thay đổi
  useEffect(() => {
    // Gọi hàm khi currentPage thay đổi để cập nhật dữ liệu cho trang hiện tại
    updateCurrentPageData5(userUpBanData);
  }, [currentPageData4, userUpBanData]); // Cập nhật khi currentPage hoặc toysRentData thay đổi
  useEffect(() => {
    // Gọi hàm khi currentPage thay đổi để cập nhật dữ liệu cho trang hiện tại
    updateCurrentPageData6(orders);
  }, [currentPageData5, orders]); // Cập nhật khi currentPage hoặc toysRentData thay đổi
  const [currentToys, setCurrentToys] = useState([]); // Dữ liệu đồ chơi hiện tại
  const [currentToys1, setCurrentToys1] = useState([]); // Dữ liệu đồ chơi hiện tại
  const [currentToys2, setCurrentToys2] = useState([]); // Dữ liệu đồ chơi hiện tại
  const [currentToys3, setCurrentToys3] = useState([]); // Dữ liệu đồ chơi hiện tại
  const [currentToys4, setCurrentToys4] = useState([]); // Dữ liệu đồ chơi hiện tại
  const [currentToys5, setCurrentToys5] = useState([]); // Dữ liệu đồ chơi hiện tại
  const [currentToys6, setCurrentToys6] = useState([]); // Dữ liệu đồ chơi hiện tại
  const updateCurrentPageData1 = (inactiveToys) => {
    // Tính toán vị trí bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPageData - 1) * itemsPerPage;
    const endIndex = currentPageData * itemsPerPage;

    // Lấy mảng các đồ chơi cho trang hiện tại
    const currentItems = inactiveToys.slice(startIndex, endIndex);

    // Cập nhật dữ liệu hiển thị
    setCurrentToys1(currentItems);
  };
  // Gọi API khi trang thay đổi
  const updateCurrentPageData = (inactiveToysRent) => {
    // Tính toán vị trí bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;

    // Lấy mảng các đồ chơi cho trang hiện tại
    const currentItems = inactiveToysRent.slice(startIndex, endIndex);

    // Cập nhật dữ liệu hiển thị
    setCurrentToys(currentItems);
  };

  const updateCurrentPageData2 = (inactiveToysBuy) => {
    // Tính toán vị trí bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPageData1 - 1) * itemsPerPage;
    const endIndex = currentPageData1 * itemsPerPage;

    // Lấy mảng các đồ chơi cho trang hiện tại
    const currentItems = inactiveToysBuy.slice(startIndex, endIndex);

    // Cập nhật dữ liệu hiển thị
    setCurrentToys2(currentItems);
  };
  const updateCurrentPageData3 = (inactiveToysBan) => {
    // Tính toán vị trí bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPageData2 - 1) * itemsPerPage;
    const endIndex = currentPageData2 * itemsPerPage;

    // Lấy mảng các đồ chơi cho trang hiện tại
    const currentItems = inactiveToysBan.slice(startIndex, endIndex);

    // Cập nhật dữ liệu hiển thị
    setCurrentToys3(currentItems);
  };
  const updateCurrentPageData4 = (UserData) => {
    // Tính toán vị trí bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPageData3 - 1) * itemsPerPage;
    const endIndex = currentPageData3 * itemsPerPage;

    // Lấy mảng các đồ chơi cho trang hiện tại
    const currentItems = UserData.slice(startIndex, endIndex);

    // Cập nhật dữ liệu hiển thị
    setCurrentToys4(currentItems);
  };
  const updateCurrentPageData5 = (UserData) => {
    // Tính toán vị trí bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPageData4 - 1) * itemsPerPage;
    const endIndex = currentPageData4 * itemsPerPage;

    // Lấy mảng các đồ chơi cho trang hiện tại
    const currentItems = UserData.slice(startIndex, endIndex);

    // Cập nhật dữ liệu hiển thị
    setCurrentToys5(currentItems);
  };

  const updateCurrentPageData6 = (filteredOrders) => {
    // Tính toán vị trí bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPageData5 - 1) * itemsPerPage;
    const endIndex = currentPageData5 * itemsPerPage;

    // Lấy mảng các đồ chơi cho trang hiện tại
    const currentItems = filteredOrders.slice(startIndex, endIndex);

    // Cập nhật dữ liệu hiển thị
    setCurrentToys6(currentItems);
  };
  const handleNext = () => {
    // Kiểm tra điều kiện chuyển trang cho toysRentData
    if (currentPage * itemsPerPage < toysRentData.length) {
      setCurrentPage(currentPage + 1);
      updateCurrentPageData(toysRentData); // Cập nhật dữ liệu cho toysRentData
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      updateCurrentPageData(toysRentData); // Cập nhật dữ liệu cho toysRentData
    }
  };
  const handleNext1 = () => {
    // Kiểm tra điều kiện chuyển trang cho toysData
    if (currentPageData * itemsPerPage < toysData.length) {
      setCurrentPageData(currentPageData + 1);
      updateCurrentPageData1(toysData); // Cập nhật dữ liệu cho toysData
    }
  };

  const handlePrevious1 = () => {
    if (currentPageData > 1) {
      setCurrentPageData(currentPageData - 1);
      updateCurrentPageData1(toysData); // Cập nhật dữ liệu cho toysData
    }
  };

  const handleNext2 = () => {
    // Kiểm tra điều kiện chuyển trang cho toysData
    if (currentPageData1 * itemsPerPage < toysBuyData.length) {
      setCurrentPageData1(currentPageData1 + 1);
      updateCurrentPageData2(toysBuyData); // Cập nhật dữ liệu cho toysData
    }
  };

  const handlePrevious2 = () => {
    if (currentPageData1 > 1) {
      setCurrentPageData1(currentPageData1 - 1);
      updateCurrentPageData2(toysBuyData); // Cập nhật dữ liệu cho toysData
    }
  };

  const handleNext3 = () => {
    // Kiểm tra điều kiện chuyển trang cho toysData
    if (currentPageData2 * itemsPerPage < toysBanData.length) {
      setCurrentPageData2(currentPageData2 + 1);
      updateCurrentPageData3(toysBanData); // Cập nhật dữ liệu cho toysData
    }
  };

  const handlePrevious3 = () => {
    if (currentPageData2 > 1) {
      setCurrentPageData2(currentPageData2 - 1);
      updateCurrentPageData3(toysBanData); // Cập nhật dữ liệu cho toysData
    }
  };

  const handleNext4 = () => {
    // Kiểm tra điều kiện chuyển trang cho toysData
    if (currentPageData3 * itemsPerPage < userUpData.length) {
      setCurrentPageData3(currentPageData3 + 1);
      updateCurrentPageData4(userUpData); // Cập nhật dữ liệu cho toysData
    }
  };

  const handlePrevious4 = () => {
    if (currentPageData3 > 1) {
      setCurrentPageData3(currentPageData3 - 1);
      updateCurrentPageData4(userUpData); // Cập nhật dữ liệu cho toysData
    }
  };

  const handleNext5 = () => {
    // Kiểm tra điều kiện chuyển trang cho toysData
    if (currentPageData4 * itemsPerPage < userUpBanData.length) {
      setCurrentPageData4(currentPageData4 + 1);
      updateCurrentPageData5(userUpBanData); // Cập nhật dữ liệu cho toysData
    }
  };

  const handlePrevious5 = () => {
    if (currentPageData4 > 1) {
      setCurrentPageData4(currentPageData4 - 1);
      updateCurrentPageData5(userUpBanData); // Cập nhật dữ liệu cho toysData
    }
  };

  const handleNext6 = () => {
    // Kiểm tra điều kiện chuyển trang cho toysData
    if (currentPageData5 * itemsPerPage < orders.length) {
      setCurrentPageData5(currentPageData5 + 1);
      updateCurrentPageData6(orders); // Cập nhật dữ liệu cho toysData
    }
  };

  const handlePrevious6 = () => {
    if (currentPageData5 > 1) {
      setCurrentPageData5(currentPageData5 - 1);
      updateCurrentPageData6(orders); // Cập nhật dữ liệu cho toysData
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(userData); // Đặt lại dữ liệu về ban đầu
  };
  const handleUpdate = async () => {
    // Kiểm tra các điều kiện
    const phoneRegex = /^\d{10}$/;

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

  const handleCheckingBroke = async (order) => {
    console.log(newImage);
    if (newImage != null && newImage != "") {
      apiOrder
        .get("/" + order.orderId, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        })
        .then((response) => {
          apiNotifications.post(
            "",
            {
              notify: `Đơn hàng ${response.data.id} đang giao đến bạn`,
              isRead: false,
              userId: response.data.userId,
            },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );
        });

      console.log(newImage);

      var formData = new FormData();

      formData.append(`checkImageUrls`, newImage);

      var tmp = order;
      tmp.status = "DeliveringToUser";
      axios
        .post(
          "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/OrderCheckImages?orderDetailId=" +
            order.id,
          formData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        )
        .then(async (response) => {
          await apiOrderDetail
            .put("/" + order.id, tmp, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            })
            .then((response) => {
              LoadOrder();
            });
        });
    } else {
      alert("Chưa chọn hình ảnh tình trạng đồ chơi");
    }
  };

  const handleCheckingGood = async (order) => {
    if (newImage != null && newImage != "") {
      apiOrder
        .get("/" + order.orderId, {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        })
        .then((response) => {
          apiNotifications.post(
            "",
            {
              notify: `Đơn hàng ${response.data.id} đang giao đến bạn`,
              isRead: false,
              userId: response.data.shopId,
            },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );
        });

      var formData = new FormData();
      formData.append(`checkImageUrls`, newImage);
      var tmp = order;
      tmp.status = "DeliveringToShop";
      axios
        .post(
          "https://edutoyrent-cngbg3hphsg2fdff.southeastasia-01.azurewebsites.net/api/OrderCheckImages?orderDetailId=" +
            order.id,
          formData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          }
        )
        .then(async (response) => {
          await apiOrderDetail
            .put("/" + order.id, tmp, {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            })
            .then((response) => {
              LoadOrder();
            });
        });
    } else {
      alert("Chưa chọn hình ảnh tình trạng đồ chơi");
    }
  };

  const statusMapping = {
    Delivering: "Đang giao tới kho kiểm duyệt",
    Complete: "Hoàn thành",
    Active: "Sẵn sàng",
    Inactive: "Không sẵn sàng",
    Banned: "Bị cấm",
    Checking: "Đang đánh giá đồ chơi",
  };

  // Hàm để gửi ảnh lên API
  const handleUpdateToy = async (toyId) => {
    const isConfirmed = window.confirm("Bạn muốn duyệt đồ chơi này ?");

    // Nếu người dùng không xác nhận, dừng lại
    if (!isConfirmed) {
      return;
    }

    try {
      // Gửi giá trị chuỗi trực tiếp thay vì đối tượng
      const requestBody = "Active"; // Thay đổi thành chuỗi trực tiếp

      // Log request body trước khi gửi đi
      console.log("Request body:", requestBody);

      // Gửi yêu cầu PATCH
      const response = await apiToys.patch(
        `/${toyId}/update-status`,
        requestBody, // Gửi body như chuỗi
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Log dữ liệu nhận được từ API khi thành công
      console.log("Response on success:", response);

      if (response.status === 200) {
        // Cập nhật lại state
        setToysData((prevData) =>
          prevData.map((toy) =>
            toy.id === toyId ? { ...toy, status: "Inactive" } : toy
          )
        );
        setSelectedToy(null);
        LoadToy(userId);
        LoadToyBuy(toysBuyData);
        LoadToyRent(toysRentData);
      } else {
        throw new Error(`Failed to update status for toy with ID ${toyId}`);
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
  const handleUserUnBan = async (userId) => {
    // Hiển thị hộp thoại xác nhận
    const isConfirmed = window.confirm("Bạn có chắc muốn cấm người dùng này?");

    // Nếu người dùng không xác nhận, dừng lại
    if (!isConfirmed) {
      return;
    }

    try {
      // Gửi giá trị chuỗi trực tiếp thay vì đối tượng
      const requestBody = "Active"; // Thay đổi thành chuỗi trực tiếp

      // Log request body trước khi gửi đi
      console.log("Request body:", requestBody);
      console.log("d:", selectedUserUpBan);
      const formData = new FormData();

      //Thêm các trường dữ liệu vào formData
      formData.append("fullName", selectedUserUpBan.fullName || "Default Name");
      formData.append(
        "email",
        selectedUserUpBan.email || "default@example.com"
      );
      formData.append(
        "password",
        selectedUserUpBan.password || "defaultPassword"
      );
      formData.append(
        "createDate",
        selectedUserUpBan.createDate || new Date().toISOString()
      );
      formData.append("phone", selectedUserUpBan.phone || "0000000000");
      formData.append("dob", selectedUserUpBan.dob || new Date().toISOString());
      formData.append(
        "address",
        selectedUserUpBan.address || "Default Address"
      );
      formData.append("status", requestBody || "Active");
      formData.append("roleId", selectedUserUpBan.role.id || "");
      formData.append("avatarUrl", selectedUserUpBan.avatarUrl || "");
      // formData.append("description", selectedUserUp.description || "");
      console.log("dữ liệu sẽ gửi", formData.data);

      const response = await apiUser.put(`/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Log dữ liệu nhận được từ API khi thành công
      console.log("Response on success:", response);

      if (response.status === 204) {
        setSelectedUserUpBan(null);
        LoadUserBan(userUpBanData);
        LoadUser(userUpData);
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
      case "ToyRent":
        return (
          <div>
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
                            Tên đồ chơi
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Giá
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Xuất xứ
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Tuổi
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Thương hiệu
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Ngày tạo
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
                        {currentToys &&
                        Array.isArray(currentToys) &&
                        currentToys.length > 0 ? (
                          currentToys.map((toy) => (
                            <tr
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              key={toy.id}
                            >
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                  {toy.media && toy.media.length > 0 ? (
                                    <img
                                      src={toy.media[0].mediaUrl}
                                      alt="Toy Media 1"
                                      className="w-full max-w-[50px] h-auto object-contain mr-2"
                                    />
                                  ) : (
                                    <span></span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white truncate w-[200px]">
                                  {toy.name}
                                </div>
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {(toy.price || 0).toLocaleString()} VNĐ
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.origin}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.age}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.brand}
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {new Date(toy.createDate).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {statusMapping[toy.status] ||
                                  "Trạng thái không xác định"}
                              </td>

                              <td className="p-4 space-x-2 whitespace-nowrap">
                                {/* Nút "Detail" */}
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedToyRent(toy); // Lưu thông tin toy vào state
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

            <div className="sticky bottom-0 right-0 flex justify-end w-full p-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPage === 1
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Trang {currentPage} /{" "}
                  {Math.ceil(toysRentData.length / itemsPerPage)}
                </span>
                <button
                  onClick={handleNext}
                  disabled={
                    currentPage ===
                    Math.ceil(toysRentData.length / itemsPerPage)
                  }
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPage ===
                    Math.ceil(toysRentData.length / itemsPerPage)
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
            {selectedToyRent && !isEditing && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center  z-[1000]">
                <div className="bg-white p-16 rounded-2xl shadow-2xl max-w-7xl w-full h-auto overflow-auto relative z-[1010]">
                  {/* Nút đóng ở góc phải */}
                  <button
                    type="button"
                    onClick={() => setSelectedToyRent(null)} // Đóng chi tiết khi bấm nút
                    className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>

                  <div className="flex flex-wrap lg:flex-nowrap gap-10">
                    {/* Phần hình ảnh */}
                    <div className="flex-1 flex justify-center items-center flex-col max-w-md mx-auto mt-20">
                      {/* Hiển thị ảnh hoặc video */}
                      <div className="w-80 h-80">
                        {selectedMedia &&
                        selectedToyRent.media.some(
                          (media) => media.mediaUrl === selectedMedia
                        ) ? (
                          selectedMedia.endsWith(".mp4?alt=media") ? (
                            <video
                              src={selectedMedia}
                              controls
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                            />
                          ) : (
                            <img
                              src={selectedMedia}
                              alt="Media"
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                            />
                          )
                        ) : null}
                      </div>

                      {/* Ảnh/video nhỏ */}
                      <div className="flex gap-4 flex-wrap justify-center mt-4">
                        {" "}
                        {/* Giữ cho các ảnh nhỏ xếp dưới ảnh lớn */}
                        {selectedToyRent.media.map((media, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            {/* Hiển thị video nếu media là video */}
                            {media.mediaUrl.endsWith(".mp4?alt=media") ? (
                              <video
                                src={media.mediaUrl}
                                alt={`Video ${index + 1}`}
                                className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-transform duration-200 
              ${
                selectedMedia === media.mediaUrl
                  ? "border-orange-500 scale-105"
                  : "border-gray-300"
              }`}
                                onClick={() => setSelectedMedia(media.mediaUrl)} // Cập nhật media khi chọn video
                              />
                            ) : (
                              // Hiển thị ảnh nếu media là ảnh
                              <img
                                src={media.mediaUrl}
                                alt={`Hình ảnh ${index + 1}`}
                                className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-transform duration-200 
              ${
                selectedMedia === media.mediaUrl
                  ? "border-orange-500 scale-105"
                  : "border-gray-300"
              }`}
                                onClick={() => setSelectedMedia(media.mediaUrl)} // Cập nhật media khi chọn ảnh
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Phần thông tin */}
                    <div className="flex-1 text-sm space-y-6">
                      <h2 className="text-4xl font-bold mb-10 text-center">
                        Thông tin đồ chơi
                      </h2>
                      <p className="text-lg">
                        <strong>Tên đồ chơi:</strong> {selectedToyRent.name}
                      </p>
                      <p className="text-lg">
                        <strong>Giá:</strong>{" "}
                        {(selectedToyRent.price || 0).toLocaleString()} VNĐ
                      </p>
                      <p className="text-lg">
                        <strong>Xuất xứ:</strong> {selectedToyRent.origin}
                      </p>
                      <p className="text-lg">
                        <strong>Tuổi:</strong> {selectedToyRent.age}
                      </p>

                      <p className="text-lg">
                        <strong>Thương Hiệu:</strong> {selectedToyRent.brand}
                      </p>
                      <p className="text-lg">
                        <strong>Danh mục:</strong>{" "}
                        {selectedToyRent.category.name}
                      </p>
                      <p className="text-lg">
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(
                          selectedToyRent.createDate
                        ).toLocaleDateString()}
                      </p>

                      <p className="text-lg">
                        <strong>Trạng thái:</strong>{" "}
                        {statusMapping[selectedToyRent.status] ||
                          "Trạng thái không xác định"}
                      </p>
                      {/* <p className=" space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation(); // Ngăn sự kiện lan truyền lên <tr>
                            handleBan(selectedToyRent.id); // Gọi hàm handleDelete
                          }}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                        >
                          Cấm
                        </button>
                      </p> */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "products":
        return (
          <div>
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
                            Tên đồ chơi
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Giá
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Xuất xứ
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Tuổi
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Thương hiệu
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Ngày tạo
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
                        {currentToys1 &&
                        Array.isArray(currentToys1) &&
                        currentToys1.length > 0 ? (
                          currentToys1.map((toy) => (
                            <tr
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              key={toy.id}
                            >
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                  {toy.media && toy.media.length > 0 ? (
                                    <img
                                      src={toy.media[0].mediaUrl}
                                      alt="Toy Media 1"
                                      className="w-full max-w-[50px] h-auto object-contain mr-2"
                                    />
                                  ) : (
                                    <span></span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white truncate w-[200px]">
                                  {toy.name}
                                </div>
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {(toy.price || 0).toLocaleString()} VNĐ
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.origin}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.age}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.brand}
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {new Date(toy.createDate).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {statusMapping[toy.status] ||
                                  "Trạng thái không xác định"}
                              </td>

                              <td className="p-4 space-x-2 whitespace-nowrap">
                                {/* Nút "Detail" */}
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedToy(toy); // Lưu thông tin toy vào state
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

            <div className="sticky bottom-0 right-0 flex justify-end w-full p-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevious1}
                  disabled={currentPageData === 1}
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData === 1
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Trang {currentPageData} /{" "}
                  {Math.ceil(toysData.length / itemsPerPage)}
                </span>
                <button
                  onClick={handleNext1}
                  disabled={
                    currentPageData ===
                    Math.ceil(toysData.length / itemsPerPage)
                  }
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData ===
                    Math.ceil(toysData.length / itemsPerPage)
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
            {selectedToy && !isEditing && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center  z-[1000]">
                <div className="bg-white p-16 rounded-2xl shadow-2xl max-w-7xl w-full h-auto overflow-auto relative z-[1010]">
                  {/* Nút đóng ở góc phải */}
                  <button
                    type="button"
                    onClick={() => setSelectedToy(null)} // Đóng chi tiết khi bấm nút
                    className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>

                  <div className="flex flex-wrap lg:flex-nowrap gap-10">
                    {/* Phần hình ảnh */}
                    <div className="flex-1 flex justify-center items-center flex-col max-w-md mx-auto mt-20">
                      {/* Hiển thị ảnh hoặc video */}
                      <div className="w-80 h-80">
                        {selectedMedia &&
                        selectedToy.media.some(
                          (media) => media.mediaUrl === selectedMedia
                        ) ? (
                          selectedMedia.endsWith(".mp4?alt=media") ? (
                            <video
                              src={selectedMedia}
                              controls
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                            />
                          ) : (
                            <img
                              src={selectedMedia}
                              alt="Media"
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                            />
                          )
                        ) : null}
                      </div>

                      {/* Ảnh/video nhỏ */}
                      <div className="flex gap-4 flex-wrap justify-center mt-4">
                        {" "}
                        {/* Giữ cho các ảnh nhỏ xếp dưới ảnh lớn */}
                        {selectedToy.media.map((media, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            {/* Hiển thị video nếu media là video */}
                            {media.mediaUrl.endsWith(".mp4?alt=media") ? (
                              <video
                                src={media.mediaUrl}
                                alt={`Video ${index + 1}`}
                                className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-transform duration-200 
              ${
                selectedMedia === media.mediaUrl
                  ? "border-orange-500 scale-105"
                  : "border-gray-300"
              }`}
                                onClick={() => setSelectedMedia(media.mediaUrl)} // Cập nhật media khi chọn video
                              />
                            ) : (
                              // Hiển thị ảnh nếu media là ảnh
                              <img
                                src={media.mediaUrl}
                                alt={`Hình ảnh ${index + 1}`}
                                className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-transform duration-200 
              ${
                selectedMedia === media.mediaUrl
                  ? "border-orange-500 scale-105"
                  : "border-gray-300"
              }`}
                                onClick={() => setSelectedMedia(media.mediaUrl)} // Cập nhật media khi chọn ảnh
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Phần thông tin */}
                    <div className="flex-1 text-sm space-y-6">
                      <h2 className="text-4xl font-bold mb-10 text-center">
                        Thông tin đồ chơi
                      </h2>
                      <p className="text-lg">
                        <strong>Tên đồ chơi:</strong> {selectedToy.name}
                      </p>
                      <p className="text-lg">
                        <strong>Giá:</strong>{" "}
                        {(selectedToy.price || 0).toLocaleString()} VNĐ
                      </p>
                      <p className="text-lg">
                        <strong>Xuất xứ:</strong> {selectedToy.origin}
                      </p>
                      <p className="text-lg">
                        <strong>Tuổi:</strong> {selectedToy.age}
                      </p>

                      <p className="text-lg">
                        <strong>Thương Hiệu:</strong> {selectedToy.brand}
                      </p>
                      <p className="text-lg">
                        <strong>Danh mục:</strong> {selectedToy.category.name}
                      </p>
                      <p className="text-lg">
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(selectedToy.createDate).toLocaleDateString()}
                      </p>

                      <p className="text-lg">
                        <strong>Trạng thái:</strong>{" "}
                        {statusMapping[selectedToy.status] ||
                          "Trạng thái không xác định"}
                      </p>
                      <p className=" space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            // setIsEditing(true); // Bật form chỉnh sửa
                            // setSelectedToy(toy); // Lưu thông tin toy vào selectedToy
                            handleUpdateToy(selectedToy.id);
                          }}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        >
                          Chấp nhận
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation(); // Ngăn sự kiện lan truyền lên <tr>
                            handleDelete(selectedToy.id); // Gọi hàm handleDelete
                          }}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                        >
                          Từ chối
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "ToyBuy":
        return (
          <div>
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
                            Tên đồ chơi
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Giá
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Xuất xứ
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Tuổi
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Thương hiệu
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Ngày tạo
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
                        {currentToys2 &&
                        Array.isArray(currentToys2) &&
                        currentToys2.length > 0 ? (
                          currentToys2.map((toy) => (
                            <tr
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              key={toy.id}
                            >
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                  {toy.media && toy.media.length > 0 ? (
                                    <img
                                      src={toy.media[0].mediaUrl}
                                      alt="Toy Media 1"
                                      className="w-full max-w-[50px] h-auto object-contain mr-2"
                                    />
                                  ) : (
                                    <span></span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white truncate w-[200px]">
                                  {toy.name}
                                </div>
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {(toy.price || 0).toLocaleString()} VNĐ
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.origin}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.age}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.brand}
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {new Date(toy.createDate).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {statusMapping[toy.status] ||
                                  "Trạng thái không xác định"}
                              </td>

                              <td className="p-4 space-x-2 whitespace-nowrap">
                                {/* Nút "Detail" */}
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedToyBuy(toy); // Lưu thông tin toy vào state
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

            <div className="sticky bottom-0 right-0 flex justify-end w-full p-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevious2}
                  disabled={currentPageData1 === 1}
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData1 === 1
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Trang {currentPageData1} /{" "}
                  {Math.ceil(toysBuyData.length / itemsPerPage)}
                </span>
                <button
                  onClick={handleNext2}
                  disabled={
                    currentPageData1 ===
                    Math.ceil(toysBuyData.length / itemsPerPage)
                  }
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData1 ===
                    Math.ceil(toysBuyData.length / itemsPerPage)
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
            {selectedToyBuy && !isEditing && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center  z-[1000]">
                <div className="bg-white p-16 rounded-2xl shadow-2xl max-w-7xl w-full h-auto overflow-auto relative z-[1010]">
                  {/* Nút đóng ở góc phải */}
                  <button
                    type="button"
                    onClick={() => setSelectedToyBuy(null)} // Đóng chi tiết khi bấm nút
                    className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>

                  <div className="flex flex-wrap lg:flex-nowrap gap-10">
                    {/* Phần hình ảnh */}
                    <div className="flex-1 flex justify-center items-center flex-col max-w-md mx-auto mt-20">
                      {/* Hiển thị ảnh hoặc video */}
                      <div className="w-80 h-80">
                        {selectedMedia &&
                        selectedToyBuy.media.some(
                          (media) => media.mediaUrl === selectedMedia
                        ) ? (
                          selectedMedia.endsWith(".mp4?alt=media") ? (
                            <video
                              src={selectedMedia}
                              controls
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                            />
                          ) : (
                            <img
                              src={selectedMedia}
                              alt="Media"
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                            />
                          )
                        ) : null}
                      </div>

                      {/* Ảnh/video nhỏ */}
                      <div className="flex gap-4 flex-wrap justify-center mt-4">
                        {" "}
                        {/* Giữ cho các ảnh nhỏ xếp dưới ảnh lớn */}
                        {selectedToyBuy.media.map((media, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            {/* Hiển thị video nếu media là video */}
                            {media.mediaUrl.endsWith(".mp4?alt=media") ? (
                              <video
                                src={media.mediaUrl}
                                alt={`Video ${index + 1}`}
                                className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-transform duration-200 
              ${
                selectedMedia === media.mediaUrl
                  ? "border-orange-500 scale-105"
                  : "border-gray-300"
              }`}
                                onClick={() => setSelectedMedia(media.mediaUrl)} // Cập nhật media khi chọn video
                              />
                            ) : (
                              // Hiển thị ảnh nếu media là ảnh
                              <img
                                src={media.mediaUrl}
                                alt={`Hình ảnh ${index + 1}`}
                                className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-transform duration-200 
              ${
                selectedMedia === media.mediaUrl
                  ? "border-orange-500 scale-105"
                  : "border-gray-300"
              }`}
                                onClick={() => setSelectedMedia(media.mediaUrl)} // Cập nhật media khi chọn ảnh
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Phần thông tin */}
                    <div className="flex-1 text-sm space-y-6">
                      <h2 className="text-4xl font-bold mb-10 text-center">
                        Thông tin đồ chơi
                      </h2>
                      <p className="text-lg">
                        <strong>Tên đồ chơi:</strong> {selectedToyBuy.name}
                      </p>
                      <p className="text-lg">
                        <strong>Giá:</strong>{" "}
                        {(selectedToyBuy.price || 0).toLocaleString()} VNĐ
                      </p>
                      <p className="text-lg">
                        <strong>Xuất xứ:</strong> {selectedToyBuy.origin}
                      </p>
                      <p className="text-lg">
                        <strong>Tuổi:</strong> {selectedToyBuy.age}
                      </p>

                      <p className="text-lg">
                        <strong>Thương Hiệu:</strong> {selectedToyBuy.brand}
                      </p>
                      <p className="text-lg">
                        <strong>Danh mục:</strong>{" "}
                        {selectedToyBuy.category.name}
                      </p>
                      <p className="text-lg">
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(
                          selectedToyBuy.createDate
                        ).toLocaleDateString()}
                      </p>

                      <p className="text-lg">
                        <strong>Trạng thái:</strong>{" "}
                        {statusMapping[selectedToyBuy.status] ||
                          "Trạng thái không xác định"}
                      </p>
                      {/* <p className=" space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation(); // Ngăn sự kiện lan truyền lên <tr>
                            handleBan(selectedToyBuy.id); // Gọi hàm handleDelete
                          }}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                        >
                          Cấm
                        </button>
                      </p> */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "Status":
        return (
          <div className="container mx-auto py-4">
            <h2 className="text-2xl font-semibold">Danh sách đơn hàng</h2>
            {currentToys6.map((order) => (
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
                    {order.status == "Checking" && (
                      <label className="block mb-2">
                        Hình ảnh tình trạng đồ chơi:
                        <input
                          type="file"
                          onChange={handleImageChange}
                          className="border border-gray-300 rounded p-1 w-full"
                          accept="image/*"
                        />
                      </label>
                    )}
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
            <div className="sticky bottom-0 right-0 flex justify-end w-full p-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevious6}
                  disabled={currentPageData5 === 1}
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData5 === 1
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Trang {currentPageData5} /{" "}
                  {Math.ceil(orders.length / itemsPerPage)}
                </span>
                <button
                  onClick={handleNext6}
                  disabled={
                    currentPageData5 === Math.ceil(orders.length / itemsPerPage)
                  }
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData5 === Math.ceil(orders.length / itemsPerPage)
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
          </div>
        );
      case "ToyBan":
        return (
          <div>
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
                            Tên đồ chơi
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Giá
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Xuất xứ
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Tuổi
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Thương hiệu
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Ngày tạo
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
                        {currentToys3 &&
                        Array.isArray(currentToys3) &&
                        currentToys3.length > 0 ? (
                          currentToys3.map((toy) => (
                            <tr
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              key={toy.id}
                            >
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                  {toy.media && toy.media.length > 0 ? (
                                    <img
                                      src={toy.media[0].mediaUrl}
                                      alt="Toy Media 1"
                                      className="w-full max-w-[50px] h-auto object-contain mr-2"
                                    />
                                  ) : (
                                    <span></span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white truncate w-[200px]">
                                  {toy.name}
                                </div>
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {(toy.price || 0).toLocaleString()} VNĐ
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.origin}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.age}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.brand}
                              </td>

                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {new Date(toy.createDate).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {statusMapping[toy.status] ||
                                  "Trạng thái không xác định"}
                              </td>

                              <td className="p-4 space-x-2 whitespace-nowrap">
                                {/* Nút "Detail" */}
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedToyBan(toy); // Lưu thông tin toy vào state
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

            <div className="sticky bottom-0 right-0 flex justify-end w-full p-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevious3}
                  disabled={currentPageData2 === 1}
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData2 === 1
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Trang {currentPageData2} /{" "}
                  {Math.ceil(toysBanData.length / itemsPerPage)}
                </span>
                <button
                  onClick={handleNext3}
                  disabled={
                    currentPageData2 ===
                    Math.ceil(toysBanData.length / itemsPerPage)
                  }
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData2 ===
                    Math.ceil(toysBanData.length / itemsPerPage)
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
            {selectedToyBan && !isEditing && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center  z-[1000]">
                <div className="bg-white p-16 rounded-2xl shadow-2xl max-w-7xl w-full h-auto overflow-auto relative  z-[1010]">
                  {/* Nút đóng ở góc phải */}
                  <button
                    type="button"
                    onClick={() => setSelectedToyBan(null)} // Đóng chi tiết khi bấm nút
                    className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>

                  <div className="flex flex-wrap lg:flex-nowrap gap-10">
                    {/* Phần hình ảnh */}
                    <div className="flex-1 flex justify-center items-center flex-col max-w-md mx-auto mt-20">
                      {/* Hiển thị ảnh hoặc video */}
                      <div className="w-80 h-80">
                        {selectedMedia &&
                        selectedToyBan.media.some(
                          (media) => media.mediaUrl === selectedMedia
                        ) ? (
                          selectedMedia.endsWith(".mp4?alt=media") ? (
                            <video
                              src={selectedMedia}
                              controls
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                            />
                          ) : (
                            <img
                              src={selectedMedia}
                              alt="Media"
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                            />
                          )
                        ) : null}
                      </div>

                      {/* Ảnh/video nhỏ */}
                      <div className="flex gap-4 flex-wrap justify-center mt-4">
                        {" "}
                        {/* Giữ cho các ảnh nhỏ xếp dưới ảnh lớn */}
                        {selectedToyBan.media.map((media, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            {/* Hiển thị video nếu media là video */}
                            {media.mediaUrl.endsWith(".mp4?alt=media") ? (
                              <video
                                src={media.mediaUrl}
                                alt={`Video ${index + 1}`}
                                className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-transform duration-200 
                ${
                  selectedMedia === media.mediaUrl
                    ? "border-orange-500 scale-105"
                    : "border-gray-300"
                }`}
                                onClick={() => setSelectedMedia(media.mediaUrl)} // Cập nhật media khi chọn video
                              />
                            ) : (
                              // Hiển thị ảnh nếu media là ảnh
                              <img
                                src={media.mediaUrl}
                                alt={`Hình ảnh ${index + 1}`}
                                className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-transform duration-200 
                ${
                  selectedMedia === media.mediaUrl
                    ? "border-orange-500 scale-105"
                    : "border-gray-300"
                }`}
                                onClick={() => setSelectedMedia(media.mediaUrl)} // Cập nhật media khi chọn ảnh
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Phần thông tin */}
                    <div className="flex-1 text-sm space-y-6">
                      <h2 className="text-4xl font-bold mb-10 text-center">
                        Thông tin đồ chơi
                      </h2>
                      <p className="text-lg">
                        <strong>Tên đồ chơi:</strong> {selectedToyBan.name}
                      </p>
                      <p className="text-lg">
                        <strong>Giá:</strong>{" "}
                        {(selectedToyBan.price || 0).toLocaleString()} VNĐ
                      </p>
                      <p className="text-lg">
                        <strong>Xuất xứ:</strong> {selectedToyBan.origin}
                      </p>
                      <p className="text-lg">
                        <strong>Tuổi:</strong> {selectedToyBan.age}
                      </p>

                      <p className="text-lg">
                        <strong>Thương Hiệu:</strong> {selectedToyBan.brand}
                      </p>
                      <p className="text-lg">
                        <strong>Danh mục:</strong>{" "}
                        {selectedToyBan.category.name}
                      </p>
                      <p className="text-lg">
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(
                          selectedToyBan.createDate
                        ).toLocaleDateString()}
                      </p>

                      <p className="text-lg">
                        <strong>Trạng thái:</strong>{" "}
                        {statusMapping[selectedToyBan.status] ||
                          "Trạng thái không xác định"}
                      </p>
                      {/* <p className=" space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation(); // Ngăn sự kiện lan truyền lên <tr>
                            handleUnBan(selectedToyBan.id); // Gọi hàm handleDelete
                          }}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                        >
                          Bỏ lệnh cấm
                        </button>
                      </p> */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "User":
        return (
          <div>
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
                        {currentToys4 &&
                        Array.isArray(currentToys4) &&
                        currentToys4.length > 0 ? (
                          currentToys4.map((user) => (
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
                                    <span></span>
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

            <div className="sticky bottom-0 right-0 flex justify-end w-full p-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevious4}
                  disabled={currentPageData3 === 1}
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData3 === 1
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Trang {currentPageData3} /{" "}
                  {Math.ceil(userUpData.length / itemsPerPage)}
                </span>
                <button
                  onClick={handleNext4}
                  disabled={
                    currentPageData3 ===
                    Math.ceil(userUpData.length / itemsPerPage)
                  }
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData3 ===
                    Math.ceil(userUpData.length / itemsPerPage)
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
                          <span></span>
                        )}
                      </div>
                    </div>

                    {/* Phần thông tin */}
                    <div className="flex-1 text-sm space-y-6">
                      <h2 className="text-4xl font-bold mb-10 text-center">
                        Thông tin người dùng
                      </h2>
                      <p className="text-lg">
                        <strong>Tên người dùng:</strong>{" "}
                        {selectedUserUp.fullName}
                      </p>
                      <p className="text-lg">
                        <strong>Email:</strong> {selectedUserUp.email}
                      </p>
                      <p className="text-lg">
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(
                          selectedUserUp.createDate
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-lg">
                        <strong>Số điện thoại:</strong> {selectedUserUp.phone}
                      </p>

                      <p className="text-lg">
                        <strong>Ngày sinh:</strong>{" "}
                        {new Date(selectedUserUp.dob).toLocaleDateString()}
                      </p>
                      <p className="text-lg">
                        <strong>Địa chỉ:</strong>
                        {selectedUserUp.address}
                      </p>
                      <p className="text-lg">
                        <strong>Vai trò:</strong> {selectedUserUp.role.name}
                      </p>

                      <p className="text-lg">
                        <strong>Trạng thái:</strong>{" "}
                        {statusMapping[selectedUserUp.status] ||
                          "Trạng thái không xác định"}
                      </p>
                      {/* <p className=" space-x-2 whitespace-nowrap">
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
                      </p> */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "UserBan":
        return (
          <div>
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
                        {currentToys5 &&
                        Array.isArray(currentToys5) &&
                        currentToys5.length > 0 ? (
                          currentToys5.map((user) => (
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
                                    <span></span>
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
                                    setSelectedUserUpBan(user); // Lưu thông tin toy vào state
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

            <div className="sticky bottom-0 right-0 flex justify-end w-full p-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevious5}
                  disabled={currentPageData4 === 1}
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData4 === 1
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Trang {currentPageData4} /{" "}
                  {Math.ceil(userUpBanData.length / itemsPerPage)}
                </span>
                <button
                  onClick={handleNext5}
                  disabled={
                    currentPageData4 ===
                    Math.ceil(userUpBanData.length / itemsPerPage)
                  }
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg ${
                    currentPageData4 ===
                    Math.ceil(userUpBanData.length / itemsPerPage)
                      ? "bg-gray-300"
                      : "bg-blue-500 hover:bg-red-500"
                  }`}
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
            {selectedUserUpBan && !isEditing && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center  z-[1000]">
                <div className="bg-white p-16 rounded-2xl shadow-2xl max-w-7xl w-full h-auto overflow-auto relative z-[1010]">
                  {/* Nút đóng ở góc phải */}
                  <button
                    type="button"
                    onClick={() => setSelectedUserUpBan(null)} // Đóng chi tiết khi bấm nút
                    className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>

                  <div className="flex flex-wrap lg:flex-nowrap gap-10">
                    {/* Phần hình ảnh */}
                    <div className="flex-1 flex justify-center items-center flex-col max-w-md mx-auto mt-20">
                      {/* Hiển thị ảnh hoặc video */}
                      <div className="w-auto h-auto">
                        {selectedUserUpBan.avatarUrl &&
                        selectedUserUpBan.avatarUrl.length > 0 ? (
                          <img
                            src={selectedUserUpBan.avatarUrl}
                            alt="User-Avatar"
                            className="w-full max-w-[70%] h-auto object-contain"
                          />
                        ) : (
                          <span></span>
                        )}
                      </div>
                    </div>

                    {/* Phần thông tin */}
                    <div className="flex-1 text-sm space-y-6">
                      <h2 className="text-4xl font-bold mb-10 text-center">
                        Thông tin người dùng
                      </h2>
                      <p className="text-lg">
                        <strong>Tên người dùng:</strong>{" "}
                        {selectedUserUpBan.fullName}
                      </p>
                      <p className="text-lg">
                        <strong>Email:</strong> {selectedUserUpBan.email}
                      </p>
                      <p className="text-lg">
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(
                          selectedUserUpBan.createDate
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-lg">
                        <strong>Số điện thoại:</strong>{" "}
                        {selectedUserUpBan.phone}
                      </p>

                      <p className="text-lg">
                        <strong>Ngày sinh:</strong>{" "}
                        {new Date(selectedUserUpBan.dob).toLocaleDateString()}
                      </p>
                      <p className="text-lg">
                        <strong>Địa chỉ:</strong>
                        {selectedUserUpBan.address}
                      </p>
                      <p className="text-lg">
                        <strong>Vai trò:</strong> {selectedUserUpBan.role.name}
                      </p>

                      <p className="text-lg">
                        <strong>Trạng thái:</strong>{" "}
                        {statusMapping[selectedUserUpBan.status] ||
                          "Trạng thái không xác định"}
                      </p>
                      {/* <p className=" space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation(); // Ngăn sự kiện lan truyền lên <tr>
                            handleUserUnBan(selectedUserUpBan.id); // Gọi hàm handleDelete
                          }}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                        >
                          Bỏ lệnh cấm
                        </button>
                      </p> */}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
          zIndex: 20,
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
              onClick={() => setSelectedTab("info")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "info" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">👤</span> Thông tin cá nhân
            </button>

            <button
              onClick={() => setSelectedTab("products")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "products" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">📦</span> Danh sách sản phẩm đợi
              duyệt
            </button>

            <button
              onClick={() => setSelectedTab("ToyRent")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "ToyRent" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">📦</span> Danh sách sản phẩm chờ
              thuê
            </button>

            <button
              onClick={() => setSelectedTab("ToyBuy")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "ToyBuy" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">📦</span> Danh sách sản phẩm bán
            </button>
            <button
              onClick={() => setSelectedTab("ToyBan")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "ToyBan" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">📦 🚫</span> Danh sách sản phẩm
              bị cấm
            </button>
            <button
              onClick={() => setSelectedTab("User")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "User" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">👥</span> Danh sách người dùng
            </button>
            <button
              onClick={() => setSelectedTab("UserBan")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "UserBan" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">👥 🚫</span> Danh sách người
              dùng bị cấm
            </button>
            <button
              onClick={() => setSelectedTab("Status")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "Status" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🧾</span> Danh sách đơn hàng
              đang chờ trả
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
      <ChatForm />
      <footer className="bg-white shadow-md p-4">
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default StaffPage;
