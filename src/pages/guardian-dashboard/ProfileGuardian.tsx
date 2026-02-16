import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

// import ProfileImage from "../../assets/images/profile/profile-image.png";
// import ProfileImageDesktop from "../../assets/images/profile/profile-image_desktop.png";
// import CallImg from "../../assets/images/profile/call.png";
// import MessageImg from "../../assets/images/profile/message.png";
import useGuardianWardId from "../../hooks/useGuardianWardId";
import Loader from "../../shared/Loader";
import { profileImage } from "../../assets/images/users";
import MessageSVG from "../../components/svg/student/MessageSVG";
import CallSVG from "../../components/svg/student/CallSVG";
interface guardianWardFilteredInterface {
  // id: number;
  // student_class: string;
  // guardian_email: string;
  // name: string;
  // date_of_birth: string;
  // gender: string;
  // fathers_name: string;
  // mothers_name: string;
  // fathers_contact: string;
  // mothers_contact: string;
  // fathers_occupation: string;
  // mothers_occupation: string;
  // home_address: string;
  // state_of_origin: string;
  // home_town: string;
  // country: string;
  // starter_pack_collected: string;
  // religion: string;

  Name: string;
  ID: number;
  Class: string;
  DOB: string;
  Gender: string;
  "Father's Name": string;
  "Father's Occupation": string;
  "Father's Contact": string;
  "Mother's Name": string;
  "Mother's Occupation": string;
  "Mother's Contact": string;
  "Home Address": string;
  "Guardian's Email Address": string;
  Hometown: string;
  "State of Origin": string;
  Country: string;
  Religion: string;
  "Starter's Pack": string;
}

const formatDate = (date: Date) => {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const MobileHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <header className="profile_header">
      <div className="profile-box">
        <p className="text-[22px] text-white font-bold font-Lora">{title}</p>
        <div className="px-6 py-1.5 bg-white rounded-[10px]">
          <p className="text-[18px] text-clr1 font-bold font-Lora">
            {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
};

const ProfileGuardian: React.FC = () => {
  const [studentIndex] = useState(0);

  // const toggleStudentFn: (index: number) => void = (index) => {
  //   setStudentIndex(index);
  // };
  const {
    guardianWard,
    userId,
    isGuardianWardIdLoading,
    // guadianWardIdError,
    isGuardianWardIdError,
  } = useGuardianWardId();
  console.log("guardianWardssssssss", guardianWard);
  const students = [
    {
      Name:
        `${guardianWard.last_name} ${guardianWard.first_name} ${guardianWard.middle_name}` ||
        "",
      ID: guardianWard.id || 0,
      Class: guardianWard.student_class || "",
      DOB: guardianWard.date_of_birth || "",
      Gender: guardianWard.gender || "",
      "Father's Name": guardianWard.fathers_name || "",
      "Father's Occupation": guardianWard.fathers_occupation || "",
      "Father's Contact": guardianWard.fathers_contact || "",
      "Mother's Name": guardianWard.mothers_name || "",
      "Mother's Occupation": guardianWard.mothers_occupation || "",
      "Mother's Contact": guardianWard.mothers_contact || "",
      "Home Address": guardianWard.home_address || "",
      "Guardian's Email Address": guardianWard.guardian_email || "",
      Hometown: guardianWard.home_town || "",
      "State of Origin": guardianWard.state_of_origin || "",
      Country: guardianWard.country || "",
      Religion: guardianWard.religion || "",
      "Starter's Pack": guardianWard.starter_pack_collected
        ? "Collected"
        : "Not Collected",
    },
  ];

  const studentData: guardianWardFilteredInterface = students[studentIndex];
  // { [key: string]: string }
  const studentProps = useMemo(() => {
    return Object.keys(studentData).map((prop) => prop.toString());
  }, [studentData]);

  const studentId = studentData["ID"];
  const studentName = studentData["Name"];
  const studentClass = studentData["Class"];
  const age =
    new Date().getFullYear() - new Date(studentData["DOB"]).getFullYear();

  const otherProps = studentProps.filter(
    (prop) =>
      prop !== "Name" && prop !== "ID" && prop !== "Class" && prop !== "DOB"
  );

  return (
    <section className="">
      {/* mobile screen */}
      <div className="block md:hidden bg-clr1">
        <MobileHeader title="Profile" subtitle="Student Database" />

        <div className="rounded-t-[30px] flex flex-col gap-0 md:gap-5 pt-[20px] md:pt-0 md:mt-[30px] md:px-[30px] bg-white">
          {isGuardianWardIdLoading || userId.isUserLoading ? (
            <div className=" font-Lora text-center min-h-[152px] flex flex-row justify-center items-center md:items-start w-full">
              <Loader />
            </div>
          ) : isGuardianWardIdError || !userId.id ? (
            <div className=" font-Lora text-center w-full font-bold min-h-[152px] flex flex-row justify-center items-center">
              <span>Error fetching data</span>
            </div>
          ) : (
            <div className=" profile-section">
              <div className="profile-thumbnail">
                <div className="profile-picture">
                  <img
                    src={guardianWard.image || profileImage}
                    alt={`${guardianWard.last_name} ${guardianWard.last_name}`}
                    onError={(e) => (e.currentTarget.src = profileImage)}
                    className="w-full h-full object-cover rounded-[20px]"
                  />
                </div>
              </div>

              <div className="w-full py-10 px-6">
                <div className="flex flex-col gap-5 sm:gap-6">
                  {studentProps.map((prop, index) => {
                    const studentValue =
                      studentData[prop as keyof guardianWardFilteredInterface];

                    const value: Date | string | number =
                      prop === "DOB" ? new Date(studentValue) : studentValue;

                    const dateOfBirth =
                      value instanceof Date ? formatDate(value).split(" ") : [];

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-start"
                      >
                        <p className="text-[13px] sm:text-[15px] font-Lora font-bold">
                          {prop}
                        </p>
                        {value instanceof Date ? (
                          <div className="flex gap-2 sm:gap-3">
                            {dateOfBirth.map((date: string, index: number) => (
                              <p key={index} className="student-details">
                                {date}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="student-details">{value}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* desktop screen */}
      <div className="hidden md:block px-[30px]">
        {isGuardianWardIdLoading || userId.isUserLoading ? (
          <div className=" font-Lora text-center min-h-[152px] flex flex-row justify-center items-center md:items-start w-full">
            <Loader />
          </div>
        ) : isGuardianWardIdError || !userId.id ? (
          <div className=" font-Lora text-center w-full font-bold min-h-[152px] flex flex-row justify-center items-center">
            <span>Error fetching data</span>
          </div>
        ) : (
          <div className="profile-wrapper-desktop">
            <div className="profile-wrapper-picture-desktop">
              <div className="w-full h-full flex justify-center items-center">
                <img
                  src={guardianWard.image || profileImage}
                  alt={`${guardianWard.last_name} ${guardianWard.last_name}`}
                  onError={(e) => (e.currentTarget.src = profileImage)}
                  className="w-full h-full object-cover rounded-[20px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-10 w-full lg:basis-[45%] pl-10 pr-10 lg:pr-4 py-6 ">
              <div className="flex flex-col gap-3">
                <p className="lg:text-[13px] xl:text-[18px] font-Poppins font-medium">{`ID: ${studentId}`}</p>
                <div className="flex flex-col items-center gap-1.5">
                  <p className="lg:text-[23px] xl:text-[28px] font-Lora font-bold">
                    {studentName.split(" ").splice(0, 3).join(" ")}
                  </p>
                  <p className="lg:text-[13px] xl:text-[18px] font-Poppins font-medium">
                    {studentClass}
                  </p>
                  {/* <div className="flex justify-center items-center gap-2">
                    <button>
                      <img
                        src={CallImg}
                        alt="call"
                        className="size-3 xl:size-4"
                      />
                    </button>
                    <button>
                      <img
                        src={MessageImg}
                        alt="call"
                        className="width-3 h-auto xl:width-4"
                      />
                    </button>
                  </div> */}
                  <div className="flex flex-row justify-around md:justify-normal w-full md:w-auto">
                    <Link
                      to={`tel:${guardianWard.fathers_contact}`}
                      className="student-db-call mr-[10px] cursor-pointer"
                    >
                      <div className="w-[18.47px] h-auto">
                        <CallSVG />
                      </div>
                    </Link>
                    <Link
                      to={`mailto:${guardianWard.guardian_email}`}
                      className="student-db-email"
                    >
                      <div className="max-w-[18.47px] h-auto ml-[1px]">
                        <MessageSVG />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 xl:gap-2.5">
                  <div className="flex justify-between items-center">
                    <p className="profile-student-prop">Age:</p>
                    <p className="profile-student-value">{age.toString()}</p>
                  </div>
                  {otherProps.map((prop, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <p className="profile-student-prop">{prop}:</p>
                      <p className="profile-student-value">
                        {studentData[
                          prop as keyof guardianWardFilteredInterface
                        ].toString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end items-center">
                <Link to="/" className="result-nav-link">
                  Result
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileGuardian;
