import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import thư viện Cookies
import HeaderForToySupplier from "../../Component/HeaderForToySupplier/HeaderForToySupplier";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";
import apiOrderDetail from "../../service/ApiOrderDetail";
import apiOrder from "../../service/ApiOrder";
import apiToys from "../../service/ApiToys";
import apiCategory from "../../service/ApiCategory";
import apiMedia from "../../service/ApiMedia";
import apiUser from "../../service/ApiUser";
import apiWallets from "../../service/ApiWallets";
import apiWalletTransaction from "../../service/ApiWalletTransaction";
const ToySupplierPage = () => {
  const [userData, setUserData] = useState("");
  const [selectedTab, setSelectedTab] = useState("info");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toys, setToys] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [toyId, setToyId] = useState(null); // Lưu URL ảnh để hiển thị
  const [toyData, setToyData] = useState(null);
  const [toysData, setToysData] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [selectedToy, setSelectedToy] = useState(null);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState([]); // State lưu video
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [orders, setOrders] = useState([]); // State để lưu trữ danh sách đơn hàng
  const [loading, setLoading] = useState(true); // State để quản lý trạng thái tải dữ liệu
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [toyForDetails, setToyForDetail] = useState([]);
  const [status, setStatus] = useState(""); // Initialize state
  const [walletInfo, setWalletInfo] = useState({});
  const [walletTransaction, setWalletTransaction] = useState({});
  const [validOrderDetails, setValidOrderDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 5; // Số mục trên mỗi trang
  const [searchKeyword, setSearchKeyword] = useState(""); // Lưu từ khóa tìm kiếm
  const [mediaList, setMediaList] = useState([]); // Lưu danh sách media (ảnh + video)
  useEffect(() => {
    const userDataCookie = Cookies.get("userData");
    if (userDataCookie) {
      const parsedUserData = JSON.parse(userDataCookie);
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
            // Lấy danh sách đồ chơi của người dùng
            const toyResponse = await apiToys.get(
              `/user/${user.id}?pageIndex=1&pageSize=5`,
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            );

            console.log("Dữ liệu đồ chơi của người dùng:", toyResponse.data);

            // Cập nhật dữ liệu đồ chơi (nếu cần thiết)
            setToysData(toyResponse.data);
            // Lấy thông tin ví của người dùng từ walletId
            const walletResponse = await apiWallets.get(
              `/${user.walletId}` // Sử dụng user.walletId thay vì userResponse.walletId
            );
            console.log("Dữ liệu ví của người dùng:", walletResponse.data);
            setWalletInfo(walletResponse.data);

            const walletTransaction = await apiWalletTransaction.get(
              `/ByWalletId?walletId=${user.walletId}&pageIndex=1&pageSize=100`
            );
            setWalletTransaction(walletTransaction.data);
            console.log("Dữ liệu giao dịch trong vi:", walletTransaction.data);
          } else {
            console.error("Không tìm thấy thông tin người dùng.");
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu:", error);
        }
      };
      loadCategories();
      fetchUserData();
    } else {
      console.error("Không tìm thấy thông tin người dùng trong cookie.");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      console.log("Gọi LoadToy với userId:", userId);
      LoadToy(userId);

      LoadOrderShop(userId, "");
    } else {
      console.warn("userId chưa được thiết lập.");
    }
  }, [userId]);

  // Khi dữ liệu `selectedToy` được tải xong, bạn có thể sử dụng ảnh/video đầu tiên trong media làm mặc định
  useEffect(() => {
    if (selectedToy && selectedToy.media && selectedToy.media.length > 0) {
      setSelectedMedia(selectedToy.media[0].mediaUrl); // Đặt ảnh/video đầu tiên làm mặc định
    }
  }, [selectedToy]);

  useEffect(() => {
    if (selectedToy) {
      setMediaList(selectedToy.media || []); // Lưu danh sách media từ sản phẩm
    }
  }, [selectedToy]);

  // Hàm load đồ chơi theo userId
  const LoadToy = async (userId, pageIndex = 1, pageSize = 5) => {
    if (!userId) {
      console.error("Không tìm thấy userId để tải đồ chơi.");
      return;
    }
    try {
      const toyResponse = await apiToys.get(
        `/user/${userId}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      console.log(
        `Dữ liệu đồ chơi của người dùng tại trang ${pageIndex}:`,
        toyResponse.data
      );

      // Cập nhật dữ liệu đồ chơi
      setToysData(toyResponse.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đồ chơi:", error);
    }
  };
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
      LoadToy(userId, currentPage - 1, itemsPerPage);
    }
  };
  const handleNext = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    LoadToy(userId, currentPage + 1, itemsPerPage);
  };
  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value); // Cập nhật từ khóa khi nhập
  };
  const handleSearch = async (e) => {
    e.preventDefault(); // Ngăn form reload
    try {
      const response = await apiToys.get(
        `/user/${userId}?name=${searchKeyword}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );
      setToysData(response.data); // Cập nhật danh sách đồ chơi sau khi tìm kiếm
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  const LoadOrderShop = async (userId, statusFilter) => {
    if (!userId || userId <= 0) {
      console.error("userId không hợp lệ:", userId);
      alert("Không thể tải danh sách đơn hàng. Vui lòng đăng nhập lại.");
      return;
    }

    const userToken = Cookies.get("userToken");
    if (!userToken) {
      alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      // Lấy danh sách đơn hàng với trạng thái lọc (nếu có)
      const OrderResponse = await apiOrder.get(
        `/ByShop?shopId=${userId}&pageIndex=1&pageSize=20000&status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const orders = OrderResponse.data;

      // Kiểm tra nếu có đơn hàng trả về
      if (orders && Array.isArray(orders) && orders.length > 0) {
        // Cập nhật state hoặc xử lý dữ liệu đơn hàng tại đây
        // Ví dụ: setOrders(orders); hoặc một số thao tác khác để cập nhật giao diện
        setOrders(orders); // Cập nhật danh sách đơn hàng
        console.log("Danh sách đơn hàng:", orders);
      } else {
        console.log("Không có đơn hàng nào với trạng thái đã chọn.");
        // Nếu không có đơn hàng nào, bạn có thể thông báo cho người dùng
        alert("Không có đơn hàng nào với trạng thái đã chọn.");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      alert("Có lỗi xảy ra khi tải danh sách đơn hàng.");
    }
  };

  // Hàm mở chi tiết đơn hàng
  const openOrderDetail = async (orderId) => {
    const userToken = Cookies.get("userToken");
    if (!userToken) {
      alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      // Gọi API để lấy chi tiết đơn hàng
      const orderDetailsResponse = await apiOrderDetail.get(
        `/Order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const orderDetails = orderDetailsResponse.data;
      console.log(`Chi tiết đơn hàng ${orderId}:`, orderDetails);

      // Kiểm tra dữ liệu chi tiết đơn hàng trước khi cập nhật state
      if (orderDetails && orderDetails.length > 0) {
        // Cập nhật chi tiết vào state nếu có
        setSelectedOrderDetail(orderDetails);
        console.log("Chi tiết đơn hàng:", orderDetails);
      } else {
        console.error(`Đơn hàng ${orderId} không có chi tiết.`);
      }
    } catch (error) {
      console.error(`Lỗi khi tải chi tiết đơn hàng ${orderId}:`, error);
    }
  };
  const handleStatusChange = (statusValue) => {
    setStatus(statusValue); // Cập nhật trạng thái
    LoadOrderShop(userId, statusValue); // Gọi lại LoadOrderShop với trạng thái đã chọn
  };
  // Hàm load category từ API
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

  const handleUpdate = async () => {
    // Kiểm tra các điều kiện

    const phoneRegex = /^0\d{9}$/; // Cập nhật regex cho số điện thoại
    if (!phoneRegex.test(editedData.phone || "")) {
      console.error(
        "Số điện thoại không hợp lệ: Phải bắt đầu bằng số 0 và có đúng 10 chữ số"
      );
      alert(
        "Số điện thoại không hợp lệ: Phải bắt đầu bằng số 0 và có đúng 10 chữ số"
      );
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
  const handleUpdatePassword = async () => {
    // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
    if (editedData.newPassword !== editedData.confirmPassword) {
      alert(
        "Mật khẩu mới và xác nhận mật khẩu không khớp. Vui lòng kiểm tra lại."
      );
      return;
    }
    try {
      // Bước 1: Lấy thông tin người dùng bao gồm mật khẩu cũ
      const userResponse = await apiUser.get(`/${userId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      // Kiểm tra mật khẩu cũ có khớp không
      if (userResponse.data.password !== editedData.currentPassword) {
        alert("Mật khẩu cũ không đúng. Vui lòng thử lại.");
        return;
      }
      // Kiểm tra độ mạnh của mật khẩu mới
      if (passwordStrength !== "Mạnh") {
        alert("Mật khẩu mới phải đủ mạnh. Vui lòng thử lại.");
        return;
      }

      // Tạo formData để gửi các dữ liệu cập nhật
      const formData = new FormData();
      formData.append("fullName", editedData.fullName || "Default Name");
      formData.append("email", editedData.email || "default@example.com");
      formData.append("password", editedData.newPassword || "defaultPassword");
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

      // Bước 2: Gửi yêu cầu PUT để cập nhật thông tin người dùng
      const response = await apiUser.put(`/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Xử lý phản hồi thành công
      console.log("Cập nhật thành công:", response.data);
      setUserData(response.data);
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      // Xử lý lỗi khi gọi API
      console.error("Lỗi khi đổi mật khẩu:", error);
      alert("Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại.");
    }
  };
  // Hàm xử lý thay đổi tệp ảnh
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

  const [mediaFiles, setMediaFiles] = useState([]);
  // Hàm xử lý khi người dùng chọn file
  const handleFileChange1 = (e) => {
    const files = e.target.files;
    const selectedFiles = [];
    for (let i = 0; i < files.length; i++) {
      selectedFiles.push(files[i]);
    }
    setMediaFiles(selectedFiles); // Lưu file vào state
  };
  // Hàm để gửi ảnh lên API
  const handleUpdateToy = async () => {
    const toyId = selectedToy?.id;

    if (!toyId) {
      console.error("Không tìm thấy toyId.");
      return;
    }

    try {
      const updatedToy = {
        name: selectedToy.name || "Default Toy Name",
        description: selectedToy.description || "Default Description",
        price: selectedToy.price || "0",
        buyQuantity: selectedToy.buyQuantity || "0",
        origin: selectedToy.origin || "Default Origin",
        age: selectedToy.age || "All Ages",
        brand: selectedToy.brand || "Default Brand",
        categoryId: selectedCategory || "1",
        rentCount: selectedToy.rentCount || "0",
        rentTime: selectedToy.rentTime || "Default Rent Time",
      };

      console.log("Dữ liệu gửi đi:", updatedToy);

      // Gửi PUT request để cập nhật thông tin sản phẩm
      const response = await apiToys.put(`/${toyId}`, updatedToy, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Cập nhật toy thành công:", response.data);
      setToyData(response.data);

      // Cập nhật hình ảnh/video nếu có
      if (mediaFiles.length > 0) {
        const mediaData = new FormData();
        mediaFiles.forEach((file) => {
          mediaData.append("mediaUrls", file); // Đảm bảo tên key đúng với yêu cầu API
        });

        try {
          const uploadResponse = await apiMedia.put(
            `/update-toy-media/${toyId}`,
            mediaData,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log(
            "Hình ảnh và video đã được cập nhật:",
            uploadResponse.data
          );
          alert("Sản phẩm và hình ảnh đã được cập nhật thành công!");
        } catch (uploadError) {
          console.error("Lỗi khi cập nhật hình ảnh:", uploadError);
          alert("Sản phẩm đã được cập nhật nhưng không thể cập nhật hình ảnh!");
        }
      } else {
        console.log("Không có ảnh hoặc video nào được chọn.");
      }

      setIsEditing(false);
      setSelectedToy(null); // Đảm bảo khi cancel không mở lại chi tiết
      LoadToy(userId); // Tải lại dữ liệu nếu cần
    } catch (error) {
      console.error("Lỗi khi cập nhật toy:", error);
      alert("Đã xảy ra lỗi khi cập nhật sản phẩm!");
    }
  };

  const handleDelete = async (toyId) => {
    console.log("toyId: ", toyId);

    if (!toyId) {
      console.error("Không có toyId");
      return;
    }

    try {
      const Toyresponse = await apiToys.get(`/${toyId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      console.log("Dữ liệu trả về từ API: ", Toyresponse.data);

      const isConfirmed = window.confirm(
        "Bạn có chắc chắn muốn xóa món đồ này không?"
      );

      if (!isConfirmed) {
        console.log("Người dùng đã hủy bỏ.");
        return;
      }

      const updatedToy = {
        name: Toyresponse.data.name || "Default Toy Name",
        description: Toyresponse.data.description || "Default Description",
        price: Toyresponse.data.price || "0",
        buyQuantity: Toyresponse.data.buyQuantity || "0",
        origin: Toyresponse.data.origin || "Default Origin",
        age: Toyresponse.data.age || "All Ages",
        brand: Toyresponse.data.brand || "Default Brand",
        categoryId: Toyresponse.data.categoryId || "1",
        rentCount: Toyresponse.data.rentCount || "0",
        rentTime: Toyresponse.data.rentTime || "Default Rent Time",
        status: "Inactive", // Gửi status "Inactive" khi role == 2
      };

      console.log("Dữ liệu gửi đi trước khi xóa:", updatedToy);

      const response = await apiToys.put(`/${toyId}`, updatedToy, {
        Authorization: `Bearer ${Cookies.get("userToken")}`,
        "Content-Type": "application/json",
      });

      console.log("Dữ liệu trả về sau khi xóa:", response.data);
      setToyData(response.data);

      // Tải lại dữ liệu món đồ chơi nếu cần
      LoadToy(userId);
    } catch (error) {
      console.error("Lỗi khi cập nhật toy:", error);
    }
  };
  // Hàm mở modal và thiết lập ID toy cần xóa

  const handleEditClick = () => {
    setEditedData(userData);
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(userData); // Đặt lại dữ liệu về ban đầu
  };

  const checkPasswordStrength = (password) => {
    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&]/.test(password)
    ) {
      setPasswordStrength("Mạnh");
    } else if (password.length >= 6) {
      setPasswordStrength("Trung bình");
    } else {
      setPasswordStrength("Yếu");
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };
  const handleSubmit = async () => {
    // Thu thập thông tin từ form

    const formData = {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      price: parseFloat(document.getElementById("price").value),
      buyQuantity: parseFloat(document.getElementById("buyQuantity").value), // Lấy số lượng từ input
      origin: document.getElementById("origin").value,
      age: document.getElementById("age").value, // Lấy giá trị từ <select>
      brand: document.getElementById("brand").value,
      categoryId: selectedCategory, // Lấy categoryId đã chọn
      rentCount: 0, // Giá trị mặc định
      rentTime: "0 Week",
    };
    console.log("Thống tin cơ bản:", formData);
    // Kiểm tra thông tin cơ bản
    if (!formData.name || !formData.price || !formData.origin) {
      alert("Vui lòng điền tên, giá và nguồn gốc!");
      return;
    }

    // Lấy các tệp hình ảnh và video từ input
    const imageInput = document.getElementById("mediaUpload");
    const files = imageInput.files;

    const imageFiles = [];
    let videoFile = null;

    // Kiểm tra các tệp tải lên và phân loại chúng thành hình ảnh và video
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        if (imageFiles.length < 5) {
          // Tối đa 5 hình ảnh
          imageFiles.push(file);
        } else {
          alert("Chỉ được tải lên tối đa 5 hình ảnh!");
          return;
        }
      } else if (file.type.startsWith("video/")) {
        if (!videoFile) {
          // Chỉ được tải lên 1 video
          videoFile = file;
        } else {
          alert("Chỉ được tải lên 1 video!");
          return;
        }
      }
    }

    // Chỉ gửi dữ liệu hình ảnh hoặc video nếu có tệp được chọn
    if (imageFiles.length === 0 && !videoFile) {
      alert("Vui lòng tải lên ít nhất một hình ảnh hoặc video!");
      return;
    }

    try {
      const token = Cookies.get("userToken"); // Lấy token từ cookie
      console.log("Token được gửi:", token);

      // Gửi yêu cầu tạo sản phẩm
      const response = await apiToys.post("", formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });

      const newToy = response.data;
      const toyId = newToy.id;
      console.log("Sản phẩm đã tạo:", newToy);

      // Gửi các hình ảnh và video lên server nếu có
      const mediaData = new FormData();
      imageFiles.forEach((image) => {
        mediaData.append("mediaUrls", image); // Thêm mỗi hình ảnh vào FormData
      });
      if (videoFile) {
        mediaData.append("mediaUrls", videoFile); // Thêm video vào FormData nếu có
      }

      // Gửi yêu cầu tải lên hình ảnh và video
      try {
        const uploadResponse = await apiMedia.post(
          `/upload-toy-media/${toyId}`, // Đảm bảo đường dẫn đúng
          mediaData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Hình ảnh và video đã được tạo:", uploadResponse.data);
        alert("Sản phẩm, hình ảnh và video đã được thêm thành công!");
      } catch (uploadError) {
        console.error("Đã xảy ra lỗi khi tạo hình ảnh và video:", uploadError);
        alert("Sản phẩm đã được thêm nhưng không thể tạo hình ảnh và video!");
      }

      setIsCardVisible(false); // Ẩn card sau khi thêm thành công
      // Cập nhật danh sách sản phẩm
      LoadToy(userId);
    } catch (error) {
      console.error("Đã xảy ra lỗi khi thêm sản phẩm:", error);
      alert("Đã xảy ra lỗi khi thêm sản phẩm!");
    }
  };
  const handleFileUpload = (e) => {
    const files = e.target.files;
    const imageFiles = [];
    let videoFile = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Kiểm tra nếu là hình ảnh
      if (file.type.startsWith("image/")) {
        if (imageFiles.length < 5) {
          // Tối đa 5 hình ảnh
          imageFiles.push(file);
        } else {
          alert("Chỉ được tải lên tối đa 5 hình ảnh!");
          return;
        }
      }
      // Kiểm tra nếu là video
      else if (file.type.startsWith("video/")) {
        if (!videoFile) {
          // Chỉ được tải lên 1 video
          videoFile = file;
        } else {
          alert("Chỉ được tải lên 1 video!");
          return;
        }
      }
    }

    // Sau khi đã kiểm tra và phân loại, bạn có thể lưu các tệp vào state hoặc gửi chúng lên server
    console.log("Hình ảnh:", imageFiles);
    console.log("Video:", videoFile);

    // Tiếp theo, bạn có thể xử lý các tệp này như muốn, ví dụ như thêm vào FormData để gửi lên server
  };

  const handleCompleteOrder = async (orderId) => {
    const userToken = Cookies.get("userToken");

    if (!userToken) {
      alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    // Tìm đơn hàng cần cập nhật
    const orderToUpdate = orders.find((order) => order.id === orderId);
    console.log("Đơn hàng cần cập nhật:", orderToUpdate);
    if (!orderToUpdate) {
      alert("Không tìm thấy đơn hàng.");
      return;
    }

    try {
      // 1. Lấy thông tin người dùng từ đơn hàng
      const userResponse = await apiUser.get(`/${orderToUpdate.userId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
        },
      });
      const user = userResponse.data;
      console.log("Nguoi dung mua hàng:", user);

      // 3. Lấy thông tin ví của chủ sở hữu đồ chơi
      const ownerWalletResponse = await apiWallets.get(
        `/${orderToUpdate.shopId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      const ownerWallet = ownerWalletResponse.data;
      console.log("Dữ liệu ví chủ sở hữu trước khi cập nhật:", ownerWallet);

      const toyDetails = orderToUpdate.toyDetails; // hoặc cách khác nếu toyDetails nằm ở nơi khác
      console.log("toyDetails bắt từ toyid:", toyDetails);
      if (!toyDetails || !toyDetails.price) {
        console.error("Không có thông tin giá trị từ toyDetails.");
        return;
      }

      // Tính toán số tiền chủ sở hữu nhận được (giả sử là 85% giá trị của toyDetails.price)
      const amountToAdd = toyDetails.price * 0.85;

      // Chỉ cập nhật trường balance
      const updatedWallet = {
        ...ownerWallet,
        balance: ownerWallet.balance + amountToAdd,
      };
      console.log("Dữ liệu ví chủ sở hữu trước khi cập nhật:", amountToAdd);
      console.log("Dữ liệu ví chủ sở hữu sau khi cập nhật:", updatedWallet);

      // Gửi yêu cầu PUT để cập nhật ví
      const ownerWalletUpDate = await apiWallets.put(
        `/${ownerWallet.id}`,
        updatedWallet,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      // Log toàn bộ phản hồi từ server
      console.log("Phản hồi từ server sau khi gửi PUT:", ownerWalletUpDate);
      console.log("Dữ liệu trả về từ server:", ownerWalletUpDate.data);
      console.log("Mã trạng thái trả về từ server:", ownerWalletUpDate.status);

      // 1. Log dữ liệu trước khi gửi yêu cầu tạo giao dịch ví
      console.log("Gửi yêu cầu tạo giao dịch ví:", {
        transactionType: "Nhận tiền từ đơn hàng",
        amount: amountToAdd,
        date: new Date().toISOString(),
        walletId: ownerWallet.id,
        paymentTypeId: 5,
        orderId: orderToUpdate.id,
      });

      const walletTransactionResponse = await apiWalletTransaction.post(
        "",
        {
          transactionType: "Nhận tiền từ đơn hàng",
          amount: amountToAdd,
          date: new Date().toISOString(),
          walletId: ownerWallet.id,
          paymentTypeId: 5,
          orderId: orderToUpdate.id,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      // 2. Log dữ liệu sau khi hoàn thành yêu cầu tạo giao dịch ví
      console.log(
        "Phản hồi từ yêu cầu tạo giao dịch ví:",
        walletTransactionResponse.data
      );

      // 3. Log dữ liệu trước khi gửi yêu cầu cập nhật trạng thái đơn hàng
      console.log("Gửi yêu cầu cập nhật trạng thái đơn hàng:", {
        ...orderToUpdate,
        status: "Complete",
      });

      // Gửi yêu cầu PUT để cập nhật trạng thái đơn hàng
      const orderUpdateResponse = await apiOrder.put(
        `/${orderToUpdate.id}`,
        { ...orderToUpdate, status: "Complete" },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      // 4. Log dữ liệu sau khi hoàn thành yêu cầu cập nhật trạng thái đơn hàng
      console.log(
        "Phản hồi từ yêu cầu cập nhật trạng thái đơn hàng:",
        orderUpdateResponse.data
      );

      // 5. Làm mới giao diện
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === orderId ? { ...o, status: "Complete" } : o
        )
      );
      alert("Đơn hàng đã được hoàn tất.");
    } catch (error) {
      console.error("Lỗi khi hoàn tất đơn hàng:", error);
      alert("Đã xảy ra lỗi khi xử lý đơn hàng.");
    }
  };

  const statusMapping = {
    Delivering: "Đang giao",
    Complete: "Hoàn thành",
    Active: "Sẵn sàng",
    Inactive: "Không sẵn sàng",
    // Các trạng thái khác nếu có
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
      case "password":
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Đổi Mật Khẩu
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Thay đổi mật khẩu để bảo mật tài khoản của bạn
            </p>

            <div className="flex mt-6">
              <div className="w-2/3 pr-6">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium">
                    <p>Xin chào {userData.fullName || userData.name}</p>
                  </label>
                </div>

                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none"
                >
                  Đổi mật khẩu
                </button>
              </div>
              {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>

                    {/* Form đổi mật khẩu */}
                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                        {/* Input mật khẩu */}
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={editedData.currentPassword || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded pr-10" // padding-left để tạo không gian cho icon bên trái
                        />
                        {/* Biểu tượng con mắt */}
                        <button
                          type="button"
                          onClick={() => toggleShowPassword("current")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.current ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        {/* Input mật khẩu */}
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={editedData.newPassword || ""}
                          onChange={(e) => {
                            setEditedData({
                              ...editedData,
                              newPassword: e.target.value,
                            });
                            checkPasswordStrength(e.target.value);
                          }}
                          className="w-full p-2 border border-gray-300 rounded pr-10" // padding-left để tạo không gian cho icon bên trái
                        />
                        {/* Biểu tượng con mắt */}
                        <button
                          type="button"
                          onClick={() => toggleShowPassword("new")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.new ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Mật khẩu nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
                        thường, số và ký tự đặc biệt như @, $, hoặc !
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        {/* Input mật khẩu */}
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={editedData.confirmPassword || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded pr-10" // padding-left để tạo không gian cho icon bên trái
                        />
                        {/* Biểu tượng con mắt */}
                        <button
                          type="button"
                          onClick={() => toggleShowPassword("confirm")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPasswords.confirm ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdatePassword}
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              )}
              ;
            </div>
          </div>
        );
      case "orders":
        return (
          <div className="container mx-auto py-4">
            <h2 className="text-2xl font-semibold">Danh sách đơn hàng</h2>
            {/* Thẻ chọn trạng thái */}
            <div className="flex space-x-4 mt-2">
              <button
                className={`px-4 py-2 border rounded-md transition-all duration-200 ${
                  status === ""
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleStatusChange("")} // Truyền giá trị vào hàm
              >
                Tất cả
              </button>
              <button
                className={`px-4 py-2 border rounded-md transition-all duration-200 ${
                  status === "Delivering"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleStatusChange("Delivering")}
              >
                Đang giao
              </button>
              <button
                className={`px-4 py-2 border rounded-md transition-all duration-200 ${
                  status === "Complete"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleStatusChange("Complete")}
              >
                Hoàn thành
              </button>
            </div>
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden mt-4"
              >
                <div className="flex items-center p-4 border-b">
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold">
                      <strong>Người đặt hàng:</strong> {order.userName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <strong>Địa chỉ nhận:</strong> {order.receiveAddress}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Số điện thoại:</strong> {order.receivePhone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong> Ngày đặt hàng:</strong>{" "}
                      {/* {order.receiveDate.toISOString().split("T")[0]} */}
                      {new Date(order.orderDate).toISOString().split("T")[0]}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <h1 className="text-lg font-bold text-gray-600">
                      {statusMapping[order.status] ||
                        "Trạng thái không xác định"}
                    </h1>
                    <p className="text-lg font-semibold">
                      <strong>Tổng tiền:</strong>{" "}
                      {(order.totalPrice || 0).toLocaleString()} VNĐ
                    </p>
                  </div>
                </div>
                <div className="flex justify-between p-4">
                  <div className="ml-auto flex gap-4">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                      onClick={() => openOrderDetail(order.id)}
                    >
                      Xem chi tiết
                    </button>
                    {order.status !== "Complete" && (
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        onClick={() => handleCompleteOrder(order.id)}
                      >
                        Hoàn Thành
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Hiển thị chi tiết đơn hàng nếu có đơn hàng được chọn */}
            {selectedOrderDetail && selectedOrderDetail.length > 0 && (
              // Overlay mờ
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                {/* Card */}
                <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
                  <h2 className="text-2xl font-semibold mb-4 text-center">
                    Chi tiết đơn hàng
                  </h2>
                  <div className="space-y-4">
                    {selectedOrderDetail.map((orderDetail, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-md shadow-sm border flex gap-4 items-start"
                      >
                        {/* Hình ảnh bên trái */}
                        <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-md mt-5">
                          <img
                            src={
                              orderDetail.toyImgUrls?.[0] ||
                              "default_image_url_here"
                            }
                            alt={`Ảnh đồ chơi cho đơn hàng ${orderDetail.id}`}
                            className="object-cover w-full h-full rounded-md"
                          />
                        </div>
                        {/* Thông tin bên phải */}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Đơn hàng #{orderDetail.id}
                          </h3>
                          <p className="text-sm text-gray-700">
                            <strong>Tên đồ chơi:</strong> {orderDetail.toyName}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Giá cọc:</strong>{" "}
                            {(orderDetail.unitPrice || 0).toLocaleString()} VNĐ
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Giá thuê:</strong>{" "}
                            {(orderDetail.rentPrice || 0).toLocaleString()} VNĐ
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Ngày mua:</strong>{" "}
                            {orderDetail.startDate
                              ? new Date(orderDetail.startDate)
                                  .toISOString()
                                  .split("T")[0]
                              : "Đang chờ"}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Trạng thái:</strong>{" "}
                            {statusMapping[orderDetail.status] ||
                              "Trạng thái không xác định"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedOrderDetail(null)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case "products":
        return (
          <div>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
              <div className="w-full mb-1">
                <div className="items-center justify-between block sm:flex md:divide-x md:divide-gray-100 dark:divide-gray-700">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <form
                      className="sm:pr-3"
                      onSubmit={handleSearch} // Gọi hàm tìm kiếm khi submit
                    >
                      <label htmlFor="products-search" className="sr-only">
                        Search
                      </label>
                      <div className="relative w-48 mt-1 sm:w-64 xl:w-96">
                        <input
                          type="text"
                          id="products-search"
                          value={searchKeyword} // Liên kết với state
                          onChange={handleSearchChange} // Cập nhật từ khóa khi nhập
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Search for toys by name"
                        />
                      </div>
                    </form>
                  </div>
                  <div className="flex items-center mt-4 sm:mt-0 sm:ml-4">
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
                      Thêm sản phẩm
                    </button>
                    {/* Card popup */}
                    {isCardVisible && (
                      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white w-full max-w-3xl h-auto max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-8 relative">
                          <button
                            onClick={() => setIsCardVisible(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                          <h3 className="text-2xl font-bold mb-6 text-center">
                            Thêm Sản Phẩm
                          </h3>
                          <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <label className="block font-medium">
                                  Tên sản phẩm:
                                </label>
                                <input
                                  type="text"
                                  id="name"
                                  className="w-full border rounded-lg px-4 py-2"
                                />
                              </div>
                              <div>
                                <label className="block font-medium">
                                  Mô tả:
                                </label>
                                <textarea
                                  id="description"
                                  className="w-full border rounded-lg px-4 py-2"
                                />
                              </div>
                              <div>
                                <label className="block font-medium">
                                  Giá:
                                </label>
                                <input
                                  type="number"
                                  id="price"
                                  className="w-full border rounded-lg px-4 py-2"
                                />
                              </div>
                              <div>
                                <label className="block font-medium">
                                  Nguồn gốc:
                                </label>
                                <input
                                  type="text"
                                  id="origin"
                                  className="w-full border rounded-lg px-4 py-2"
                                />
                              </div>

                              <div>
                                <label className="block font-medium">
                                  Thương hiệu:
                                </label>
                                <input
                                  type="text"
                                  id="brand"
                                  className="w-full border rounded-lg px-4 py-2"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="age"
                                  className="block font-medium"
                                >
                                  Độ tuổi:
                                </label>
                                <select
                                  id="age"
                                  className="w-full border rounded-lg px-4 py-2"
                                >
                                  <option value="">All</option>
                                  <option value="1-3">1-3 Tuổi</option>
                                  <option value="3-5">3-5 Tuổi</option>
                                  <option value="5-7">5-7 Tuổi</option>
                                  <option value="7-9">7-9 Tuổi</option>
                                  <option value="9-11">9-11 Tuổi</option>
                                  <option value="11-13">11-13 Tuổi</option>
                                  <option value="13+">13+ Tuổi</option>
                                </select>
                              </div>
                              <div>
                                <label
                                  htmlFor="buyQuantity"
                                  className="block font-medium"
                                >
                                  Số lượng:
                                </label>
                                <input
                                  type="number"
                                  id="buyQuantity"
                                  className="w-full border rounded-lg px-4 py-2"
                                />
                              </div>
                              <div>
                                <label htmlFor="category">Danh mục:</label>
                                <select
                                  id="category"
                                  value={selectedCategory || ""}
                                  onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                  }
                                  required
                                  className="w-full border rounded-lg px-4 py-2"
                                >
                                  <option value="" disabled>
                                    Chọn danh mục
                                  </option>
                                  {categories.map((category) => (
                                    <option
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block font-medium">
                                  Chọn hình ảnh và video (Tối đa 5 hình ảnh và 1
                                  video):
                                </label>
                                <input
                                  type="file"
                                  id="mediaUpload"
                                  accept="image/*, video/*"
                                  multiple
                                  className="w-full border rounded-lg px-4 py-2"
                                  onChange={(e) => handleFileUpload(e)}
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleSubmit}
                              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
                            >
                              Thêm sản phẩm
                            </button>
                          </form>
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
                        {toysData &&
                        Array.isArray(toysData) &&
                        toysData.length > 0 ? (
                          toysData.map((toy) => (
                            <tr
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              key={toy.id}
                            >
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                  {toy.media && toy.media.length > 0 ? (
                                    toy.media.map((mediaItem, index) => (
                                      <img
                                        key={index}
                                        src={mediaItem.mediaUrl}
                                        alt={`Toy Media ${index + 1}`}
                                        className="w-full max-w-[50px] h-auto object-contain mr-2"
                                      />
                                    ))
                                  ) : (
                                    <span>No media available</span>
                                  )}
                                </div>
                              </td>

                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
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
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedToy(toy);
                                  }}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-900"
                                >
                                  Thông tin
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setIsEditing(true);
                                    setSelectedToy(toy);
                                  }}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                >
                                  Chỉnh sửa
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();

                                    handleDelete(toy.id); // Truyền toy.id vào hàm handleDelete
                                  }}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                                >
                                  Xoá
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="13" className="p-4 text-center">
                              No toys found.
                            </td>
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
            {selectedToy && !isEditing && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-16 rounded-2xl shadow-2xl max-w-7xl w-full h-[70%] overflow-auto relative">
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
                    <div className="flex-1 text-xl space-y-6">
                      <h2 className="text-4xl font-bold mb-10 text-center">
                        Thông tin đồ chơi
                      </h2>
                      <p>
                        <strong>Tên đồ chơi:</strong> {selectedToy.name}
                      </p>
                      <p>
                        <strong>Giá:</strong>{" "}
                        {(selectedToy.price || 0).toLocaleString()} VNĐ
                      </p>
                      <p>
                        <strong>Xuất xứ:</strong> {selectedToy.origin}
                      </p>
                      <p>
                        <strong>Tuổi:</strong> {selectedToy.age}
                      </p>

                      <p>
                        <strong>Thương Hiệu:</strong> {selectedToy.brand}
                      </p>
                      <p>
                        <strong>Danh mục:</strong> {selectedToy.category.name}
                      </p>
                      <p>
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(selectedToy.createDate).toLocaleDateString()}
                      </p>

                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        {statusMapping[selectedToy.status] ||
                          "Trạng thái không xác định"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto max-h-screen">
                  <h2 className="text-2xl font-bold mb-4 text-center">
                    Chỉnh sửa đồ chơi
                  </h2>
                  <form className="space-y-4">
                    {/* Tên */}
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-gray-700">
                        Tên
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={selectedToy.name}
                        onChange={(e) =>
                          setSelectedToy({
                            ...selectedToy,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Các trường khác */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mỗi trường được đặt trong div riêng */}
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-gray-700"
                        >
                          Miêu tả
                        </label>

                        <input
                          type="text"
                          id="description"
                          name="description"
                          className="w-full px-6 py-4 border border-gray-300 rounded"
                          value={selectedToy.description}
                          onChange={(e) =>
                            setSelectedToy({
                              ...selectedToy,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label htmlFor="price" className="block text-gray-700">
                          Giá
                        </label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={selectedToy.price}
                          onChange={(e) =>
                            setSelectedToy({
                              ...selectedToy,
                              price: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="buyQuantity"
                          className="block text-gray-700"
                        >
                          Số lượng
                        </label>
                        <input
                          type="number"
                          id="buyQuantity"
                          name="buyQuantity"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={selectedToy.buyQuantity}
                          onChange={(e) =>
                            setSelectedToy({
                              ...selectedToy,
                              buyQuantity: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label htmlFor="origin" className="block text-gray-700">
                          Nguồn gốc
                        </label>
                        <input
                          type="text"
                          id="origin"
                          name="origin"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={selectedToy.origin}
                          onChange={(e) =>
                            setSelectedToy({
                              ...selectedToy,
                              origin: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label htmlFor="age" className="block text-gray-700">
                          Tuổi
                        </label>
                        <select
                          id="age"
                          name="age"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={selectedToy.age || ""} // Gán giá trị mặc định nếu không có
                          onChange={(e) =>
                            setSelectedToy({
                              ...selectedToy,
                              age: e.target.value,
                            })
                          }
                        >
                          <option value="">All</option>
                          <option value="1-3">1-3 Tuổi</option>
                          <option value="3-5">3-5 Tuổi</option>
                          <option value="5-7">5-7 Tuổi</option>
                          <option value="7-9">7-9 Tuổi</option>
                          <option value="9-11">9-11 Tuổi</option>
                          <option value="11-13">11-13 Tuổi</option>
                          <option value="13+">13+ Tuổi</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="category"
                          className="block text-gray-700"
                        >
                          Danh mục
                        </label>
                        <select
                          id="category"
                          value={selectedCategory || ""}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full border rounded-lg px-4 py-2"
                        >
                          <option value="" disabled>
                            Chọn danh mục
                          </option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700">
                          Hình ảnh & Video
                        </label>
                        <input
                          type="file"
                          id="mediaUpload"
                          accept="image/*, video/*"
                          multiple
                          className="w-full border rounded-lg px-4 py-2"
                          onChange={handleFileChange1}
                        />
                      </div>
                    </div>

                    {/* Nút lưu và hủy */}
                    <div className="flex justify-end mt-6 gap-4">
                      <button
                        type="submit"
                        onClick={(e) => {
                          e.preventDefault();
                          handleUpdateToy();
                          setIsEditing(false);
                          setSelectedToy(null);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedToy(null);
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded"
                      >
                        Huỷ
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case "dashboard":
        return (
          <div>
            <h3 className="text-lg font-semibold">Doanh Thu</h3>
            <p>Thông tin thống kê sẽ được hiển thị ở đây.</p>
          </div>
        );
      case "Wallet":
        return (
          <div className="p-6 space-y-6">
            {/* Phần trên: Thông tin tài khoản */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Thông tin tài khoản
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong className="font-medium">Số dư khả dụng:</strong>{" "}
                  <span className="text-green-600">
                    {(walletInfo.balance || 0).toLocaleString()} VNĐ
                  </span>
                </p>
                <p>
                  <strong className="font-medium">Số tài khoản:</strong>{" "}
                  {walletInfo.withdrawInfo}
                </p>
                <p>
                  <strong className="font-medium">Ngân hàng:</strong>{" "}
                  {walletInfo.withdrawMethod}
                </p>
              </div>
            </div>

            {/* Phần dưới: Lịch sử giao dịch */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Lịch sử giao dịch
              </h2>
              {walletTransaction.length > 0 ? (
                <ul className="space-y-4">
                  {walletTransaction.map((transaction) => (
                    <li
                      key={transaction.id}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">
                          {transaction.senderId} {transaction.transactionType}
                        </h4>
                        <span
                          className={`font-medium ${
                            transaction.amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.amount >= 0
                            ? "+" + (transaction.amount || 0).toLocaleString()
                            : (transaction.amount || 0).toLocaleString()}{" "}
                          VNĐ
                        </span>
                      </div>

                      <div className="flex items-center mb-2">
                        <p className="font-semibold text-gray-600">
                          Ngày Nạp :{" "}
                          {
                            new Date(transaction.date)
                              .toISOString()
                              .split("T")[0]
                          }
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">Không có giao dịch nào.</p>
              )}
            </div>
          </div>
        );

      case "Edit":
        return <div>hi</div>;

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
          zIndex: 1000,
          backgroundColor: "white",
        }}
      >
        <HeaderForToySupplier />
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
              <span className="icon-class mr-2">👤</span> Thông tin cửa hàng
            </button>
            <button
              onClick={() => setSelectedTab("password")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "password" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🔒</span> Đổi mật khẩu
            </button>
            <button
              onClick={() => setSelectedTab("products")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "products" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">📦</span> Danh sách sản phẩm
              đang bán
            </button>

            <button
              onClick={() => setSelectedTab("orders")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "orders" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">👥</span> Danh sách đơn hàng
            </button>
            <button
              onClick={() => setSelectedTab("Wallet")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "Wallet" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">💼</span> {/* Biểu tượng ví */}
              Lịch sử giao dịch
            </button>
            <button
              onClick={() => setSelectedTab("Edit")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "Edit" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🏢</span> Chỉnh sửa cửa hàng
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

export default ToySupplierPage;
