import React, { useState, useEffect, useContext, useCallback } from "react";

const EnumerateBilling = () => {
  // ...

  const fetchBusinessType = useCallback(async () => {
    if (Enum[0]?.businessTypeId) {
      const updatedFields = [...existingCustomerFields];
      updatedFields[0].businessTypeId = Enum[0]?.businessTypeId;
      setExistingCustomerFields((prevState) => [
        {
          ...prevState[0],
          businessTypeId: Enum[0]?.businessTypeId,
        },
        ...prevState.slice(1),
      ]);
      try {
        await api
          .get(`enumeration/${organisationId}/business-types`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            console.log("Business Size:", response.data);
            setBusinessType(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    }
  }, [Enum, existingCustomerFields, organisationId, token]);

  useEffect(() => {
    fetchBusinessType();
  }, [fetchBusinessType]);

  const fetchBusinessSize = useCallback(async () => {
    if (Enum) {
      const updatedFields = [...existingCustomerFields];
      updatedFields[0].businessSizeId = Enum[0]?.businessSizeId;
      setExistingCustomerFields((prevState) => [
        {
          ...prevState[0],
          businessSizeId: Enum[0]?.businessSizeId,
          createdBy: `${userData[0]?.email}`,
          agencyId: agencyId,
        },
        ...prevState.slice(1),
      ]);
      try {
        api
          .get(`enumeration/${organisationId}/business-sizes`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            console.log("businesssss", response.data);
            setBusinessSize(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    }
  }, [Enum, existingCustomerFields, organisationId, token, userData, agencyId]);

  useEffect(() => {
    fetchBusinessSize();
  }, [fetchBusinessSize]);

  const fetchRevenueCategories = useCallback(
    async (revenueIds) => {
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
    },
    [organisationId, token]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      if (originalRevenues?.length > 0) {
        setIsCategoriesLoading(true);

        try {
          const fetchRevenues = await fetchRevenueCategories(originalRevenues);
          setCategories(fetchRevenues);
          setIsCategoriesLoading(false);
        } catch (error) {
          console.error(error);
          setIsCategoriesLoading(false);
        }
      }
    };

    fetchCategories();
  }, [originalRevenues, fetchRevenueCategories]);

  const fetchRevenues = useCallback(async () => {
    const promises = Enum.map((field) => {
      if (originalRevenues?.length > 0) {
        return api
          .get(
            `revenue/${organisationId}/business-type/${field.businessTypeId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((response) => response.data);
      } else {
        return [];
      }
    });

    Promise.all(promises)
      .then((responses) => {
        setRevenues(responses.flat());
      })
      .catch((error) => {
        console.log(error);
      });
  }, [Enum, originalRevenues, organisationId, token]);

  useEffect(() => {
    fetchRevenues();
  }, [fetchRevenues]);

  const transformedRevenueCategoryOptions = useCallback(
    (search, index) => {
      console.log("search this", index, search, originalRevenues, categories);
      const filteredCategories = categories.map((category) => {
        const filteredData = category.filter((item) =>
          originalRevenues?.includes(item.revenueId)
        );
        return {
          data: filteredData,
        };
      });

      console.log("filteredCategories", filteredCategories);

      const filteredCategoriesForIndex = filteredCategories.find((category) =>
        category.data.some((item) => item.revenueId === search)
      );

      console.log("filteredCategoriesForIndex", filteredCategoriesForIndex);

      const options =
        filteredCategoriesForIndex?.data?.map((item) => ({
          value: item.categoryId,
          label: item.categoryName,
          amount: item.amount,
          revenue: item.revenueId,
        })) || [];

      return options;
    },
    [categories, originalRevenues]
  );

  // ...
};

export default EnumerateBilling;
