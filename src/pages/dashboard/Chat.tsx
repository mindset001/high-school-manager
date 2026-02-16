import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { getStudents } from "../../services/api/calls/getApis";
// import { getClass } from "../../services/api/calls/getClass";
// import { useQuery } from "@tanstack/react-query";
// import { getClass, getClassStat, getStudents } from "../../services/api/calls/getApis";
// import { getClassStat } from "../../services/api/calls/getClassStat";

const Chat: React.FC = () => {
  // GETTING CLASS Data
  const {
    data: studentsData,
    isError: isStudentsError,
    // error: studentsError,
    isLoading: isStudentsLoading,
  } = useQuery({
    queryKey: ["Wards"],
    queryFn: () => getStudents(),
    // enabled: classNameID.length > 0,
    // enabled: classNameID.length > 0 ? true : false,
  });

  useEffect(() => {
    console.log(
      "classStudent Data :",
      studentsData,
      isStudentsError,
      isStudentsLoading
    );
  }, [studentsData, isStudentsError, isStudentsLoading]);

  // const {
  //   data: studentsIdData,
  //   isError: isStudentsIdError,
  //   // error: studentsIdError,
  //   isLoading: isStudentsIdLoading,
  // } = useQuery({
  //   queryKey: ["StudentsId", 8],
  //   queryFn: () => getStudentsId(9),
  //   // enabled: classNameID.length > 0,
  //   // enabled: classNameID.length > 0 ? true : false,
  // });

  // useEffect(() => {
  //   console.log(
  //     "classStudentID Dataaaaaaaaa :",
  //     studentsIdData,
  //     isStudentsIdError,
  //     isStudentsIdLoading
  //   );
  // }, [studentsIdData, isStudentsIdError, isStudentsIdLoading]);
  // const {
  //   data: classData,
  //   isError: isClassError,
  //   error: classError,
  //   isLoading: isClassLoading
  // } = useQuery({
  //   queryKey: ["class"],
  //   queryFn: () => getClass(),
  // });

  // // GETTING CLASS Students Data by ID
  // const {
  //   data: classIdData,
  //   isError: isClassIdError,
  //   error: classIdError,
  //   isLoading: isClassIdLoading
  // } = useQuery({
  //   queryKey: ["class", 'K.g 2 C'],
  //   queryFn: () => getStudents(39),
  // });
  // // GETTING CLASS STATS Data
  // const {
  //   data: classStatData,
  //   isError: isClassStatError,
  //   error: classStatError,
  //   isLoading: isClassStatLoading
  // } = useQuery({
  //   queryKey: ["classStat"],
  //   queryFn: () => getClassStat(),
  // });

  // useEffect(() => {
  //   const classId = classIdData && classIdData.data.data || [];
  //   console.log("Class Id Data:", classId, isClassIdError, classIdError, isClassIdLoading);
  // }, [classIdData, classIdError, isClassIdError, isClassIdLoading]);

  // useEffect(() => {
  //   const classes = classData && classData.data.data || [];
  //   console.log("Class Data:", classes, isClassError, classError, isClassLoading);
  // }, [classData, classError, isClassError, isClassLoading]);

  // useEffect(() => {
  //   const classStats = classStatData && classStatData.data.data || [];
  //   console.log("Class Stats:", classStats, isClassStatError, classStatError, isClassStatLoading);
  // }, [classStatData, classStatError, isClassStatError, isClassStatLoading]);
  return <div className="text-center">Chat</div>;
};

export default Chat;
