import React, { useState, useEffect } from "react";
import HeaderForStaff from "../../Component/HeaderForStaff/HeaderForStaff";
import FooterForCustomer from "../../Component/FooterForCustomer/FooterForCustomer";
import Cookies from "js-cookie"; // Import thư viện Cookies
const StaffPage = () => {
  const [userData, setUserData] = useState("");
  const [selectedTab, setSelectedTab] = useState("orders");
  const [isEditing, setIsEditing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
  });
  const [toys, setToys] = useState([]);
  const [selectedToy, setSelectedToy] = useState(null);

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
    const fetchToys = async () => {
      try {
        const response = await fetch(
          "https://localhost:44350/api/v1/Toys?pageIndex=1&pageSize=20"
        );
        const data = await response.json();
        setToys(data);
      } catch (error) {
        console.error("Error fetching toys:", error);
      }
    };

    fetchToys();
  }, []);

  // Function to handle updating a toy
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
        const updatedToy = await response.json();
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
                            Star
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
                            RentCount
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            BuyQuantity
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
                            UserId
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                          >
                            CategoryId
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
                              {toy.star}
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
                              {toy.rentCount}
                            </td>
                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                              {toy.buyQuantity}
                            </td>
                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                              {toy.createDate}
                            </td>
                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                              {toy.rentTime}
                            </td>
                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                              {toy.status}
                            </td>
                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                              {toy.owner.fullName}
                            </td>
                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                              {toy.category.name}
                            </td>
                            <td className="p-4 space-x-2 whitespace-nowrap">
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
                            </td>
                          </tr>
                        ))}
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
