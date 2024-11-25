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
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [status, setStatus] = useState(""); // Initialize state
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
              `/user/${user.id}?pageIndex=1&pageSize=20000`,
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("userToken")}`,
                },
              }
            );

            console.log("Dữ liệu đồ chơi của người dùng:", toyResponse.data);

            // Cập nhật dữ liệu đồ chơi (nếu cần thiết)
            setToysData(toyResponse.data);
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
      LoadOrderShop(userId);
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
  // useEffect(() => {
  //   LoadOrderShop(userId, ""); // Gọi LoadOrderShop lần đầu với trạng thái "all"
  // }, [userId]);

  // Hàm load đồ chơi theo userId
  const LoadToy = async (userId) => {
    if (!userId) {
      console.error("Không tìm thấy userId để tải đồ chơi.");
      return;
    }
    try {
      const toyResponse = await apiToys.get(
        `/user/${userId}?pageIndex=1&pageSize=20000`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      console.log("Dữ liệu đồ chơi của người dùng 2:", toyResponse.data);

      // Cập nhật dữ liệu đồ chơi (nếu cần thiết)
      setToysData(toyResponse.data);

      console.log("Danh sách đồ chơi:", toyResponse.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đồ chơi:", error);
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
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        }
      );

      const orders = OrderResponse.data;
      console.log("Danh sách đơn hàng:", orders);

      // if (!Array.isArray(orders) || orders.length === 0) {
      //   alert("Không có đơn hàng nào được tìm thấy.");
      //   return;
      // }

      const orderIds = orders.map((order) => order.id);

      const orderDetailsPromises = orderIds.map(async (orderId) => {
        try {
          const orderDetailsResponse = await apiOrderDetail.get(
            `/Order/${orderId}`,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("userToken")}`,
              },
            }
          );

          const orderDetails = orderDetailsResponse.data;

          console.log(`Chi tiết đơn hàng ${orderId}:`, orderDetails);

          return {
            orderId,
            toyImgUrls:
              orderDetails.length > 0 &&
              Array.isArray(orderDetails[0]?.toyImgUrls)
                ? orderDetails[0].toyImgUrls
                : ["default_image_url_here"], // Giá trị mặc định
            ...orderDetails[0],
          };
        } catch (error) {
          console.error(`Lỗi khi tải chi tiết đơn hàng ${orderId}:`, error);
          return null; // Trả về null nếu lỗi
        }
      });

      const allOrderDetails = await Promise.all(orderDetailsPromises);

      const validOrderDetails = allOrderDetails.filter(
        (orderDetail) => orderDetail !== null
      );

      const updatedOrders = orders.map((order) => {
        const matchingOrderDetail = validOrderDetails.find(
          (detail) => detail.orderId === order.id
        );

        return {
          ...order,
          toyImgUrls: matchingOrderDetail?.toyImgUrls || [
            "default_image_url_here",
          ],
        };
      });

      setOrders(updatedOrders);
      setOrderDetails(validOrderDetails);
      setLoading(false);
    } catch (error) {
      console.error(
        "Lỗi khi tải danh sách đơn hàng hoặc chi tiết đơn hàng:",
        error
      );
      setLoading(false);

      if (error.response) {
        alert(
          `Lỗi: ${error.response.data.message || "Không thể tải dữ liệu."}`
        );
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
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
  // Hàm để gửi ảnh lên API
  const handleUpdateToy = async () => {
    const toyId = selectedToy?.id; // Lấy toyId từ selectedToy

    if (!toyId) {
      console.error("Không tìm thấy toyId.");
      return;
    }

    try {
      // Chuẩn bị dữ liệu dưới dạng JSON thay vì formData
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
      console.log("Dữ liệu gửi đi1:", updatedToy);
      console.log("Dữ liệu gửi đi:", selectedToy);
      // Gửi PUT request với Content-Type là application/json
      const response = await apiToys.put(`/${toyId}`, updatedToy, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
          "Content-Type": "application/json", // Sử dụng application/json thay vì multipart/form-data
        },
      });

      console.log("Cập nhật toy thành công:", response.data);
      setToyData(response.data); // Cập nhật lại dữ liệu của toy sau khi update
      setIsEditing(null); // Dừng trạng thái chỉnh sửa
      LoadToy(userId);
    } catch (error) {
      console.error("Lỗi khi cập nhật toy:", error);
    }
  };

  const handleDelete = async (toyId) => {
    // Hiển thị hộp thoại xác nhận
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this toy?"
    );

    // Nếu người dùng không xác nhận, dừng lại
    if (!isConfirmed) {
      return;
    }

    try {
      // Gửi giá trị chuỗi trực tiếp thay vì đối tượng
      const requestBody = "Inactive"; // Thay đổi thành chuỗi trực tiếp

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
        LoadToy(userId);
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
      buyQuantity: 0, // Giá trị mặc định
      origin: document.getElementById("origin").value,
      age: document.getElementById("age").value,
      brand: document.getElementById("brand").value,
      categoryId: selectedCategory, // Lấy categoryId đã chọn
      rentCount: 0, // Giá trị mặc định
      rentTime: "0 Week",
    };

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
          `/upload-toy-images/${toyId}`, // Đảm bảo đường dẫn đúng
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

  const openOrderDetail = (orderId) => {
    const orderDetail = orderDetails.find(
      (detail) => detail.orderId === orderId
    );
    setSelectedOrderDetail(orderDetail || null);
  };

  const closeOrderDetail = () => {
    setSelectedOrderDetail(null);
  };
  const handleCompleteOrder = async (orderId) => {
    const userToken = Cookies.get("userToken");

    if (!userToken) {
      alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    // Tìm đơn hàng cần cập nhật trong mảng orders
    const orderToUpdate = orders.find((order) => order.id === orderId);

    if (!orderToUpdate) {
      alert("Không tìm thấy đơn hàng.");
      return;
    }

    // Dữ liệu yêu cầu gửi đi khi cập nhật trạng thái
    const updatedOrderData = {
      orderDate: new Date().toISOString(), // Cập nhật ngày đơn hàng
      receiveDate: new Date().toISOString(), // Cập nhật ngày nhận
      totalPrice: orderToUpdate.totalPrice, // Lấy giá trị từ đơn hàng cần cập nhật
      rentPrice: orderToUpdate.rentPrice, // Lấy giá trị từ đơn hàng cần cập nhật
      depositeBackMoney: orderToUpdate.depositeBackMoney, // Lấy giá trị từ đơn hàng cần cập nhật
      receiveName: orderToUpdate.receiveName, // Cập nhật tên người nhận nếu cần
      receiveAddress: orderToUpdate.receiveAddress, // Cập nhật địa chỉ nhận nếu cần
      receivePhone: orderToUpdate.receivePhone, // Cập nhật số điện thoại nếu cần
      status: "Complete", // Cập nhật trạng thái đơn hàng
      userId: orderToUpdate.userId, // ID người dùng
    };

    try {
      // Gọi API cập nhật trạng thái đơn hàng
      const response = await apiOrder.put(`/${orderId}`, updatedOrderData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("userToken")}`,
          "Content-Type": "application/json", // Đảm bảo Content-Type là application/json
        },
      });

      console.log("Cập nhật đơn hàng thành công:", response.data);

      // Cập nhật giao diện nếu cần
      alert("Đơn hàng đã được hoàn thành.");
      LoadOrderShop(userId);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.");
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
                    <p>Ngày sinh: {userData.dob}</p>
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

                    {/* Trường chọn ảnh
                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Ảnh đại diện
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            avatarUrl: e.target.files[0], // Lưu file đã chọn vào state
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div> */}

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
                  <img
                    src={order.toyImgUrls?.[0] || "default_image_url_here"}
                    alt={`Ảnh đồ chơi cho đơn hàng ${order.id}`}
                    style={{ width: "100px", height: "100px", margin: "5px" }}
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold">
                      Người nhận: {order.userName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Địa chỉ nhận: {order.receiveAddress}
                    </p>
                    <p className="text-sm text-gray-600">
                      Số điện thoại: {order.receiveAddress}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <h1 className="text-lg font-bold text-gray-600">
                      {order.status}
                    </h1>
                    <p className="text-sm text-gray-500">
                      Tổng tiền: {order.totalPrice}₫
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
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      onClick={() => handleCompleteOrder(order.id)} // Gọi hàm cập nhật khi nhấn nút
                    >
                      Hoàn Thành
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Modal hiển thị chi tiết đơn hàng */}
            {selectedOrderDetail && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 max-w-lg">
                  <h3 className="text-xl font-semibold mb-4">
                    Chi tiết đơn hàng
                  </h3>

                  {/* Hiển thị ảnh đồ chơi */}
                  <div className="mb-4">
                    <img
                      src={
                        selectedOrderDetail.toyImgUrls[0] ||
                        "default_image_url_here"
                      }
                      alt={selectedOrderDetail.toyName}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  </div>

                  {/* Hiển thị thông tin đơn hàng */}
                  <div className="space-y-2">
                    <p>
                      <strong>Mã đơn hàng:</strong>{" "}
                      {selectedOrderDetail.orderId}
                    </p>
                    <p>
                      <strong>Tên đồ chơi:</strong>{" "}
                      {selectedOrderDetail.toyName}
                    </p>
                    <p>
                      <strong>Giá thuê:</strong> {selectedOrderDetail.rentPrice}
                      ₫
                    </p>
                    <p>
                      <strong>Tiền đặt cọc:</strong>{" "}
                      {selectedOrderDetail.deposit}₫
                    </p>
                    <p>
                      <strong>Giá một đơn vị:</strong>{" "}
                      {selectedOrderDetail.unitPrice}₫
                    </p>
                    <p>
                      <strong>Số lượng:</strong> {selectedOrderDetail.quantity}
                    </p>
                    <p>
                      <strong>Ngày bắt đầu:</strong>{" "}
                      {new Date(
                        selectedOrderDetail.startDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Ngày kết thúc:</strong>{" "}
                      {new Date(
                        selectedOrderDetail.endDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Tình trạng:</strong> {selectedOrderDetail.status}
                    </p>
                  </div>

                  {/* Đóng modal */}
                  <div className="mt-4 flex justify-end">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      onClick={closeOrderDetail}
                    >
                      Đóng
                    </button>
                  </div>
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
                    <form className="sm:pr-3" action="#" method="GET">
                      <label htmlFor="products-search" className="sr-only">
                        Search
                      </label>
                      <div className="relative w-48 mt-1 sm:w-64 xl:w-96">
                        <input
                          type="text"
                          name="email"
                          id="products-search"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Search for products"
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
                                  Độ tuổi:
                                </label>
                                <input
                                  type="text"
                                  id="age"
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
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="p-4">
                            <div className="flex items-center">
                              <input
                                id="checkbox-all"
                                aria-describedby="checkbox-1"
                                type="checkbox"
                                className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <label htmlFor="checkbox-all" className="sr-only">
                                checkbox
                              </label>
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Toy Name
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Price
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Origin
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Age
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Brand
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            CreateDate
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            RentTime
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Status
                          </th>

                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            Actions
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
                              <td className="w-4 p-4">
                                <div className="flex items-center">
                                  <input
                                    id={`checkbox-${toy.id}`}
                                    aria-describedby="checkbox-1"
                                    type="checkbox"
                                    className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <label
                                    htmlFor={`checkbox-${toy.id}`}
                                    className="sr-only"
                                  >
                                    checkbox
                                  </label>
                                </div>
                              </td>
                              <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                  {toy.name}
                                </div>
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.price}
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
                                {toy.rentTime}
                              </td>
                              <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {toy.status}
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
                                  Detail
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setIsEditing(true); // Bật form chỉnh sửa
                                    setSelectedToy(toy); // Lưu thông tin toy vào selectedToy
                                  }}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation(); // Ngăn sự kiện lan truyền lên <tr>
                                    handleDelete(toy.id); // Gọi hàm handleDelete
                                  }}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                                >
                                  Delete
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
                <button className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-red-500 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
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
                  Previous
                </button>
                <button className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-red-500 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  Next
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
                <div className="bg-white p-16 rounded-2xl shadow-2xl max-w-7xl w-full h-[90%] overflow-auto relative">
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
                    <div className="flex-1 flex justify-center items-center flex-col">
                      {/* Hiển thị ảnh hoặc video */}
                      <div className="w-80 h-80 mb-6">
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
                      <div className="flex gap-4 flex-wrap justify-center">
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
                        Toy Details
                      </h2>
                      <p>
                        <strong>Name:</strong> {selectedToy.name}
                      </p>
                      <p>
                        <strong>Price:</strong> {selectedToy.price}
                      </p>
                      <p>
                        <strong>Origin:</strong> {selectedToy.origin}
                      </p>
                      <p>
                        <strong>Age:</strong> {selectedToy.age}
                      </p>

                      <p>
                        <strong>Thương Hiệu:</strong> {selectedToy.brand}
                      </p>
                      <p>
                        <strong>Danh mục:</strong> {selectedToy.category.name}
                      </p>
                      <p>
                        <strong>Create Date:</strong>{" "}
                        {new Date(selectedToy.createDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Rent Time:</strong> {selectedToy.rentTime}
                      </p>
                      <p>
                        <strong>Status:</strong> {selectedToy.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                  <h2 className="text-4xl font-bold mb-4 text-center">
                    {" "}
                    Chỉnh sửa đồ chơi
                  </h2>
                  <form className="space-y-6">
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
                    <div className="mb-4">
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
                        className="w-full p-2 border border-gray-300 rounded"
                        value={selectedToy.description}
                        onChange={(e) =>
                          setSelectedToy({
                            ...selectedToy,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-4">
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
                    <div className="mb-4">
                      <label htmlFor="price" className="block text-gray-700">
                        Số lượng:
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
                    <div className="mb-4">
                      <label htmlFor="price" className="block text-gray-700">
                        Nguồn gốc:
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
                    <div className="mb-4">
                      <label htmlFor="price" className="block text-gray-700">
                        Tuổi:
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={selectedToy.age}
                        onChange={(e) =>
                          setSelectedToy({
                            ...selectedToy,
                            age: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="price" className="block text-gray-700">
                        Thương hiệu:
                      </label>
                      <input
                        type="text"
                        id="brand"
                        name="brand"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={selectedToy.brand}
                        onChange={(e) =>
                          setSelectedToy({
                            ...selectedToy,
                            brand: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="category">Danh mục:</label>
                      <select
                        id="category"
                        value={selectedCategory || ""}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        required
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
                    <div className="flex justify-end">
                      <button
                        type="submit" // Sử dụng type="submit" để kích hoạt hành động form
                        onClick={() => {
                          handleUpdateToy();
                          setIsEditing(false);
                          setSelectedToy(null); // Đảm bảo khi cancel không mở lại chi tiết
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedToy(null); // Đảm bảo khi cancel không mở lại chi tiết
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded"
                      >
                        Cancel
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
      case "Edit":
        return <div>hi</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
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
