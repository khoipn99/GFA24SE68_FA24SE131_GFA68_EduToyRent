import React, { useState, useEffect } from "react";
import HeaderForStaff from "../../Component/HeaderForStaff/HeaderForStaff";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import Cookies from "js-cookie"; // Import thư viện Cookies
import apiToys from "../../service/ApiToys";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const StaffPage = () => {
  const [userData, setUserData] = useState("");
  const [selectedTab, setSelectedTab] = useState("orders");
  const [isEditing, setIsEditing] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
  });
  const [toys, setToys] = useState([]);
  const [selectedToy, setSelectedToy] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State để kiểm tra form có mở hay không
  const [currentMedia, setCurrentMedia] = useState([]);
  const [currentPicture, setCurrentPicture] = useState([]);
  useEffect(() => {
    try {
      const userDataCookie = Cookies.get("userData");
      if (userDataCookie) {
        const parsedUserData = JSON.parse(userDataCookie);
        setUserData(parsedUserData);
      } else {
        console.error("User data not found in cookies");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  useEffect(() => {
    fetchToys();
  }, [pageIndex]);

  const fetchToys = async () => {
    try {
      const response = await apiToys.get(
        `?pageIndex=${pageIndex}&pageSize=100`
      );
      const inactiveToys = response.data.filter(
        (item) => item.status == "Inactive"
      );
      setToys(inactiveToys);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching toys:", error);
    }
  };
  const getVideos = (mediaUrls) => {
    return mediaUrls.filter((url) => {
      const fileExtension = url.split("?")[0];
      return /\.(mp4|mov|avi|mkv)$/i.test(fileExtension);
    });
  };

  const getImages = (mediaUrls) => {
    return mediaUrls.filter((url) => {
      const fileExtension = url.split("?")[0]; // Tách URL và loại bỏ phần query string
      return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileExtension); // Kiểm tra đuôi file hình ảnh
    });
  };

  const handleMediaClick = (mediaUrl) => {
    setCurrentMedia(mediaUrl);
  };

  const handleUpdate = async () => {
    if (!selectedToy) return;

    try {
      const response = await fetch(
        `https://localhost:44350/api/v1/Toys/${selectedToy.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedToy),
        }
      );

      if (response.ok) {
        const updatedToy = await response.data;
        setToys((prevToys) =>
          prevToys.map((toy) => (toy.id === updatedToy.id ? updatedToy : toy))
        );
        setIsEditing(false);
        setSelectedToy(null);
      } else {
        console.error("Failed to update toy:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating toy:", error);
    }
  };

  // Function to handle deleting a toy
  const handleDelete = async (toyId) => {
    if (window.confirm("Are you sure you want to delete this toy?")) {
      try {
        const response = await fetch(
          `https://localhost:44350/api/v1/Toys/${toyId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setToys((prevToys) => prevToys.filter((toy) => toy.id !== toyId));
        } else {
          console.error("Failed to delete toy:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting toy:", error);
      }
    }
  };

  const handleNextPage = () => {
    setPageIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousPage = () => {
    setPageIndex((prevIndex) => Math.max(prevIndex - 1, 1));
  };

  const [isLoading, setIsLoading] = useState(true);

  const handleDetails = async (toyId) => {
    setIsOpen(!isOpen);
    setIsLoading(true); // Set isLoading trước khi bắt đầu tải dữ liệu

    try {
      apiToys
        .get(`https://localhost:44350/api/v1/Toys/${toyId}`)
        .then((response) => {
          console.log("Chi tiết đồ chơi:", response.data);

          // Cập nhật các giá trị cùng một lúc

          // Cập nhật state với dữ liệu mới
          setSelectedToy(response.data);
          setSelectedVideo(getVideos(response.data.mediaUrls)[0]);
          setCurrentMedia(response.data.mediaUrls[0]);
          setCurrentPicture(getImages(response.data.mediaUrls));
          setIsLoading(false); // Đặt lại isLoading khi tải xong
        });
    } catch (error) {
      console.error("Lỗi khi kết nối đến API:", error);
      setIsLoading(false); // Đặt lại isLoading khi có lỗi
    }
  };

  // Function to start editing a toy
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    console.log("Thông tin đã lưu:", customerInfo);
  };
  const handleClick = () => {
    console.log("Button clicked!");
    // Thực hiện hành động mong muốn
  };
  const renderContent = () => {
    switch (selectedTab) {
      case "info":
        return (
          <div>
            <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
            {isEditing ? (
              <div>
                <label className="block">
                  Tên:
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded p-1"
                  />
                </label>
                <label className="block">
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded p-1"
                  />
                </label>
                <label className="block">
                  Điện thoại:
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded p-1"
                  />
                </label>
                <button
                  onClick={handleSaveChanges}
                  className="mt-4 p-2 bg-blue-500 text-white rounded"
                >
                  Lưu thay đổi
                </button>
              </div>
            ) : (
              <div>
                <p>Tên: {customerInfo.name}</p>
                <p>Email: {customerInfo.email}</p>
                <p>Điện thoại: {customerInfo.phone}</p>
                <button
                  onClick={handleEditToggle}
                  className="mt-4 p-2 bg-yellow-500 text-white rounded"
                >
                  Sửa thông tin
                </button>
              </div>
            )}
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
            <div class="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
              <div class="w-full mb-1">
                <div class="items-center justify-between block sm:flex md:divide-x md:divide-gray-100 dark:divide-gray-700">
                  <div class="flex items-center mb-4 sm:mb-0">
                    <form class="sm:pr-3" action="#" method="GET">
                      <label for="products-search" class="sr-only">
                        Search
                      </label>
                      <div class="relative w-48 mt-1 sm:w-64 xl:w-96">
                        <input
                          type="text"
                          name="email"
                          id="products-search"
                          class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Search for products"
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
                            Người cho thuê
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
                        {toys.map((toy) => (
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
                              {toy.owner.fullName}
                            </td>
                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                              <button
                                type="button"
                                onClick={() => handleDetails(toy.id)} // Gọi hàm update khi nhấn nút
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                              >
                                Chi tiết đồ chơi
                              </button>
                            </td>

                            {/* <td className="p-4 space-x-2 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleUpdate(toy)} // Gọi hàm update khi nhấn nút
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                              >
                                Approver
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(toy.id)} // Gọi hàm delete khi nhấn nút
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                              >
                                Reject
                              </button>
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {isOpen && (
              <>
                {/* Overlay mờ phía sau */}
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 100,
                  }}
                  onClick={() => setIsOpen(false)}
                />

                {/* Form chi tiết đồ chơi */}
                <div
                  className="toy-detail-container"
                  style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    padding: "20px",
                    backgroundColor: "white",
                    zIndex: 101,
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: "10px",
                  }}
                >
                  {/* Nút đóng */}
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      fontSize: "18px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    X
                  </button>

                  {/* Phần bên trái: Video và hình ảnh */}
                  <div
                    className="toy-media"
                    style={{
                      flex: 2, // Tăng flex để phần này chiếm diện tích lớn hơn
                      paddingRight: "40px", // Tăng khoảng cách bên phải để có thêm không gian
                      textAlign: "center", // Căn giữa nội dung
                      width: "100%", // Đảm bảo phần tử chiếm toàn bộ chiều rộng của phần chứa
                    }}
                  >
                    {" "}
                    <div style={{ marginBottom: "10px" }}>
                      {selectedVideo ? (
                        <video
                          controls
                          style={{
                            width: "500px", // Chiều rộng cố định
                            height: "340px", // Chiều cao cố định
                            objectFit: "cover", // Căn chỉnh nội dung video
                          }}
                        >
                          <source src={selectedVideo} type="video/mp4" />
                          Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                      ) : (
                        <div>Đang tải video...</div> // Placeholder hoặc loader
                      )}
                    </div>
                    {/* Hình ảnh lớn */}
                    <div style={{ marginBottom: "10px" }}>
                      <img
                        src={currentMedia}
                        alt="Toy"
                        style={{
                          width: "500px", // Chiều rộng cố định
                          height: "340px", // Chiều cao cố định
                          objectFit: "cover", // Căn chỉnh hình ảnh
                        }}
                      />
                    </div>
                    {/* Các hình ảnh và video nhỏ bên dưới */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      {currentPicture &&
                        currentPicture.map((url, index) => (
                          <div
                            key={index}
                            style={{
                              marginRight: "10px",
                              cursor: "pointer",
                              border:
                                currentMedia === url
                                  ? "2px solid blue"
                                  : "none",
                            }}
                            onClick={() => handleMediaClick(url)}
                          >
                            {
                              <img
                                src={url}
                                alt="Thumbnail"
                                style={{ width: "80px", height: "auto" }}
                              />
                            }
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Phần bên phải: Chi tiết đồ chơi và các nút duyệt, từ chối */}
                  <div className="toy-details" style={{ flex: 2 }}>
                    <h2>{selectedToy.name}</h2>
                    <p>{selectedToy.description}</p>
                    <p>Giá: {selectedToy.price} VND</p>
                    <p>
                      Danh mục:{" "}
                      {selectedToy.category && selectedToy.category.name
                        ? selectedToy.category.name
                        : ""}
                    </p>

                    {/* Các nút duyệt và từ chối */}
                    <div style={{ marginTop: "20px" }}>
                      <button
                        onClick={() => handleUpdate()}
                        style={{ marginRight: "10px" }}
                      >
                        Duyệt
                      </button>
                      <button onClick={() => handleDelete()}>Từ chối</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="sticky bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center mb-4 sm:mb-0"></div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePreviousPage}
                  disabled={pageIndex === 1}
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center ${
                    pageIndex === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={toys.length === 0}
                  className={`inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center ${
                    toys.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
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
