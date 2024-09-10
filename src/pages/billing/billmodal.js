import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios/custom";
import { MyLoader } from "../../ui/contentLoader";
import DataTable from "react-data-table-component";
import FilterComponent from "../../components/filtercomponent/filtercomponent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Select from "react-select";
import { Modal } from "bootstrap";

const BillingList = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("myToken");
  const organisationId = sessionStorage.getItem("organisationId");
  const [data, setData] = useState([]);
  const [billsPerDay, setBillsPerDay] = useState("");
  const [billsPerWeek, setBillsPerWeek] = useState("");
  const [billsPerMonth, setBillsPerMonth] = useState("");
  const [selectedBillToBePaid, setSelectedBillToBePaid] = useState(null);
  const [selectedBillToBeViewed, setSelectedBillToBeViewed] = useState(null);
  const [selectedBillToBeUpdated, setSelectedBillToBeUpdated] = useState(null);
  const [filterText, setFilterText] = React.useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const customRowsPerPageOptions = [5, 10, 20];
  const [pending, setPending] = useState(true);
  const [totalRows, setTotalRows] = useState(null);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deactivatedetails, setDeactivatedetails] = useState({});
  const [agent, setAgent] = useState(null);
  const [modalInstance, setModalInstance] = useState(null);
  const authCloseModal = (elementId) => {
    const myModal = new Modal(document.getElementById(elementId));

    myModal.show();

    myModal._element.addEventListener("shown.bs.modal", () => {
      clearTimeout(myModal._element.hideInterval);
      const id = setTimeout(() => {
        myModal.hide();
      });
      myModal._element.hideInterval = id;

      const backdropElement = document.querySelector(".modal-backdrop.show");
      if (backdropElement) {
        backdropElement.remove();
      }
    });

    setModalInstance(myModal);
  };

  const adminplaceholder = [
    {
      id: 63,
      AdminName: "Ibukun Emmanuel",
    },
    {
      id: 64,
      AdminName: "Ajayi David",
    },
    {
      id: 65,
      AdminName: "Caleb Daniels",
    },
    {
      id: 72,
      AdminName: "Aliko Dangote",
    },
  ];
  const transformedAgents = adminplaceholder
    ? adminplaceholder.map((item) => ({
        label: item.AdminName,
        value: item.id,
      }))
    : "";
  const requestApproval = (e) => {
    authCloseModal("staticBackdropLabel");

    const confirmation = window.confirm(
      "Do you want to continue to generate bill?"
    );
    if (confirmation) {
    }
  };
  const columns = [
    {
      name: "S/N",
      selector: (row, index) => reversedFilteredItems.indexOf(row) + 1,
      sortable: true,
      grow: 0,
      style: {
        textAlign: "center",
      },
    },
    {
      name: "Property",
      selector: (row) => row.property?.buildingName,
      sortable: true,
      grow: 2,
      style: {
        textAlign: "center",
      },
    },
    {
      name: "Rate-Payer Name",
      selector: (row) => row.customers.fullName,
      sortable: true,
      grow: 2,
      style: {
        textAlign: "center",
      },
    },
    {
      name: "Agency",
      selector: (row) => row.agencies.agencyName,
      sortable: true,
      grow: 2,
      style: {
        textAlign: "center",
      },
    },
    {
      name: "Revenue",
      selector: (row) => row.revenues.revenueName,
      sortable: true,
      grow: 2,
      style: {
        textAlign: "center",
      },
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      grow: 1,
      style: {
        textAlign: "center",
      },
    },
    {
      name: "Amount",
      selector: (row) => row.billAmount,
      sortable: true,
      grow: 1,
      style: {
        textAlign: "center",
      },
    },
    {
      name: "Harmonized Bill Reference",
      selector: (row) => row.harmonizedBillReferenceNo,
      sortable: true,
      grow: 1,
      style: {
        textAlign: "center",
      },
    },

    {
      name: "Action",
      sortable: false,
      center: true,
      grow: 0,

      cell: (row) => (
        // <div>
        //   <button className=" text-dark" onClick={() => handleViewBill(row)}>
        //     <i className="fa-solid fa-circle-info"></i> View Bill
        //   </button>
        //   <br></br>
        //   <button className=" text-dark " onClick={() => handleUpdateBill(row)}>
        //     <i className="fa-solid fa-arrows-rotate"></i> Upgrade Bill
        //   </button>
        //   <br></br>
        //   <button className=" text-dark " onClick={() => handlePayNow(row)}>
        //     <i className="fa-regular fa-credit-card"></i> Pay Now
        //   </button>
        // </div>
        <div>
          <DropdownButton
            id="dropdown-basic-button"
            title="Action"
            className="shadow-md bg-blue text-white"
          >
            <Dropdown.Item
              onClick={() => handleViewBill(row)}
              className="text-dark"
            >
              <i className="fa-solid fa-circle-info"></i> View Bill
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => handleUpdateBill(row)}
              className="text-dark"
            >
              <i className="fa-solid fa-arrows-rotate"></i> Upgrade Bill
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => handlePayNow(row)}
              className="text-dark"
            >
              <i className="fa-regular fa-credit-card"></i> Pay Now
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => setDeactivatedetails(row)}
              data-bs-toggle="modal"
              className="text-dark"
              data-bs-target="#staticBackdrop"
            >
              <i className="fa-solid fa-ban"></i> Deactivate Bill
            </Dropdown.Item>
          </DropdownButton>
        </div>
      ),
    },
  ];
  const filteredItems = data.filter(
    (item) =>
      item.property?.buildingName &&
      item.property?.buildingName
        .toLowerCase()
        .includes(filterText.toLowerCase())
  );
  useEffect(() => {
    console.log("deactivatedetails", deactivatedetails);
  }, [deactivatedetails]);
  const reversedFilteredItems = [...filteredItems].reverse();

  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };

    return (
      <FilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
        placeholder="Search By Property Name"
      />
    );
  }, [filterText, resetPaginationToggle]);

  useEffect(() => {
    if (selectedBillToBePaid) {
      navigate("paymentgateway", {
        state: { selectedItem: selectedBillToBePaid },
      });
    }
  }, [selectedBillToBePaid, navigate]);

  const handlePayNow = (item) => {
    setSelectedBillToBePaid(item);
  };

  const handleViewBill = (item) => {
    setSelectedBillToBeViewed(item);
  };

  const handleUpdateBill = (item) => {
    setSelectedBillToBeUpdated(item);
  };

  useEffect(() => {
    if (selectedBillToBeViewed) {
      console.log("Selected View bill:", selectedBillToBeViewed);
      navigate("viewbill", {
        state: { selectedItem: selectedBillToBeViewed },
      });
    }
  }, [selectedBillToBeViewed, navigate]);

  useEffect(() => {
    if (selectedBillToBeUpdated) {
      console.log("Selected bill to be Updated:", selectedBillToBeUpdated);

      navigate("updatebill", {
        state: { selectedItem: selectedBillToBeUpdated },
      });
    }
  }, [selectedBillToBeUpdated, navigate]);

  //api to get table data

  const fetchData = (page) => {
    api
      .get(`billing/${organisationId}?pagenumber=${page}&PageSize=${perPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("response", response);
        setPending(false);
        setData(response.data);
        var paginationData = response.headers["x-pagination"];
        const parsedPaginationData = JSON.parse(paginationData);
        setTotalRows(parsedPaginationData.TotalCount);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      });
  };
  const handleAgentChange = (agents) => {
    setAgent(agents.id);
  };
  useEffect(() => {
    // Fetch data from API and update state
    fetchData(1);
  }, []);

  const handlePageChange = (page) => {
    fetchData(page);
    // const nextPage = currentPage + 1;
    // setCurrentPage(nextPage)
  };
  const handlePerRowsChange = async (newPerPage, page) => {
    setPending(true);

    const response = await api.get(
      `billing/${organisationId}?pagenumber=${page}&PageSize=${newPerPage}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setData(response.data);
    setPerPage(newPerPage);
    setPending(false);
    // console.log("response--->",response.data[0].customers.customerId)
  };

  //api to all bills generated
  useEffect(() => {
    //per-month
    api
      .get(`billing/${organisationId}/count-of-bills-generated-this-month`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setBillsPerMonth(response.data);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      });

    //per-week
    api
      .get(`billing/${organisationId}/count-of-bills-generated-this-week`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setBillsPerWeek(response.data);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      });

    //per-day
    api
      .get(`billing/${organisationId}/count-of-bills-generated-today`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setBillsPerDay(response.data);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      });
  }, []);

  return (
    <>
      <ol className="breadcrumb float-xl-end">
        <li className="breadcrumb-item">
          <Link to="/dashboard">Home</Link>
        </li>
        <li className="breadcrumb-item">Billing</li>
        <li className="breadcrumb-item active">Billing List </li>
      </ol>
      <h1 className="page-header mb-3">Billing List</h1>
      <hr />
      <div className="d-flex flex-row-reverse">
        <Link
          to="generatenewbill"
          className="btn bg-blue-900 shadow-md text-white px-4 ml-3"
        >
          Generate New Bill
        </Link>
        <Link
          to="autogeneratebill"
          className="btn bg-blue-900 shadow-md text-white px-4 ml-3"
        >
          Auto Generate Bill
        </Link>
        <Link
          to="generatebacklogbill"
          className="btn bg-blue-900 shadow-md text-white px-4 ml-3"
        >
          Generate Backlog Bill
        </Link>
        <Link
          to="bulkbillupload"
          className="btn bg-blue-900 shadow-md text-white px-4"
        >
          Bulk Bill Upload
        </Link>
      </div>
      <div className="mt-4 row">
        <div className="col-xl-4">
          <div className="card border-0 mb-3 overflow-hidden bg-white shadow text-dark">
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12 col-lg-8">
                  <div className="mb-3">
                    <b>NO OF BILLS GENERATED THIS MONTH</b>
                  </div>
                  <hr className="text-dark" />
                  <div className="d-flex mb-1">
                    <h2 className="mb-0">
                      {billsPerMonth ? billsPerMonth : <MyLoader />}
                    </h2>
                  </div>
                </div>
                <div className="col-xl-5 col-lg-4 align-items-center d-flex justify-content-center">
                  <img
                    src="/assets/img/svg/img-1.svg"
                    alt=""
                    height="150px"
                    className="d-none d-lg-block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card border-0 mb-3 overflow-hidden bg-white shadow text-dark">
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12 col-lg-8">
                  <div className="mb-3 ">
                    <b>NO OF BILLS GENERATED THIS WEEK</b>
                  </div>
                  <hr className="text-dark" />

                  <div className="d-flex mb-1">
                    <h2 className="mb-0">
                      {billsPerWeek ? billsPerWeek : <MyLoader />}
                    </h2>
                  </div>
                </div>
                <div className="col-xl-5 col-lg-4 align-items-center d-flex justify-content-center">
                  <img
                    src="/assets/img/svg/img-1.svg"
                    alt=""
                    height="150px"
                    className="d-none d-lg-block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card border-0 mb-3 overflow-hidden bg-white shadow text-dark">
            <div className="card-body">
              <div className="row">
                <div className="col-xl-12 col-lg-8">
                  <div className="mb-3">
                    <b>NO OF BILLS GENERATED TODAY</b>
                  </div>
                  <hr className="text-dark" />

                  <div className="d-flex mb-1">
                    <h2 className="mb-0">
                      {billsPerDay ? billsPerDay : <MyLoader />}{" "}
                    </h2>
                  </div>
                </div>
                <div className="col-xl-5 col-lg-4 align-items-center d-flex justify-content-center">
                  <img
                    src="/assets/img/svg/img-1.svg"
                    alt=""
                    height="150px"
                    className="d-none d-lg-block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <DataTable
          columns={columns}
          data={reversedFilteredItems}
          pagination
          paginationRowsPerPageOptions={customRowsPerPageOptions}
          progressPending={pending}
          paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          paginationServer
          paginationTotalRows={totalRows} // Replace with the total count of your data
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
        />
      </div>
      <button
        style={{ marginTop: "20px" }}
        className="btn shadow-md bg-blue-900 text-white"
        type="button"
        onClick={() => window.history.back()}
      >
        Back
      </button>

      <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Deactivate Bill for Property:{" "}
                {deactivatedetails?.property?.buildingName
                  ? deactivatedetails?.property?.buildingName
                  : ""}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {deactivatedetails && (
                <>
                  <div className="mb-3">
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                    >
                      Property
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      disabled
                      value={deactivatedetails?.property?.buildingName}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                    >
                      Rate-payer Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      disabled
                      value={deactivatedetails?.customers?.fullName}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                    >
                      Agency
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      disabled
                      value={deactivatedetails?.agencies?.agencyName}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                    >
                      Revenue
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      disabled
                      value={deactivatedetails?.revenues?.revenueName}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                    >
                      Category
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput1"
                      disabled
                      value={deactivatedetails?.category}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="row">
                      <div className="col">
                        <label
                          for="exampleFormControlInput1"
                          className="form-label"
                        >
                          Amount
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleFormControlInput1"
                          disabled
                          value={deactivatedetails?.billAmount}
                          placeholder="name@example.com"
                        />
                      </div>
                      {deactivatedetails?.harmonizedBillReferenceNo && (
                        <div className="col">
                          <label
                            for="exampleFormControlInput1"
                            className="form-label"
                          >
                            Harmonized BillReference No
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="exampleFormControlInput1"
                            disabled
                            value={deactivatedetails?.harmonizedBillReferenceNo}
                            placeholder="name@example.com"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label
                      for="exampleFormControlInput1"
                      className="form-label"
                    >
                      Request Approval From:
                    </label>
                    <Select
                      id="category"
                      className="basic-single"
                      classNamePrefix="Select Admin to Request Approval from"
                      name="category"
                      defaultValue="Select Admin"
                      options={transformedAgents}
                      onChange={handleAgentChange}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => requestApproval()}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillingList;
