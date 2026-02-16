import React, { useEffect, useMemo, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Pencil } from "../../assets/images/dashboard/calendar";
import {
  Add,
  FilterMobile,
  PathDown,
  PathRight,
  PathUp,
} from "../../assets/images/dashboard/students";
import TuitionFinance from "../../components/admin-dashboard/TuitionFinance";
import { Link, useNavigate } from "react-router-dom";
import CircularProgressBar from "../../components/dashboard/CircularProgressBar";
import GuardianSVG from "../../components/svg/GuardianSVG";
import { useQuery } from "@tanstack/react-query";
// import { getClassStat } from "../../services/api/calls/getClassStat";
import Loader from "../../shared/Loader";
// import { getBaseClass } from "../../services/api/calls/getBaseClass";
import { baseClassInterface } from "../../types/user.type";
import { getBaseClass, getClassStat } from "../../services/api/calls/getApis";

const classStatsTableHeader: string[] = [
  "Class",
  "Completed (%)",
  "Incomplete (%)",
  "Void (%)",
];

const Tuition: React.FC = () => {
  const [classFee, setClassFee] = useState<baseClassInterface>({
    id: 0,
    total_starterpack: 0,
    total_others: 0,
    name: "",
    abbreviation: "",
    school_fee: 0,
    uniform: 0,
    sport_wear: 0,
    school_bus: 0,
    snack: 0,
    science: 0,
    games: 0,
    library_fee: 0,
    extra_activities: 0,
  });
  // GETTING CLASS TUITION Data
  const {
    data: baseClassData,
    isError: isBaseClassError,
    error: baseClassError,
    isLoading: isBaseClassLoading,
  } = useQuery({
    queryKey: ["BaseClass"],
    queryFn: () => getBaseClass(),
  });

  // const baseClass: baseClassInterface[] = useMemo(() => {
  //   return (baseClassData && baseClassData.data.data) || [];
  // }, [baseClassData]);

  const baseClass: baseClassInterface[] = useMemo(() => {
    if (
      !baseClassData ||
      !baseClassData.data ||
      !Array.isArray(baseClassData.data.data)
    ) {
      return [];
    }
    return baseClassData.data.data;
  }, [baseClassData]);
  useEffect(() => {
    // console.log(
    //   "Class Stats:",
    //   baseClass,
    //   isBaseClassError,
    //   baseClassError,
    //   isBaseClassLoading
    // );
  }, [
    baseClass,
    baseClassData,
    baseClassError,
    isBaseClassError,
    isBaseClassLoading,
  ]);

  // GETTING CLASS STATS Data
  const {
    data: classStatData,
    isError: isClassStatError,
    error: classStatError,
    isLoading: isClassStatLoading,
  } = useQuery({
    queryKey: ["classStat"],
    queryFn: () => getClassStat(),
  });

  interface classStats {
    class?: string;
    paid?: number;
    total?: number;
    paid_half?: number;
    paid_nothing?: number;
  }

  const classStats: classStats[] = useMemo(() => {
    if (!classStatData || !classStatData.data) {
      return [];
    }
    // Backend returns { classStats: [...] }
    return classStatData.data.classStats || [];
  }, [classStatData]);
  // console.log(
  //   "Class Stats:",
  //   classStats,
  //   isClassStatError,
  //   classStatError,
  //   isClassStatLoading
  // );
  isClassStatError && console.error(classStatError);

  // Student fees from classes to students
  const [studentDropDown, setStudentDropDown] = useState<string>("");
  const navigate = useNavigate();
  //Ends

  const [ActiveClass, setActiveClass] = useState<{
    classNow: string;
    Dropdown: boolean;
  }>({ classNow: "Loading...", Dropdown: false });
  // const [classes] = useState<string[]>([
  //   "creche",
  //   "k.g 1",
  //   "k.g 2",
  //   "nursery 1",
  //   "nursery 2",
  //   "primary 1",
  //   "primary 2",
  //   "primary 3",
  //   "primary 4",
  //   "primary 5",
  // ]);
  // const classes = Object.keys(classTuitionFees);
  // const capitalizedClassName = classes?.map((className) =>
  //   className
  //     .split(" ")
  //     .map((word: string) =>
  //       word === "k.g"
  //         ? "K.G"
  //         : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  //     )
  //     .join(" ")
  // );

  const capitalizedClassName = useMemo(() => {
    return baseClass
      ?.map(
        (baseclass) =>
          baseclass.name &&
          baseclass.name
            .split(" ")
            .map((word: string) => (word === "K.g" ? "K.G" : word))
            .join(" ")
      )
      .filter(Boolean) as string[];
  }, [baseClass]);
  // console.log("classs", capitalizedClassName);
  useEffect(() => {
    if (capitalizedClassName.length > 0) {
      setActiveClass((prev) => ({
        ...prev,
        classNow: capitalizedClassName[0],
      }));
    }
  }, [capitalizedClassName]);
  const [tuitionFeesDropDown, setTuitionFeesDropDown] = useState<boolean>(true);

  // const currentClassFees =
  //   classTuitionFees[
  //     ActiveClass.classNow.toLowerCase() as keyof typeof classTuitionFees
  //   ];
  // if (!currentClassFees) return <div>No data available for this class.</div>;

  const currentClassFees: baseClassInterface[] = useMemo(() => {
    if (!ActiveClass.classNow || !baseClass) return [];

    return baseClass.filter(
      (baseclass) =>
        baseclass.name?.toLowerCase() === ActiveClass.classNow.toLowerCase()
    );
  }, [ActiveClass.classNow, baseClass]);

  // console.log("Current Class Feess : ", currentClassFees[0]);

  useEffect(() => {
    currentClassFees &&
      currentClassFees.length > 0 &&
      setClassFee(currentClassFees[0]);
  }, [currentClassFees]);
  // console.log(currentClassFees);
  // if (isClassStatLoading) {
  //   return <Loader />;
  // }
  return (
    <div className="m-0 md:my-[30px] bg-[linear-gradient(259.46deg,_#05878F_10.76%,_rgba(5,_135,_143,_1)_107.57%)] md:bg-none heightprob">
      <div className="tuition-header block md:hidden">Tuition</div>
      <div className="tuition-body-container flex-grow">
        <div className="tuition-body-container-header">
          <div className="hidden md:block shadow-[0px_1px_25px_0px_#389FA61A] p-4 rounded-[20px] text-[18px] leading-[23.04px] font-bold font-Lora text-[#05878F] mr-5 heightprob">
            Finance
          </div>
          <div className="hidden flex-row self-center">
            <button className="mr-[10px] lg:mr-[15px] xl:mr-[20px]">
              <div className="w-[19.54px] h-auto mr-[5px] my-auto">
                <img
                  src={FilterMobile}
                  alt="filter"
                  // className="object-contain object-center size-full"
                />
              </div>
              <div className=" font-Lora font-bold text-[15px] leading-[19.2px]">
                Filter
              </div>
            </button>
            <button>
              <div className="max-w-[15px] h-auto mr-[5px]">
                <img
                  src={Add}
                  alt="add"
                  className="object-contain object-center size-full"
                />
              </div>
              <div className=" font-Lora font-bold text-[15px] leading-[19.2px]">
                Add
              </div>
            </button>
            <button className="shadow-none hidden md:flex flex-row ml-[10px] lg:ml-[15px] xl:ml-[20px] self-center items-center">
              <div className="max-w-[13px] h-auto mr-[8px]">
                <img
                  src={Pencil}
                  alt="add"
                  className="object-contain object-center size-full"
                />
              </div>
              <div className=" font-Poppins font-normal text-[14px] leading-[19.5px] text-[#05878F]">
                Edit
              </div>
            </button>
          </div>
        </div>
        <div className="tuition-body-container-content-one">
          <>
            <TuitionFinance />
          </>
          <div
            className={`tuition-class-fees-overview ${
              tuitionFeesDropDown ? "bg-white" : "bg-[#ECFEFF] md:bg-white"
            }`}
          >
            <button
              onClick={() => {
                setTuitionFeesDropDown(!tuitionFeesDropDown),
                  window.matchMedia("(min-width: 768px)").matches &&
                    setTuitionFeesDropDown(true);
              }}
              className={`min-w-full flex flex-row justify-between items-center cursor-pointer font-Lora font-bold text-[15px] leading-[19.2px] text-center ${
                tuitionFeesDropDown ? "px-[1px] md:px-0" : "px-[1px] md:px-0"
              }`}
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[22px] font-semibold font-Poppins md:font-Lora md:font-bold ${
                  tuitionFeesDropDown ? "text-black" : "text-black"
                }`}
              >
                Tuition Fees
              </div>
              <div className="max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={tuitionFeesDropDown ? PathUp : PathDown}
                  alt={`${tuitionFeesDropDown ? "arrow up" : "arrow down"}`}
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`tuition-class-fees-overview-body ${
                tuitionFeesDropDown ? "flex" : "hidden"
              }`}
            >
              <div className="relative mx-auto">
                <button
                  className="tuition-class-fees-overview-body-button"
                  onClick={() => {
                    setActiveClass(
                      ActiveClass.Dropdown
                        ? {
                            ...ActiveClass,
                            Dropdown: false,
                          }
                        : {
                            ...ActiveClass,
                            Dropdown: true,
                          }
                    );
                  }}
                >
                  {/* {classes[5]?.charAt(0).toUpperCase() +
                    classes[5]?.slice(1).toLowerCase()} */}
                  {ActiveClass.classNow}
                </button>
                <div
                  className={`tuition-class-fees-overview-body-class-selector ${
                    ActiveClass.Dropdown ? "flex" : "hidden"
                  }`}
                >
                  {isBaseClassLoading ? (
                    <div className=" font-Lora text-center min-h-[152px] ">
                      <Loader />
                    </div>
                  ) : isBaseClassError ? (
                    <div className=" font-Lora text-center font-bold flex justify-center items-center min-h-[152px] ">
                      <span>Error fetching data</span>
                    </div>
                  ) : (
                    capitalizedClassName.map((className, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setActiveClass({
                            ...ActiveClass,
                            classNow: className,
                            Dropdown: false,
                          });
                          // setActiveClass();
                        }}
                      >
                        {className}
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="tuition-class-fees-overview-body-content">
                {isBaseClassLoading ? (
                  <div className=" font-Lora text-center min-h-[100px] ">
                    <Loader />
                  </div>
                ) : isBaseClassError ? (
                  <div className=" font-Lora text-center font-bold flex justify-center items-center min-h-[152px] ">
                    <span>Error fetching data</span>
                  </div>
                ) : (
                  <>
                    <div className="fees-entries mb-[20px] font-Poppins text-[15px] font-medium xl:font-normal leading-[22.5px] md:leading-[16.5px]">
                      <div>School Fees:</div>
                      <div>₦{classFee.school_fee}</div>
                    </div>
                    <div className="mb-[20px]">
                      <div className="mb-[10px] font-Lora font-bold leading-[19.2px] xl:font-Poppins xl:font-semibold text-[17px] xl:leading-[19.5px]">
                        Starter Pack
                      </div>
                      <div>
                        <div className="fees-entries mb-[10px] md:mb-[15px] font-Poppins text-[15px] font-medium xl:font-normal leading-[22.5px] md:leading-[16.5px]">
                          <div>School Uniform :</div>
                          <div>₦{classFee.uniform}</div>
                        </div>
                        <div className="fees-entries mb-[10px] md:mb-[15px] font-Poppins text-[15px] font-medium xl:font-normal leading-[22.5px] md:leading-[16.5px]">
                          <div>Sport Wear :</div>
                          <div>₦{classFee.sport_wear}</div>
                        </div>
                        <div className="fees-entries mb-[10px] md:mb-[15px] font-Poppins text-[15px] font-medium xl:font-normal leading-[22.5px] md:leading-[16.5px]">
                          <div>School Bus :</div>
                          <div>₦{classFee.school_bus}</div>
                        </div>
                        <div className="fees-entries mb-[10px] md:mb-[15px] font-Poppins text-[15px] font-medium xl:font-normal leading-[22.5px] md:leading-[16.5px]">
                          <div>Snacks :</div>
                          <div>₦{classFee.snack}</div>
                        </div>
                      </div>
                      <div className="fees-entries mb-[10px] md:mb-[15px] font-Lora text-[15px] font-bold leading-[19.2px] xl:font-Poppins xl:font-semibold xl:leading-[16.5px]">
                        <div>Total Starterpack :</div>
                        <div>₦{classFee.total_starterpack}</div>
                      </div>
                    </div>
                    <div className="mb-[30px] md:mb-[24px]">
                      <div className="mb-[10px] font-Lora font-bold leading-[19.2px] xl:font-Poppins xl:font-semibold text-[17px] xl:leading-[19.5px]">
                        Others
                      </div>
                      <div>
                        <div className="fees-entries mb-[10px] md:mb-[15px] font-Poppins text-[15px] font-medium xl:font-normal leading-[22.5px] md:leading-[16.5px]">
                          <div>Science :</div>
                          <div>₦{classFee.science}</div>
                        </div>
                        <div className="fees-entries mb-[10px] md:mb-[15px] font-Poppins text-[15px] font-medium xl:font-normal leading-[22.5px] md:leading-[16.5px]">
                          <div>Games :</div>
                          <div>₦{classFee.games}</div>
                        </div>
                        <div className="fees-entries mb-[10px] md:mb-[15px] font-Poppins text-[15px] font-medium xl:font-normal leading-[22.5px] md:leading-[16.5px]">
                          <div>Library Fee :</div>
                          <div>₦{classFee.library_fee}</div>
                        </div>
                        <div className="fees-entries mb-[10px] md:mb-[15px] font-Poppins text-[15px] font-medium xl:font-normal leading-[22.5px] md:leading-[16.5px]">
                          <div>Extra Activities :</div>
                          <div>₦{classFee.extra_activities}</div>
                        </div>
                      </div>
                      <div className="fees-entries mb-[10px] md:mb-[15px] font-Lora text-[15px] font-bold leading-[19.2px] xl:font-Poppins xl:font-semibold xl:leading-[16.5px]">
                        <div>Total Others :</div>
                        <div>₦{classFee.total_others}</div>
                      </div>
                    </div>
                    <div className="font-Lora text-[15px] leading-[19.2px] font-bold md:font-Poppins md:text-base text-center flex flex-row justify-center">
                      <div className="mr-[7px]">Total:</div>
                      <div>
                        ₦
                        {(classFee.school_fee || 0) +
                          (classFee.total_starterpack || 0) +
                          (classFee.total_others || 0)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 
        ////////////////////////////////////
        NEW CLASS FEES
        ////////////////////////////////////
        */}
        <div className="hidden md:block md:mx-[15px] xl:mx-[20px]">
          {/* Hello Table */}
          {/* Desktop view */}
          <table className="w-full border-collapse border-none hidden md:table rounded-[20px] shadow-[0px_1px_25px_0px_#389FA61A]">
            <thead>
              <tr className="class-stats-table-row-header">
                {classStatsTableHeader.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            {isClassStatLoading ? (
              <tbody>
                <tr>
                  <td className=" font-Lora text-center font-bold " colSpan={4}>
                    <Loader />
                  </td>
                </tr>
              </tbody>
            ) : classStats && classStats.length > 0 ? (
              <tbody>
                {classStats &&
                  classStats.map((classData: classStats, index: number) => {
                    const calculatePercentage = (value: number) => {
                      if (!classData.total) return 0;
                      const percentage = (value / classData.total) * 100;
                      return Number(percentage.toFixed(2)) || 0;
                    };

                    return (
                      <tr key={index} className="class-stats-table-row-details">
                        <td className="">{classData.class}</td>
                        <td className="">
                          {(classData.paid &&
                            calculatePercentage(classData.paid)) ||
                            0}
                        </td>
                        <td className="">
                          {(classData.paid_half &&
                            calculatePercentage(classData.paid_half)) ||
                            0}
                        </td>
                        <td className="">
                          {(classData.paid_nothing &&
                            calculatePercentage(classData.paid_nothing)) ||
                            0}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            ) : (
              isClassStatError && (
                <tbody>
                  <tr>
                    <td
                      className="py-4 font-Lora text-center font-bold my-[10%] lg:my-[15%] min-h-[100px]"
                      colSpan={6}
                    >
                      <span>Error fetching data</span>
                    </td>
                  </tr>
                </tbody>
              )
            )}
          </table>
        </div>

        {/* 
        /////////////////////////////////////////////////
        STUDENT FEES FROM CLASSES TO INDIVIDUAL
        ////////////////////////////////////////////////
        */}
        <div className="student-overview-class-container hidden">
          <div
            className={`student-overview-class ${
              studentDropDown === "Crèche"
                ? "max-h-[72px] md:max-h-full"
                : "max-h-[72px]"
            }`}
          >
            <button
              onClick={() => {
                setStudentDropDown(
                  studentDropDown === "Crèche" ? "" : "Crèche"
                ),
                  !window.matchMedia("(min-width: 768px)").matches &&
                    navigate("creche");
              }}
              className="min-w-full flex flex-row justify-between items-center cursor-pointer"
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                  studentDropDown === "Crèche"
                    ? "text-black md:text-[#05878F]"
                    : "text-black"
                }`}
              >
                Crèche
              </div>
              <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={studentDropDown === "Crèche" ? PathUp : PathDown}
                  alt={`${
                    studentDropDown === "Crèche" ? "arrow up" : "arrow down"
                  }`}
                  className="hidden md:block size-full object-contain object-center"
                />
                <img
                  src={PathRight}
                  alt="arrow right"
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`mt-[25px]  static md:relative ${
                studentDropDown === "Crèche" ? "hidden md:block" : "hidden"
              }`}
            >
              <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                <div>TOTAL</div>
                <div>25</div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div className="mx-[30px]">
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={"creche"}
                className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
              >
                <div className="max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                  <GuardianSVG />
                </div>
              </Link>
            </div>
          </div>

          <div
            className={`student-overview-class ${
              studentDropDown === "K.G 1"
                ? "max-h-[72px] md:max-h-full"
                : "max-h-[72px]"
            }`}
          >
            <button
              onClick={() => {
                setStudentDropDown(studentDropDown === "K.G 1" ? "" : "K.G 1"),
                  !window.matchMedia("(min-width: 768px)").matches &&
                    navigate("k.g 1");
              }}
              className="min-w-full flex flex-row justify-between items-center cursor-pointer"
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                  studentDropDown === "K.G 1"
                    ? "text-black md:text-[#05878F]"
                    : "text-black"
                }`}
              >
                K.G 1
              </div>
              <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={studentDropDown === "K.G 1" ? PathUp : PathDown}
                  alt={`${
                    studentDropDown === "K.G 1" ? "arrow up" : "arrow down"
                  }`}
                  className="hidden md:block size-full object-contain object-center"
                />
                <img
                  src={PathRight}
                  alt="arrow right"
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`mt-[25px] static md:relative ${
                studentDropDown === "K.G 1" ? "hidden md:block" : "hidden"
              }`}
            >
              <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                <div>TOTAL</div>
                <div>25</div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div className="mx-[30px]">
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={"k.g 1"}
                className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
              >
                <div className=" max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                  <GuardianSVG />
                </div>
              </Link>
            </div>
          </div>

          <div
            className={`student-overview-class ${
              studentDropDown === "K.G 2"
                ? "max-h-[72px] md:max-h-full"
                : "max-h-[72px]"
            }`}
          >
            <button
              onClick={() => {
                setStudentDropDown(studentDropDown === "K.G 2" ? "" : "K.G 2"),
                  !window.matchMedia("(min-width: 768px)").matches &&
                    navigate("k.g 2");
              }}
              className="min-w-full flex flex-row justify-between items-center cursor-pointer"
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                  studentDropDown === "K.G 2"
                    ? "text-black md:text-[#05878F]"
                    : "text-black"
                }`}
              >
                K.G 2
              </div>
              <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={studentDropDown === "K.G 2" ? PathUp : PathDown}
                  alt={`${
                    studentDropDown === "K.G 2" ? "arrow up" : "arrow down"
                  }`}
                  className="hidden md:block size-full object-contain object-center"
                />
                <img
                  src={PathRight}
                  alt="arrow right"
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`mt-[25px] static md:relative ${
                studentDropDown === "K.G 2" ? "hidden md:block" : "hidden"
              }`}
            >
              <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                <div>TOTAL</div>
                <div>25</div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div className="mx-[30px]">
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={"k.g 2"}
                className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
              >
                <div className="max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                  <GuardianSVG />
                </div>
              </Link>
            </div>
          </div>

          <div
            className={`student-overview-class ${
              studentDropDown === "Nursery 1"
                ? "max-h-[72px] md:max-h-full"
                : "max-h-[72px]"
            }`}
          >
            <button
              onClick={() => {
                setStudentDropDown(
                  studentDropDown === "Nursery 1" ? "" : "Nursery 1"
                ),
                  !window.matchMedia("(min-width: 768px)").matches &&
                    navigate("nursery 1");
              }}
              className="min-w-full flex flex-row justify-between items-center cursor-pointer"
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                  studentDropDown === "Nursery 1"
                    ? "text-black md:text-[#05878F]"
                    : "text-black"
                }`}
              >
                Nursery 1
              </div>
              <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={studentDropDown === "Nursery 1" ? PathUp : PathDown}
                  alt={`${
                    studentDropDown === "Nursery 1" ? "arrow up" : "arrow down"
                  }`}
                  className="hidden md:block size-full object-contain object-center"
                />
                <img
                  src={PathRight}
                  alt="arrow right"
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`mt-[25px] static md:relative ${
                studentDropDown === "Nursery 1" ? "hidden md:block" : "hidden"
              }`}
            >
              <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                <div>TOTAL</div>
                <div>25</div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div className="mx-[30px]">
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={"nursery 1"}
                className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
              >
                <div className="max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                  <GuardianSVG />
                </div>
              </Link>
            </div>
          </div>

          <div
            className={`student-overview-class ${
              studentDropDown === "Nursery 2"
                ? "max-h-[72px] md:max-h-full"
                : "max-h-[72px]"
            }`}
          >
            <button
              onClick={() => {
                setStudentDropDown(
                  studentDropDown === "Nursery 2" ? "" : "Nursery 2"
                ),
                  !window.matchMedia("(min-width: 768px)").matches &&
                    navigate("nursery 2");
              }}
              className="min-w-full flex flex-row justify-between items-center cursor-pointer"
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                  studentDropDown === "Nursery 2"
                    ? "text-black md:text-[#05878F]"
                    : "text-black"
                }`}
              >
                Nursery 2
              </div>
              <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={studentDropDown === "Nursery 2" ? PathUp : PathDown}
                  alt={`${
                    studentDropDown === "Nursery 2" ? "arrow up" : "arrow down"
                  }`}
                  className="hidden md:block size-full object-contain object-center"
                />
                <img
                  src={PathRight}
                  alt="arrow right"
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`mt-[25px] static md:relative ${
                studentDropDown === "Nursery 2" ? "hidden md:block" : "hidden"
              }`}
            >
              <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                <div>TOTAL</div>
                <div>25</div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div className="mx-[30px]">
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={"nursery 2"}
                className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
              >
                <div className="max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                  <GuardianSVG />
                </div>
              </Link>
            </div>
          </div>

          <div
            className={`student-overview-class ${
              studentDropDown === "Primary 1"
                ? "max-h-[72px] md:max-h-full"
                : "max-h-[72px]"
            }`}
          >
            <button
              onClick={() => {
                setStudentDropDown(
                  studentDropDown === "Primary 1" ? "" : "Primary 1"
                ),
                  !window.matchMedia("(min-width: 768px)").matches &&
                    navigate("primary 1");
              }}
              className="min-w-full flex flex-row justify-between items-center cursor-pointer"
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                  studentDropDown === "Primary 1"
                    ? "text-black md:text-[#05878F]"
                    : "text-black"
                }`}
              >
                Primary 1
              </div>
              <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={studentDropDown === "Primary 1" ? PathUp : PathDown}
                  alt={`${
                    studentDropDown === "Primary 1" ? "arrow up" : "arrow down"
                  }`}
                  className="hidden md:block size-full object-contain object-center"
                />
                <img
                  src={PathRight}
                  alt="arrow right"
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`mt-[25px] static md:relative ${
                studentDropDown === "Primary 1" ? "hidden md:block" : "hidden"
              }`}
            >
              <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                <div>TOTAL</div>
                <div>25</div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div className="mx-[30px]">
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={"primary 1"}
                className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
              >
                <div className="max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                  <GuardianSVG />
                </div>
              </Link>
            </div>
          </div>

          <div
            className={`student-overview-class ${
              studentDropDown === "Primary 2"
                ? "max-h-[72px] md:max-h-full"
                : "max-h-[72px]"
            }`}
          >
            <button
              onClick={() => {
                setStudentDropDown(
                  studentDropDown === "Primary 2" ? "" : "Primary 2"
                ),
                  !window.matchMedia("(min-width: 768px)").matches &&
                    navigate("primary 2");
              }}
              className="min-w-full flex flex-row justify-between items-center cursor-pointer"
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                  studentDropDown === "Primary 2"
                    ? "text-black md:text-[#05878F]"
                    : "text-black"
                }`}
              >
                Primary 2
              </div>
              <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={studentDropDown === "Primary 2" ? PathUp : PathDown}
                  alt={`${
                    studentDropDown === "Primary 2" ? "arrow up" : "arrow down"
                  }`}
                  className="hidden md:block size-full object-contain object-center"
                />
                <img
                  src={PathRight}
                  alt="arrow right"
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`mt-[25px] static md:relative ${
                studentDropDown === "Primary 2" ? "hidden md:block" : "hidden"
              }`}
            >
              <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                <div>TOTAL</div>
                <div>25</div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div className="mx-[30px]">
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={"primary 2"}
                className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
              >
                <div className="max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                  <GuardianSVG />
                </div>
              </Link>
            </div>
          </div>

          <div
            className={`student-overview-class ${
              studentDropDown === "Primary 3"
                ? "max-h-[72px] md:max-h-full"
                : "max-h-[72px]"
            }`}
          >
            <button
              onClick={() => {
                setStudentDropDown(
                  studentDropDown === "Primary 3" ? "" : "Primary 3"
                ),
                  !window.matchMedia("(min-width: 768px)").matches &&
                    navigate("primary 3");
              }}
              className="min-w-full flex flex-row justify-between items-center cursor-pointer"
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                  studentDropDown === "Primary 3"
                    ? "text-black md:text-[#05878F]"
                    : "text-black"
                }`}
              >
                Primary 3
              </div>
              <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={studentDropDown === "Primary 3" ? PathUp : PathDown}
                  alt={`${
                    studentDropDown === "Primary 3" ? "arrow up" : "arrow down"
                  }`}
                  className="hidden md:block size-full object-contain object-center"
                />
                <img
                  src={PathRight}
                  alt="arrow right"
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`mt-[25px] static md:relative ${
                studentDropDown === "Primary 3" ? "hidden md:block" : "hidden"
              }`}
            >
              <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                <div>TOTAL</div>
                <div>25</div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div className="mx-[30px]">
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={"primary 3"}
                className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
              >
                <div className="max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                  <GuardianSVG />
                </div>
              </Link>
            </div>
          </div>

          <div
            className={`student-overview-class ${
              studentDropDown === "Primary 4"
                ? "max-h-[72px] md:max-h-full"
                : "max-h-[72px]"
            }`}
          >
            <button
              onClick={() => {
                setStudentDropDown(
                  studentDropDown === "Primary 4" ? "" : "Primary 4"
                ),
                  !window.matchMedia("(min-width: 768px)").matches &&
                    navigate("primary 4");
              }}
              className="min-w-full flex flex-row justify-between items-center cursor-pointer"
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                  studentDropDown === "Primary 4"
                    ? "text-black md:text-[#05878F]"
                    : "text-black"
                }`}
              >
                Primary 4
              </div>
              <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={studentDropDown === "Primary 4" ? PathUp : PathDown}
                  alt={`${
                    studentDropDown === "Primary 4" ? "arrow up" : "arrow down"
                  }`}
                  className="hidden md:block size-full object-contain object-center"
                />
                <img
                  src={PathRight}
                  alt="arrow right"
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`mt-[25px] static md:relative ${
                studentDropDown === "Primary 4" ? "hidden md:block" : "hidden"
              }`}
            >
              <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                <div>TOTAL</div>
                <div>25</div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div className="mx-[30px]">
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={"primary 4"}
                className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
              >
                <div className="max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                  <GuardianSVG />
                </div>
              </Link>
            </div>
          </div>

          <div
            className={`student-overview-class ${
              studentDropDown === "Primary 5"
                ? "max-h-[72px] md:max-h-full"
                : "max-h-[72px]"
            }`}
          >
            <button
              onClick={() => {
                setStudentDropDown(
                  studentDropDown === "Primary 5" ? "" : "Primary 5"
                ),
                  !window.matchMedia("(min-width: 768px)").matches &&
                    navigate("primary 5");
              }}
              className="min-w-full flex flex-row justify-between items-center cursor-pointer"
            >
              <div
                className={`flex-1 text-center text-lg md:text-[20px] 2xl:text-[24px] font-semibold font-Poppins ${
                  studentDropDown === "Primary 5"
                    ? "text-black md:text-[#05878F]"
                    : "text-black"
                }`}
              >
                Primary 5
              </div>
              <div className="max-w-[8.24px] md:max-w-[17px] h-[15px] md:max-h-[10px]">
                <img
                  src={studentDropDown === "Primary 5" ? PathUp : PathDown}
                  alt={`${
                    studentDropDown === "Primary 5" ? "arrow up" : "arrow down"
                  }`}
                  className="hidden md:block size-full object-contain object-center"
                />
                <img
                  src={PathRight}
                  alt="arrow right"
                  className="block md:hidden size-full object-contain object-center"
                />
              </div>
            </button>
            <div
              className={`mt-[25px] static md:relative ${
                studentDropDown === "Primary 5" ? "hidden md:block" : "hidden"
              }`}
            >
              <div className="font-Poppins text-lg font-medium flex flex-col items-center mb-[25px]">
                <div>TOTAL</div>
                <div>25</div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div className="mx-[30px]">
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-Lora font-bold text-[8px] mb-[10.23px] text-center text-[#29CC97]">
                    COMPLETED
                  </div>
                  <div className="font-Poppins">
                    <CircularProgressBar
                      style={{
                        percentage: 60,
                        textSize: 9.21,
                        textColor: "rgba(41,204,151,1)",
                        fontWeight: 600,
                        pathColor: "rgba(41,204,151,1)",
                        trailColor: "rgba(234,250,245)",
                        weight: 7,
                        size: 61.39,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Link
                to={"primary 5"}
                className="content-center right-0 bottom-[-37px] absolute p-2 rounded-full size-[30px] bg-[#05878F]"
              >
                <div className="max-w-[15px] max-h-[12px] student-overview-class-desktop-nav">
                  <GuardianSVG />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tuition;
