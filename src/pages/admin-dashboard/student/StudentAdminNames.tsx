import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import useClasses from "../../../hooks/useClasses";
import { getClassStudentsId } from "../../../services/api/calls/getApis";
import { calculateAge } from "../../../utils/regex";
import {
  Add,
  Filter,
  FilterMobile,
} from "../../../assets/images/dashboard/students";
import { profileImage } from "../../../assets/images/users";
import AddButton from "../../../components/admin-dashboard/AddButton";
import CallSVG from "../../../components/svg/student/CallSVG";
import MessageSVG from "../../../components/svg/student/MessageSVG";
import Loader from "../../../shared/Loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import useClasses from "../../hooks/useClasses";
// import { getClassStudentsId } from "../../services/api/calls/getApis";
// import { calculateAge } from "../../utils/regex";

const tableHeader: string[] = [
  "Name",
  "ID",
  "Age",
  "Gender",
  "Starter's Pack",
  "Contact",
];

interface classStudentIdI {
  id: number;
  student_class: string;
  guardian_email: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  image: string;
  date_of_birth: string;
  gender: string;
  fathers_name: string;
  mothers_name: string;
  fathers_contact: string;
  mothers_contact: string;
  fathers_occupation: string;
  mothers_occupation: string;
  home_address: string;
  state_of_origin: string;
  home_town: string;
  country: string;
  starter_pack_collected: boolean;
  religion: string;
  total_tuition_paid: number;
  schoolclass: number;
  guardian: number;
}

interface studentDataI {
  fathers_contact: string;
  guardian_email: string;
  starter_pack: string;
  gender: string;
  age: number;
  id: number;
  image: string;
  full_name: string;
  class: string;
  date_of_birth: string;
  fathers_name: string;
  mothers_name: string;
  mothers_contact: string;
  fathers_occupation: string;
  mothers_occupation: string;
  home_address: string;
  state_of_origin: string;
  home_town: string;
  country: string;
  religion: string;
  total_tuition_paid: number;
}

const StudentAdminNames: React.FC = () => {
  // Error Go Back
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1);
  };

  const [studentData, setStudentData] = useState<studentDataI[]>([]);
  // const [tableActive, setTableActive] = useState<number | null>(null);
  // const { id } = useParams();
  // const navigate = useNavigate();
  const [editable, setEditable] = useState<boolean>(false);
  const [addToggle, setAddToggle] = useState<boolean>(false);
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
  // GETTING CLASS Data
  const { classNameData: classes, isClassLoading, isClassError } = useClasses();
  //Ends
  const { id } = useParams();
  // const ID: number = Number(id);
  // Classname from URL and compare
  useEffect(() => {
    console.log("className Dataaa", isClassLoading, classes);
  }, [classes, isClassLoading]);
  const location = useLocation();
  const className = useMemo(() => {
    const decodedPaths = location.pathname
      .split("/")
      .map((decodeURI) => decodeURIComponent(decodeURI));

    return (
      (classes &&
        decodedPaths.find((pathname) =>
          classes
            .map((classes) => classes.name.toLowerCase())
            .includes(pathname)
        )) ||
      ""
    );
  }, [classes, location.pathname]);

  // const className = useLocation()
  //   .pathname.split("/")
  //   .map((decodeURI) => decodeURIComponent(decodeURI))
  //   .find((pathname) => classes
  //           .map((classes) => classes.name.toLowerCase())
  //           .includes(pathname));
  useEffect(() => {
    console.log("classNameActive Dataaa :", className);
  }, [className]);
  //Get class id with filter of classes and classnames
  const classNameID: number[] = useMemo(() => {
    return classes
      .filter((classes) => {
        return classes.name.toLowerCase() === className;
      })
      .map((classArr) => {
        return classArr.id;
      });
  }, [className, classes]);
  useEffect(() => {
    console.log("classNameActiveID :", classNameID[0]);
  }, [classNameID]);
  // GETTING CLASS Students Data by ID
  const {
    data: classStudentsIdData,
    isError: isClassStudentsIdError,
    // error: classStudentsIdError,
    isLoading: isClassStudentsIdLoading,
  } = useQuery({
    queryKey: ["classStudents", classNameID[0]],
    queryFn: () => getClassStudentsId(classNameID[0]),
    // enabled: classNameID.length > 0,
    enabled: classNameID.length > 0 ? true : false,
  });

  useEffect(() => {
    console.log(
      "classStudentID Data :",
      classStudentsIdData,
      isClassStudentsIdError,
      isClassStudentsIdLoading
    );
  }, [classStudentsIdData, isClassStudentsIdError, isClassStudentsIdLoading]);
  const classStudentsId: classStudentIdI[] = useMemo(() => {
    if (
      !classStudentsIdData ||
      !classStudentsIdData.data ||
      !classStudentsIdData.data.students ||
      !Array.isArray(classStudentsIdData.data.students)
    ) {
      return [];
    }
    
    // Backend returns { students: [...] }
    // Map backend structure to frontend structure
    return classStudentsIdData.data.students.map((student: any) => ({
      id: student._id || '',
      student_class: student.class || '',
      guardian_email: student.guardianId?.userId?.email || '',
      first_name: student.userId?.firstName || '',
      last_name: student.userId?.lastName || '',
      middle_name: '',
      image: student.userId?.profileImage || '',
      date_of_birth: student.dateOfBirth || '',
      gender: student.gender || '',
      fathers_name: '',
      mothers_name: '',
      fathers_contact: student.userId?.phoneNumber || '',
      mothers_contact: '',
      fathers_occupation: '',
      mothers_occupation: '',
      home_address: student.address || '',
      state_of_origin: '',
      home_town: '',
      country: '',
      starter_pack_collected: false,
      religion: '',
      total_tuition_paid: 0,
      schoolclass: 0,
      guardian: 0,
    }));
  }, [classStudentsIdData]);

  const filteredClassStudentId: studentDataI[] = useMemo(() => {
    return classStudentsId.map((student) => ({
      ...student,
      // id: student.id,
      full_name: `${student.last_name} ${student.first_name} ${student.middle_name}`,
      image: student.image,
      // gender: student.gender,
      age: calculateAge(student.date_of_birth),
      // fathers_contact: student.fathers_contact,
      class: student.student_class || className || "-",
      // guardian_email: student.guardian_email,
      starter_pack: student.starter_pack_collected
        ? "Collected"
        : "Not Collected",
    }));
  }, [className, classStudentsId]);
  useEffect(() => {
    filteredClassStudentId.length > 0 && setStudentData(filteredClassStudentId);

    // console.log(
    //   "Class Students Id Data:",
    //   classStudentsId,
    //   isClassStudentsIdError,
    //   classStudentsIdError,
    //   isClassStudentsIdLoading
    // );
    console.log("Student Dataaa", studentData);
  }, [filteredClassStudentId, studentData]);
  const studentIDs: number[] = useMemo(() => {
    return studentData.map((student) => student.id);
  }, [studentData]);
  // console.log("Ohhhh", studentIDs);
  return (
    <div className="student-names">
      <ToastContainer />
      <div className="student-names-list">
        <div className="student-names-list-header">
          <div className="student-names-list-header1">
            Students <span className="hidden md:inline-block">Database</span>
          </div>
          <div className="student-names-list-header2">
            {isClassLoading || isClassStudentsIdLoading ? (
              <div className=" font-Lora text-center w-full">Loading...</div>
            ) : isClassError ? (
              <div className=" font-Lora text-center w-full font-bold">
                <span>Error fetching data</span>
              </div>
            ) : className &&
              classes
                .map((classes) => classes.name.toLowerCase())
                .includes(className) ? (
              className?.toUpperCase()
            ) : (
              "Error"
            )}
          </div>
          {isClassLoading || isClassStudentsIdLoading ? (
            <div className=" font-Lora text-center w-full hidden md:flex md:flex-row md:justify-center md:items-center">
              <span>Loading...</span>
            </div>
          ) : isClassError ? (
            <div className=" font-Lora text-center w-full hidden md:block font-bold">
              <span>Error fetching data</span>
            </div>
          ) : className &&
            classes
              .map((classes) => classes.name.toLowerCase())
              .includes(className) ? (
            <div className="student-names-list-header3">
              <button
                className={`mr-[10px] lg:mr-[15px] xl:mr-[20px] ${
                  addToggle
                    ? "opacity-30 cursor-not-allowed"
                    : "opacity-100 cursor-pointer"
                }`}
                disabled={addToggle ? true : false}
              >
                <div className="max-w-2 max-h-2 mr-[5px]">
                  <img
                    src={Filter}
                    alt="filter"
                    className="object-contain object-center size-full"
                  />
                </div>
                <div>Filter</div>
              </button>
              <button
                onClick={() => setAddToggle(true)}
                className={
                  editable
                    ? `opacity-30 cursor-not-allowed`
                    : "opacity-100 cursor-pointer"
                }
                disabled={editable ? true : false}
              >
                <div className="max-w-2 max-h-2 mr-[5px]">
                  <img
                    src={Add}
                    alt="add"
                    className="object-contain object-center size-full"
                  />
                </div>
                <div>Add</div>
              </button>
            </div>
          ) : null}
        </div>
        <div className="student-names-list-container">
          <>
            {/* Mobile view */}
            {isClassLoading || isClassStudentsIdLoading ? (
              <div className=" font-Lora text-center w-full min-h-[152px] flex flex-row justify-center items-center">
                <Loader />
              </div>
            ) : isClassError ? (
              <div className=" font-Lora text-center w-full min-h-[152px] font-bold flex flex-row justify-center items-center">
                <span>Error fetching data</span>
              </div>
            ) : className &&
              classes.length > 0 &&
              classes
                .map((classes) => classes.name.toLowerCase())
                .includes(className) ? (
              <>
                <div className="block md:hidden grow">
                  <div className="student-names-list-container-mheader">
                    <div className="font-Lora font-bold mr-5">
                      <div className="text-[15px] leading-[19.2px] text-[#05878F]">
                        TOTAL
                      </div>
                      <div className="text-lg text-center leading-[23.04px]">
                        {studentData.length || 0}
                      </div>
                    </div>
                    <div className="flex flex-row student-names-list-container-mheader-button">
                      <button
                        className={`mr-[10px] lg:mr-[15px] xl:mr-[20px]  ${
                          addToggle
                            ? "opacity-30 cursor-not-allowed"
                            : "opacity-100 cursor-pointer"
                        }`}
                        disabled={addToggle ? true : false}
                      >
                        <div className="w-[19.54px] h-auto mr-[5px] my-auto">
                          <img
                            src={FilterMobile}
                            alt="filter"
                            className="object-contain object-center size-full"
                          />
                        </div>
                        <div className=" font-Lora font-bold text-[15px] leading-[19.2px]">
                          Filter
                        </div>
                      </button>
                      <button
                        onClick={() => setAddToggle(true)}
                        className={
                          editable
                            ? `opacity-30 cursor-not-allowed`
                            : "opacity-100 cursor-pointer"
                        }
                        disabled={editable ? true : false}
                      >
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
                    </div>
                  </div>
                  {addToggle ? (
                    <AddButton
                      toast={toast}
                      classNameID={classNameID[0]}
                      studentIDs={studentIDs}
                      className={className}
                      setAddToggle={setAddToggle}
                      addToggle={addToggle}
                    />
                  ) : (
                    <Outlet
                      context={{
                        toast,
                        classStudentsIdData,
                        studentData,
                        className,
                        classNameID: classNameID[0],
                        editable,
                        setEditable,
                        isClassLoading,
                        isClassStudentsIdLoading,
                        isClassError,
                        isClassStudentsIdError,
                      }}
                    />
                  )}
                </div>
                {/* Desktop view */}
                <table className="w-full border-collapse border-none hidden md:table rounded-[20px] shadow-[0px_1px_25px_0px_#389FA61A]">
                  <thead>
                    <tr className="table-row-header">
                      {tableHeader.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  {isClassLoading ||
                  isClassStudentsIdLoading ||
                  classNameID.length <= 0 ? (
                    <tbody>
                      <tr>
                        <td
                          className="py-4 font-Lora text-center font-bold my-[10%] lg:my-[15%] min-h-[152px]"
                          colSpan={6}
                        >
                          <Loader />
                        </td>
                      </tr>
                    </tbody>
                  ) : isClassError ||
                    isClassStudentsIdError ||
                    classNameID.length <= 0 ? (
                    <tbody>
                      <tr>
                        <td
                          className="py-4 font-Lora text-center font-bold my-[10%] lg:my-[15%] min-h-[152px]"
                          colSpan={6}
                        >
                          <span>Error fetching data</span>
                        </td>
                      </tr>
                    </tbody>
                  ) : classStudentsIdData &&
                    Array.isArray(classStudentsIdData.data.data) ? (
                    <tbody>
                      {studentData?.map((data, index) => (
                        <tr
                          key={index}
                          className={
                            id === data.id.toString()
                              ? "table-row-details-active table-row-details"
                              : "table-row-details"
                          }
                          onClick={
                            () => (
                              navigate(
                                id === data.id?.toString()
                                  ? ""
                                  : data.id.toString()
                              ),
                              toast.success("Testing")
                            )
                            // setTableActive(tableActive === index ? null : index),
                          }
                        >
                          <td>
                            <div className="flex flex-row items-center">
                              <input
                                type="checkbox"
                                name="name"
                                autoComplete="false"
                                id={data.id.toString()}
                                className=" size-[14px] checked:bg-black accent-[#05878F] appearance-auto hover:accent-[#05878F] border-[#05878F] cursor-pointer"
                                onChange={() => {}}
                                checked={
                                  id === data.id.toString() ? true : false
                                }
                              />
                              <div className="max-w-[20px] size-[20px] h-[20px] rounded-full overflow-hidden mr-[5px] ml-[10px]">
                                <img
                                  src={data.image || profileImage}
                                  alt="student image"
                                  className="size-full object-cover object-center"
                                  onError={(e) =>
                                    (e.currentTarget.src = profileImage)
                                  }
                                />
                              </div>
                              <div className="md:max-w-[130px] lg:max-w-[170px] whitespace-nowrap overflow-hidden text-ellipsis">
                                {data.full_name}
                              </div>
                            </div>
                          </td>
                          <td className="">{data.id}</td>
                          <td className="">{data.age}</td>
                          <td className="">{data.gender}</td>
                          <td className="">{data.starter_pack}</td>
                          <td className="text-center">
                            <div className="flex flex-row justify-center">
                              <Link
                                to={`tel:${data.fathers_contact}`}
                                className={`mr-[15px] size-[20px] rounded-full flex justify-center items-center ${
                                  id === data.id.toString()
                                    ? "active-call-contact bg-[#05878F]"
                                    : "bg-[white]"
                                }`}
                              >
                                <div className="max-w-[10px] size-[10px]">
                                  <CallSVG />
                                </div>
                              </Link>
                              <Link
                                to={`mailto:${data.guardian_email}`}
                                className={`size-[20px] rounded-full flex justify-center items-center ${
                                  id === data.id.toString()
                                    ? "active-message-contact bg-[#05878F]"
                                    : "bg-[white]"
                                }`}
                              >
                                <div className="max-w-[10px] size-[10px]">
                                  <MessageSVG />
                                </div>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    classStudentsIdData && (
                      <tbody>
                        <tr>
                          <td
                            className="py-4 font-Lora text-center font-bold my-[10%] lg:my-[15%]"
                            colSpan={6}
                          >
                            Data Not Available
                          </td>
                        </tr>
                      </tbody>
                    )
                  )}
                </table>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center min-h-[calc(100vh-80px-145.53px-40px)] ml:min-h-[calc(100vh-80px-148.03px-40px)] md:min-h-full">
                <div className="font-bold text-[30px] md:text-[23px]">
                  404 Not Found
                </div>
                <div className="text-xl mt-2">This class does not exist</div>
                <button
                  onClick={goBack}
                  className="text-base border py-2 px-4 border-solid rounded-lg text-nowrap border-[#05878F] text-white bg-[#05878F] mt-5"
                >
                  Go Back
                </button>
              </div>
            )}
          </>
        </div>
      </div>
      <div className="student-names-database">
        {addToggle ? (
          <AddButton
            toast={toast}
            classNameID={classNameID[0]}
            studentIDs={studentIDs}
            className={className}
            setAddToggle={setAddToggle}
            addToggle={addToggle}
          />
        ) : id &&
          classes.map((classes) => classes.name.toLowerCase()).includes(id) ? (
          <div className="flex justify-center items-center pt-[40px] md:pt-[39px] min-h-[calc(100%-40px)] px-10">
            <div className="text-center">
              Please click on a student to display their details.
            </div>
          </div>
        ) : (
          <Outlet
            context={{
              toast,
              classStudentsIdData,
              studentData,
              className,
              classNameID: classNameID[0],
              editable,
              setEditable,
              isClassLoading,
              isClassStudentsIdLoading,
              isClassError,
              isClassStudentsIdError,
            }}
          />
        )}
        {/* Nothing to show yet */}
      </div>
    </div>
  );
};

export default StudentAdminNames;