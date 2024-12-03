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
const StaffPage = () => {
  const [userData, setUserData] = useState("");
  const [selectedTab, setSelectedTab] = useState("orders");
  const [isEditing, setIsEditing] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 5; // Số mục trên mỗi trang
  const [searchKeyword, setSearchKeyword] = useState(""); // Lưu từ khóa tìm kiếm
  const [mediaList, setMediaList] = useState([]); // Lưu danh sách media (ảnh + video)
  const [toys, setToys] = useState([]);
  const [orders, setOrders] = useState([]); // State để lưu trữ danh sách đơn hàng
  const [selectedVideo, setSelectedVideo] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State để kiểm tra form có mở hay không
  const [currentMedia, setCurrentMedia] = useState([]);
  const [currentPicture, setCurrentPicture] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [toyData, setToyData] = useState(null);
  const [toysData, setToysData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedToy, setSelectedToy] = useState(null);
  const [status, setStatus] = useState("Delivering"); // Initialize state
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [toyForDetails, setToyForDetail] = useState([]);
  const [loading, setLoading] = useState(true); // State để quản lý trạng thái tải dữ liệu
  const [orderDetails, setOrderDetails] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // Để lưu đơn hàng được chọn khi xem chi tiết
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
          } else {
            console.error("Không tìm thấy thông tin người dùng.");
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu:", error);
        }
      };
      loadCategories();
      fetchUserData();
      LoadToy(1, 5);
      LoadOrder("");
      console.log("Danh sách toys:", toys);
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
      setCategories(response.data); // Lưu dữ liệu vào state

      console.log("Danh sách categories:", response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đồ chơi:", error);
    }
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
  const LoadToy = async (pageIndex = 1, pageSize = 5) => {
    try {
      const toyResponse = await apiToys.get(
        `?pageIndex=${pageIndex}&pageSize=${pageSize}`,
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
        (order) => order.status === statusFilter
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
  const statusMapping = {
    Delivering: "Đang giao",
    Complete: "Hoàn thành",
    // Các trạng thái khác nếu có
  };
  const openOrderDetail = (orderId) => {
    // Tìm đơn hàng từ danh sách orders
    const orderDetail = orders.find((order) => order.id === orderId);
    setSelectedOrder(orderDetail); // Cập nhật state selectedOrder để hiển thị modal
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null); // Đóng modal khi không chọn đơn hàng
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

      //cập nhập ví người bán
      // const userWalletResponse = await apiWallets.get(`/${user.walletId}`, {
      //   headers: {
      //     Authorization: `Bearer ${userToken}`,
      //   },
      // });
      // const userWallet = userWalletResponse.data;
      // console.log("Wallet người dùng:", userWallet);
      // //vì nó mua nên không có tiền back lại
      // const updatedBalance = userWallet.balance + 0;
      // console.log("Giá trị balance sẽ gửi lên API:", updatedBalance);

      // await apiWallets.put(
      //   `/${userWallet.id}`,
      //   {
      //     balance: updatedBalance,
      //     withdrawMethod: userWallet.withdrawMethod || "defaultMethod",
      //     withdrawInfo: userWallet.withdrawInfo || "defaultInfo",
      //     status: userWallet.status || "Active",
      //     userId: userWallet.userId,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${userToken}`,
      //     },
      //   }
      // );

      // await apiWalletTransaction.post(
      //   "",
      //   {
      //     transactionType: "Nhận lại tiền cọc",
      //     // amount: orderToUpdate.depositeBackMoney - orderToUpdate.rentPrice,
      //     amount: 0,
      //     date: new Date().toISOString(),
      //     walletId: userWallet.id,
      //     paymentTypeId: 5,
      //     orderId: orderToUpdate.id,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${userToken}`,
      //     },
      //   }
      // );

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
      case "orders":
        return (
          <div>
            <h3 className="text-lg font-semibold">Danh sách sản phẩm</h3>
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
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-red-500 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
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
          </div>
        );

      case "dashboard":
        return (
          <div>
            <h3 className="text-lg font-semibold">Doanh Thu</h3>
            <p>Thông tin thống kê sẽ được hiển thị ở đây.</p>
          </div>
        );
      case "Status":
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
                      Tên đồ chơi: {order.toyName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ngày bắt đầu: {order.startDate}
                    </p>
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
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                      onClick={() => openOrderDetail(order.id)} // Mở chi tiết đơn hàng
                    >
                      Xem chi tiết
                    </button>
                    {order.status !== "Complete" && (
                      <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                        Hoàn Thành
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Modal hiển thị chi tiết đơn hàng */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 max-w-lg">
                  <h3 className="text-xl font-semibold mb-4">
                    Chi tiết đơn hàng
                  </h3>
                  <div className="mb-4">
                    <img
                      src={
                        selectedOrder.toyImgUrls?.[0] ||
                        "default_image_url_here"
                      }
                      alt="Ảnh đồ chơi"
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong>Mã đơn hàng:</strong> {selectedOrder.id}
                    </p>
                    <p>
                      <strong>Tên đồ chơi:</strong> {selectedOrder.toyName}
                    </p>
                    <p>
                      <strong>Giá thuê:</strong> {selectedOrder.rentPrice}₫
                    </p>
                    <p>
                      <strong>Tiền đặt cọc:</strong> {selectedOrder.deposit}₫
                    </p>
                    <p>
                      <strong>Giá một đơn vị:</strong> {selectedOrder.unitPrice}
                      ₫
                    </p>
                    <p>
                      <strong>Số lượng:</strong> {selectedOrder.quantity}
                    </p>
                    <p>
                      <strong>Ngày bắt đầu:</strong>{" "}
                      {new Date(selectedOrder.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Ngày kết thúc:</strong>{" "}
                      {new Date(selectedOrder.endDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Tình trạng:</strong> {selectedOrder.status}
                    </p>
                  </div>
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

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
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
              onClick={() => setSelectedTab("order")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "order" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">👥</span> Danh sách sản phẩm đợi
              duyệt lại
            </button>

            <button
              onClick={() => setSelectedTab("Edit")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "Edit" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🏢</span> Danh sách sản phẩm đã
              duyệt
            </button>
            <button
              onClick={() => setSelectedTab("Status")}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${
                selectedTab === "Status" ? "bg-gray-300" : ""
              }`}
            >
              <span className="icon-class mr-2">🏢</span> Danh sách đơn hàng
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
      <footer className="bg-white shadow-md p-4">
        <FooterForCustomer />
      </footer>
    </div>
  );
};

export default StaffPage;
