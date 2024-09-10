import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../axios/custom";
import { AppSettings } from "../../config/app-settings";
import { CompressOutlined } from "@mui/icons-material";

const Updatebill = () => {
  const token = sessionStorage.getItem("myToken");
  const organisationId = sessionStorage.getItem("organisationId");
  const appSettings = useContext(AppSettings);
  const userData = appSettings.userData;
  const location = useLocation();
  const [billData, setBillData] = useState([]);
  // const [customerid, setCustomerid] = useState();
  const [sections, setSections] = useState([]);
  const selectedItem = location.state?.selectedItem;
  const [businessize, setBusinessize] = useState([]);
  const [agency, setAgency] = useState([]);
  const [businesstype, setBusinessType] = useState([]);
  const [frequency, setFrequency] = useState([]);
  const [businessSizeId, setbusinessSizeId] = useState("");
  const [categoryId, setCategoryId] = useState({});
  const customerid = selectedItem.customers.customerId;
  const revenueId = selectedItem?.revenues.revenueId;
  const [categoriesOld, setCategoriesOld] = useState([]);
  const [categories, setCategories] = useState([]);
  const [businessTypeId, setBusinessTypeId] = useState("");
  console.log(
    "selectedItem-----------",
    selectedItem,
    customerid,
    selectedItem.harmonizedBillReferenceNo,
    selectedItem.billReferenceNo
  );
  const billID = selectedItem?.billId;
  const AppliedDate = selectedItem?.appliedDate;
  const Agency = selectedItem?.agencies.agencyName;
  const defaultBusinessSize = selectedItem?.businessSize.id;
  const defaultcategory = selectedItem?.category;
  const defaultAmount = selectedItem.billAmount;
  const harmonisedBill = selectedItem.harmonizedBillReferenceNo
    ? selectedItem?.harmonizedBillReferenceNo
    : selectedItem?.billReferenceNo;
  console.log("harmonisedBill-----------", harmonisedBill);
  const addSection = () => {
    const newSection = {
      id: sections.length + 1,
      billId: billID,
      agencyId: Agency,
      appliedDate: AppliedDate,
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionIdToRemove) => {
    const updatedSections = sections.filter(
      (section) => section.id !== sectionIdToRemove
    );
    setSections(updatedSections);
  };

  const handleUpdateBill = async () => {
    try {
      const updateBillDto = sections.map((section) => ({
        billId: section.billId,
        agencyId: section.agencyId,
        revenueId: section.revenueId,
        billAmount: section.billAmount,
        category: section.category,
        businessTypeId: section.businessTypeId,
        businessSizeId: section.businessSizeId,
        appliedDate: section.appliedDate,
        dateModified: new Date().toISOString(),
        modifiedBy: userData[0]?.email,
      }));

      const response = await api.post(
        `billing/${organisationId}/property/${billData[0]?.property.propertyId}/customer/${customerid}/update-bill`,
        updateBillDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Bill updated successfully", {
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
    } catch (error) {
      toast.error("Failed to update bill", {
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
  };

  const transformedCategories = categoriesOld
    ? categoriesOld.map((item) => ({
        label: item.categoryName,
        value: item.categoryId,
        amount: item.amount,
        revenue: item.revenueId,
      }))
    : "";
  const defaultOptioncategory = transformedCategories.find(
    (option) => option.label === defaultcategory
  );
  const transformedbusinessize = businessize
    ? businessize.map((item) => ({
        label: item.businessSizeName,
        value: item.id,
      }))
    : "";
  const defaultOption = transformedbusinessize.find(
    (option) => option.value === defaultBusinessSize
  );
  const handlebusinessSizeChange = (event, idx) => {
    const updatedFields = [...sections];
    updatedFields[idx].businessSizeId = event.value;
    setSections(updatedFields);
  };
  const [categoryAmounts, setCategoryAmounts] = useState([]);

  const handleCategoryChange = (selectedCategory, index, idx) => {
     const updatedFields = [...sections];
     updatedFields[index].billAmount = selectedCategory.amount;
    setSections(updatedFields);
          const newCategoryAmounts = [...categoryAmounts];
          newCategoryAmounts[idx] = selectedCategory?.amount;
          setCategoryAmounts(newCategoryAmounts);
          setIsAmountVisible(true);
  };

  useEffect(() => {
    api
      .get(`enumeration/${organisationId}/business-sizes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setBusinessize(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    //fetch all frequencies
    api
      .get("billing/frequency", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setFrequency(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    //fetch all business types
    api
      .get(`enumeration/${organisationId}/business-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setBusinessType(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    //fetch all agencies
    api
      .get(`enumeration/${organisationId}/agencies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setAgency(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    // fetch all categories
    api
      .get(`revenue/${organisationId}/revenueprice-revenue/${revenueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("categoriesssssss--------", response.data);
        setCategoriesOld(response.data);
      })

      .catch((error) => {
        console.log(error);
      });
  }, [organisationId, token]);
  useEffect(() => {
    if (selectedItem.harmonizedBillReferenceNo) {
      api
        .get(
          `billing/${organisationId}/bill/customer/${customerid}/harmonized/${harmonisedBill}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          console.log("API response for billData:", response);
          setBillData(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      api
        .get(`billing/${organisationId}/bill/${billID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log("API response for billData:", response);
          setBillData([response.data]);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [token, organisationId, customerid, harmonisedBill]);

  console.log(billData);
  /////////////////////////////////////////////////
  const transformedBusinessType = businesstype
    ? businesstype.map((item) => ({
        label: item.businessTypeName,
        value: item.id,
      }))
    : [];
  const [revenueType, setRevenueType] = useState({
    0: {
      types: [],
    },
  });
  const [categoryType, setCategoryType] = useState({
    0: {
      types: [],
    },
  });
  const [amountType, setAmountType] = useState({
    0: {
      types: [],
    },
  });
  const [isRevenueTypeVisible, setIsRevenueTypeVisible] = useState(false);

  const handleTypeChange = async (event, idx) => {
    console.log("businessType", event.value);
    //////////////////
    const updatedFields = [...sections];
    updatedFields[idx].businessTypeId = event.value;
    setSections(updatedFields);

    setIsRevenueTypeVisible(true);
    const types = await api
      .get(`revenue/${organisationId}/business-type/${event.value}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("got revenuetypes:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.log("Errrrrrrrrrrrrrrrrrrrrrrr", error);
      });

    setRevenueType({
      ...revenueType,
      [idx]: {
        types: types,
      },
    });
  };
  const [selectedRevenueItems, setSelectedRevenueItems] = useState([]);
  const [checkedRevenues, setCheckedRevenues] = useState([]);

  function handleRevenueChange(idx, event) {
    const { checked } = event.target;
    const value = event.target.value;
    const updatedFields = [...sections];
    setSections(updatedFields);
    setSelectedRevenueItems((prevSelectedItems) => [
      ...prevSelectedItems,
      updatedFields[idx].revenueId,
    ]);
  }
  const handleCheckedRevenueChange = (revenueId) => {
    if (revenueId) {
      setCheckedRevenues((prevCheckedRevenues) => {
        if (prevCheckedRevenues.includes(revenueId)) {
          const filteredCheckedCategories = prevCheckedRevenues.filter(
            (id) => id !== revenueId
          );
          return filteredCheckedCategories;
        } else {
          return [...prevCheckedRevenues, revenueId];
        }
      });
    }
  };
  useEffect(() => {
    console.log("Sections", sections);
  }, [sections]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const fetchRevenueCategories = async (revenueIds) => {
    console.log("Organization ID:", organisationId);
    console.log("Revenue ID:", revenueIds);
    const apiEndpoints = revenueIds.map(
      (revenueId) =>
        `revenue/${organisationId}/revenueprice-revenue/${revenueId}`
    );

    try {
      const responses = await Promise.all(
        apiEndpoints.map((apiEndpoint) =>
          api.get(apiEndpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      console.log("Categories", responses);

      const fetchedRevenuesCategories = responses.map(
        (response) => response.data
      );
      return fetchedRevenuesCategories;
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    console.log("Checked Revenues:", checkedRevenues);

    const fetchCategories = async () => {
      if (checkedRevenues.length > 0) {
        setIsCategoriesLoading(true);

        try {
          const fetchedRevenues = await fetchRevenueCategories(checkedRevenues);
          setCategories(fetchedRevenues);
          setIsCategoriesLoading(false);
        } catch (error) {
          console.error(error);
          setIsCategoriesLoading(false);
        }
      }
    };

    fetchCategories();
  }, [checkedRevenues]);
  const transformedRevenueCategoryOptions = (index) => {
    
    const filteredCategories = categories.map((category) => {

      const filteredData = category.filter((item) =>
        checkedRevenues.includes(item.revenueId)
      );

      return {
        data: filteredData,
      };
    });


    // Get the filtered categories for the selected revenueId
    const filteredCategoriesForIndex = filteredCategories[index];
    // Category options
    const options = filteredCategoriesForIndex?.data?.map((item) => ({
      value: item.categoryId,
      label: item.categoryName,
      amount: item.amount,
      revenue: item.revenueId,
    }));
    console.log("Options---------------", options);

    return options;
  };
  const [isAmountVisible, setIsAmountVisible] = useState(false);
  
  //////////////////////////////////////
  return (
    <>
      <ol className="breadcrumb float-xl-end">
        <li className="breadcrumb-item">
          <Link to="/dashboard">Home</Link>
        </li>
        <li className="breadcrumb-item">Billing List</li>
        <li className="breadcrumb-item active">Update Bill </li>
      </ol>

      <h1 className="page-header mb-3">Update Bill</h1>

      <hr />
      <form className=" ">
        <div className="space-y-1 mt-4 ">
          <div className=" pb-2">
            <div className=" grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Property Address
                </label>
                <div className="mt-2">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isDisabled={true}
                    value={{
                      value:
                        billData[0]?.property.buildingName || "defaultValue",
                      label:
                        billData[0]?.property.buildingName || "Default Label",
                    }}
                  />
                </div>
              </div>
              <div className="col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Rate-Payer Details
                </label>
                <div className="mt-2">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isDisabled={true}
                    value={{
                      value: billData[0]?.customers.fullName || "defaultValue",
                      label: billData[0]?.customers.fullName || "Default Label",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <hr className="font-black mt-5" />
          {billData.map((bill, outerIndex) => (
            <div className="mt-3 " key={outerIndex}>
              <div className="flex gap-4">
                <div className="w-50">
                  <label
                    htmlFor="city"
                    className="block text-lg font-medium leading-6 text-gray-900"
                  >
                    Business Type
                  </label>
                  <div className="mt-2">
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isDisabled={true}
                      value={{
                        value: bill.businessType.businessTypeName,
                        label: bill.businessType.businessTypeName,
                      }}
                    />
                  </div>
                </div>
                <div className="w-50 ">
                  <label
                    htmlFor="city"
                    className="block text-lg font-medium leading-6 text-gray-900"
                  >
                    Business Size
                  </label>
                  <div className="mt-2">
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      name="color"
                      options={transformedbusinessize}
                      defaultValue={defaultOption}
                      onChange={handlebusinessSizeChange}
                    />
                  </div>
                </div>
              </div>
              <fieldset className="col-span-6 mt-3 ">
                <legend className="text-lg font-medium leading-6 text-gray-900">
                  Revenue Type/Code
                </legend>
                <div className="mt-2 gap-x-5 flex overflow-auto">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input "
                      type="radio"
                      isDisabled={true}
                      value={bill.revenues.revenueId}
                    />
                    <label className="form-check-label" htmlFor="checkbox1">
                      {bill.revenues.revenueName}
                    </label>
                  </div>
                </div>
              </fieldset>
              <div className="flex mt-3 gap-3">
                <div className="w-50 ">
                  <label
                    htmlFor="city"
                    className="block text-lg font-medium leading-6 text-gray-900"
                  >
                    Agency Area
                  </label>
                  <div className="mt-2">
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isDisabled={true}
                      value={{
                        value: bill.agencies.agencyName || "defaultValue",
                        label: bill.agencies.agencyName || "Default Label",
                      }}
                    />
                  </div>
                </div>
                <div className="w-50  ">
                  <label
                    htmlFor="category"
                    className="block text-lg font-medium leading-6 text-gray-900"
                  >
                    Category
                  </label>
                  <div className="mt-2">
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      name="color"
                      options={transformedCategories}
                      defaultValue={defaultOptioncategory}
                      onChange={handleCategoryChange}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <div className="w-50 ">
                  <label
                    htmlFor="category"
                    className="block text-lg font-medium leading-6 text-gray-900"
                  >
                    Applied Date
                  </label>
                  <div className="mt-2 ">
                    <div className="">
                      <input
                        style={{
                          backgroundColor: "#f2f2f2",
                          pointerEvents: "none",
                        }}
                        className="form-control"
                        name="amount"
                        readOnly
                        value={bill.appliedDate || "default-value"}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-3 ">
                  <label
                    htmlFor="city"
                    className="block text-lg font-medium leading-6 text-gray-900"
                  >
                    Amount
                  </label>
                  <div className="mt-2">
                    <div className="">
                      <input
                        style={{
                          backgroundColor: "#f2f2f2",
                          pointerEvents: "none",
                        }}
                        className="form-control"
                        name="amount"
                        readOnly
                        defaultValue={defaultAmount}
                        value={categoryId?.amount}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <hr className="font-black mt-5" />
            </div>
          ))}
        </div>
        {sections.map((section, index) => (
          <div className="mt-3 " key={section.id}>
            <div className="flex gap-4">
              <div className="w-50">
                <label
                  htmlFor="city"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Business Type
                </label>
                <div className="mt-2">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    defaultValue="Select Business Type"
                    name="color"
                    options={transformedBusinessType}
                    onChange={(selectedOption) =>
                      handleTypeChange(selectedOption, index)
                    }
                  />
                </div>
              </div>
              <div className="w-50 ">
                <label
                  htmlFor="city"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Business Size
                </label>
                <div className="mt-2">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    name="color"
                    options={transformedbusinessize}
                    onChange={(selectedOption) => {
                      handlebusinessSizeChange(selectedOption, index);
                    }}
                  />
                </div>
              </div>
            </div>
            <fieldset className="col-span-6 mt-3 ">
              <legend className="text-lg font-medium leading-6 text-gray-900">
                Revenue Type/Code
              </legend>
              <div className="mt-2 gap-x-5 flex overflow-auto">
                {revenueType[index]?.types?.map((revenue) => {
                  return (
                    <div
                      key={revenue.revenueId}
                      className="form-check form-check-inline"
                    >
                      <input
                        className="form-check-input "
                        type="checkbox"
                        name={`revenueId${index}`}
                        value={revenue.revenueId}
                        onChange={(event) => {
                          handleRevenueChange(index, event);
                          handleCheckedRevenueChange(revenue.revenueId);
                        }}
                      />
                      <label className="form-check-label" htmlFor="checkbox1">
                        {revenue.revenueName}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            {categories &&
              categories.length !== 0 &&
              categories.map((category, idx) => {
                return (
                  <div key={index} className="flex gap-3 mt-4">
                    <div className="w-50">
                      <label
                        htmlFor={`category_${index}`}
                        className="block text-lg font-medium leading-6 text-gray-900"
                      >
                        Category
                      </label>
                      <div className="mt-2">
                        <Select
                          id={`category_${index}`}
                          className="basic-single w-50"
                          classNamePrefix="select"
                          name={`category_${index}`}
                          options={transformedRevenueCategoryOptions(idx)}
                          onChange={(selectedOption) => {
                            handleCategoryChange(selectedOption, index, idx);
                          }}
                        />
                      </div>
                    </div>
                    {isAmountVisible && (
                      <div className="w-50">
                        <label
                          htmlFor={`amount_${index}`}
                          className="block text-lg font-medium leading-6 text-gray-900"
                        >
                          Amount
                        </label>
                        <div className="mt-2">
                          <input
                            id={`amount_${idx}`}
                            className="form-control"
                            value={categoryAmounts[idx]}
                            name={`amount_${idx}`}
                            readOnly
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            <div className="flex mt-3 gap-3">
              <div className="w-50 ">
                <label
                  htmlFor="city"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Agency Area
                </label>
                <div className="mt-2">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isDisabled={true}
                    value={{
                      value: billData[0].agencies.agencyName || "defaultValue",
                      label: billData[0].agencies.agencyName || "Default Label",
                    }}
                  />
                </div>
              </div>
              <div className="w-50 ">
                <label
                  htmlFor="category"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Applied Date
                </label>
                <div className="mt-2 ">
                  <div className="">
                    <input
                      style={{
                        backgroundColor: "#f2f2f2",
                        pointerEvents: "none",
                      }}
                      className="form-control"
                      name="amount"
                      readOnly
                      value={billData[0]?.appliedDate || "default-value"}
                    />
                  </div>
                </div>
              </div>
            </div>
      
            <button
              className="btn btn-danger mt-2"
              onClick={(event) => {
                event.preventDefault();
                removeSection(section.id);
              }}
            >
              Delete
            </button>
            <hr className="font-black mt-5" />
          </div>
        ))}
      </form>
      <div className="mr-2">
        <button
          type="button"
          onClick={addSection}
          className="btn btn-default mt-1"
        >
          Add More Bills
        </button>
      </div>
      <div className=" items-center	mt-5 gap-3 flex flex-row-reverse">
        <div className="">
          <button
            className="btn bg-primary text-white rounded-0 "
            onClick={handleUpdateBill}
          >
            Update Bill
          </button>
        </div>
      </div>
    </>
  );
};

export default Updatebill;
