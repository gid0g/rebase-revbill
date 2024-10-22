import React, { useState, useEffect, useContext } from "react";
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
import { AppSettings } from "../../config/app-settings";

const BillingList = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("myToken");
  const organisationId = sessionStorage.getItem("organisationId");
  const appSettings = useContext(AppSettings);
  const userData = appSettings.userData;
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
  const [agent, setAgent] = useState("");
  const [modalInstance, setModalInstance] = useState(null);
  const [harminozedset, seHarmonizedset] = useState({});
  const [TobeView, setTobeView] = useState([]);
  const [group, setGroup] = useState([]);
  const [harmonizedbills, setHarmonizedbills] = useState({});

  const adminplaceholder = [
    {
      id: "toluwalaseoludipe7@gmail.com",
      AdminName: "Toluwalase Oludipe",
    },
    {
      id: "iamtremor101@gmail.com",
      AdminName: "Timothy Tremor",
    },
    {
      id: "olasubomiesther14@gmail.com",
      AdminName: "Abiola Olasubomi",
    },
    {
      id: "gideonogordi@gmail.com",
      AdminName: "Ogordi Gideon",
    },
    {
      id: "gideonogordi@gmail.com",
      AdminName: "Abayomi Richard",
    },
    {
      id: "paogordi@gmail.com",
      AdminName: "Oluwole Temiloluwa",
    },
  ];

  const transformedAgents = adminplaceholder
    ? adminplaceholder.map((item) => ({
        label: item.AdminName,
        value: item.id,
      }))
    : "";

  const requestApproval = async (e) => {
    const confirmation = window.confirm("Do you want to deactivate bill?");
    const payload = {
      approvalBillStatusId: 6,
      approver: agent,
      dateModified: new Date().toISOString(),
      modifiedBy: userData[0].email,
    };
    console.log(
      "payload--------------",
      payload,
      `billing/${organisationId}/bill/${deactivatedetails?.billId}/initiatestepdown`
    );
    if (confirmation) {
      await api
        .post(
          `billing/${organisationId}/bill/${deactivatedetails?.billId}/initiatestepdown`,
          {
            approvalBillStatusId: 6,
            approver: agent,
            dateModified: new Date().toISOString(),
            modifiedBy: userData[0].email,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          console.log("Response----------", response)
          if (response.status == 200) {
            if (response.statusMessage == "approver does not exists") {
              toast.info("Approver does not exists", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
            } else {
              toast.success(response.statusMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
            }
            return true;
          }
        })
        .catch((error) => {
          console.log("Error-----------", error)
          if (error.response) {
            if (error.response.status === 422) {
              let errorMessages = [];
              for (const response in error.response.data) {
                error.response.data[response].forEach((errorMessage) => {
                  errorMessages.push(errorMessage);
                });
              }
              errorMessages.forEach((errorMessage) => {
                toast.error(errorMessage, {
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
            }
            toast.error(error.response.message, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
          } else
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
        <>
          {row.harmonizedBillReferenceNo !== null ? (
            <button
              className="btn shadow-md bg-blue text-white m-1"
              onClick={() => {
                seHarmonizedset(row);
                Viewmore(row);
              }}
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop2"
            >
              View More
            </button>
          ) : (
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
          )}
        </>
      ),
    },
  ];

  const columns2 = [
    {
      name: "S/N",
      selector: (row, index) => reversedFilteredViews.indexOf(row) + 1,
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
        <div>
          <button
            className="text-dark fw-bold"
            data-bs-dismiss="modal"
            aria-label="Close"
            onClick={() => handleViewBill(row)}
          >
            <i className="fa-solid fa-circle-info" /> View Bill
          </button>
          <hr />
          <button
            className="text-dark fw-bold"
            data-bs-dismiss="modal"
            aria-label="Close"
            onClick={() => handleUpdateBill(row)}
          >
            <i className="fa-solid fa-arrows-rotate" /> Upgrade Bill
          </button>
          <hr />
          <button
            className="text-dark fw-bold"
            data-bs-dismiss="modal"
            aria-label="Close"
            onClick={() => handlePayNow(row)}
          >
            <i className="fa-regular fa-credit-card" /> Pay Now
          </button>
          <hr />

          <button
            onClick={() => setDeactivatedetails(row)}
            data-bs-toggle="modal"
            className="text-dark fw-bold"
            data-bs-target="#staticBackdrop"
          >
            <i className="fa-solid fa-ban" /> Deactivate Bill
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const currentset = harmonizedbills[
      `${harminozedset.harmonizedBillReferenceNo}`
    ] || [harminozedset];
    setTobeView(currentset);
    console.log("harminoziedset----------", harminozedset, currentset);
  }, [harminozedset]);
  const Viewmore = () => {};
  const filteredViews =
    TobeView?.filter(
      (item) =>
        item.property?.buildingName &&
        item.property?.buildingName
          .toLowerCase()
          .includes(filterText.toLowerCase())
    ) ?? [];
  const reversedFilteredViews = [...filteredViews].reverse();

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

  const groupedBill = (billset) => {
    const groupedBills = billset.reduce((acc, current) => {
      const harmonizedBillReferenceNo = current.harmonizedBillReferenceNo;
      if (harmonizedBillReferenceNo !== null) {
        if (!acc[harmonizedBillReferenceNo]) {
          acc[harmonizedBillReferenceNo] = [current];
        } else {
          acc[harmonizedBillReferenceNo].push(current);
        }
      }
      return acc;
    }, {});

    const nullBills = billset.filter(
      (bill) => bill.harmonizedBillReferenceNo === null
    );

    console.log("Billing set-------------------", {
      ...groupedBills,
      nullBills,
    });
    setHarmonizedbills({ ...groupedBills, nullBills });

    const newGroup = [];
    Object.values(groupedBills).forEach((item) => {
      newGroup.push(item[0]);
    });
    nullBills.forEach((item) => {
      newGroup.push(item);
    });
    setGroup(newGroup);
  };
  useEffect(() => {
    console.log("Billing set-------------------2", group);
    setData(group);
  }, [group]);
  const fetchData = (page) => {
    api
      .get(`billing/${organisationId}?pagenumber=${page}&PageSize=${perPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        groupedBill(response.data);
        setPending(false);
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
    console.log("new Agent", agents.value)
    setAgent(agents.value);
  };
  useEffect(() => {
    fetchData(1);
  }, []);

  const handlePageChange = (page) => {
    fetchData(page);
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
    groupedBill(response.data);
    setPerPage(newPerPage);
    setPending(false);
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
          paginationResetDefaultPage={resetPaginationToggle}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          paginationServer
          paginationTotalRows={totalRows}
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
        class="modal fade"
        id="staticBackdrop2"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="staticBackdropLabel">
                {harminozedset?.harmonizedBillReferenceNo
                  ? `Bills with harmonizedBillReferenceNo of  ${harminozedset.harmonizedBillReferenceNo}`
                  : `Bills with billReferenceNo of  ${harminozedset.billReferenceNo}`}
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <DataTable
                columns={columns2}
                data={reversedFilteredViews}
                pagination
                subHeader
                subHeaderComponent={subHeaderComponentMemo}
                paginationServer
              />
            </div>
          </div>
        </div>
      </div>

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
                Initiate Stepdown 
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillingList;
