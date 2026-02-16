// import React from 'react'

import { useQuery } from "@tanstack/react-query";
// import { getGuardianWardId } from "../services/api/calls/getApis";
import { useEffect, useMemo } from "react";
// import { getUser } from "../utils/authTokens";
import { userGuardWardDataI } from "../types/user.type";
import { getGuardianWard } from "../services/api/calls/getApis";
import { getRole } from "../utils/authTokens";

const useGuardianWard = () => {
  const role = getRole() as string;
  // // USER
  // const user = getUser();

  // useEffect(() => {
  //   console.log("User", user);
  // }, [user]);

  const {
    data: guardianWardData,
    isError: isGuardianWardError,
    error: guadianWardError,
    isLoading: isGuardianWardLoading,
  } = useQuery({
    queryKey: ["guardianWards"],
    queryFn: getGuardianWard,
    enabled: role.toLowerCase() === "guardian",
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });

  const guardianWard : userGuardWardDataI = useMemo(() => {
    if (!guardianWardData || !guardianWardData.data) {
      return [];
    }
    // Backend returns { wards: [...] }
    return guardianWardData.data.wards || [];
  }, [guardianWardData]);
  
  useEffect(() => {
    console.log(
      "guardianWardData Dataaaaaaaaa :",
      guardianWardData,
      isGuardianWardError,
      guadianWardError,
      isGuardianWardLoading
    );
  }, [
    guadianWardError,
    guardianWardData,
    isGuardianWardError,
    isGuardianWardLoading,
  ]);
  return {
    guardianWard,
    isGuardianWardLoading,
    guadianWardError,
    isGuardianWardError,
  };
};

export default useGuardianWard;
