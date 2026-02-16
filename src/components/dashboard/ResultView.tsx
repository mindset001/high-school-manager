// import React, { useEffect, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getClassStudentResult } from "../../services/api/calls/getApis";
import Loader from "../../shared/Loader";

const ResultView: React.FC<{
  studentID: number;
  className: string;
  resultViewToggle: boolean;
  setResultViewToggle: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  studentID,
  className: classByName,
  resultViewToggle,
  setResultViewToggle,
}) => {
  const handlePrint = () => {
    window.print();
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  // Interface for individual result entries
  interface Result {
    id: number;
    subject: string;
    test_score: number;
    exam_score: number;
    total: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // For any additional fields not shown
  }

  // Interface for the main student data
  interface StudentResultData {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string;
    gender: string;
    results: Result[];
  }

  const [studentResultData, setStudentResultData] =
    useState<StudentResultData | null>(null);
  // GETTING Student Data
  const {
    data: studentResultRawData,
    isError: isStudentResultError,
    // error: studentsError,
    isLoading: isStudentResultLoading,
  } = useQuery({
    queryKey: ["subjectresult", studentID],
    queryFn: () => getClassStudentResult(studentID),
    enabled: studentID > 0,
  });

  useEffect(() => {
    console.log(
      "classStudentResult Data and ID :",
      studentID,
      studentResultData,
      isStudentResultError,
      isStudentResultLoading
    );
    studentResultRawData &&
      setStudentResultData(studentResultRawData?.data?.data[0]);
  }, [
    studentID,
    studentResultData,
    isStudentResultError,
    isStudentResultLoading,
    studentResultRawData,
  ]);

  return (
    resultViewToggle &&
    ResultView.length > 0 && (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-[99999]  p-7 w-full flex flex-col flex-1 font-Lora overflow-x-scroll md:overflow-scroll text-nowrap whitespace-nowrap min-h-screen">
        {isStudentResultLoading ? (
          <div className=" font-Lora text-center min-h-[152px] flex flex-row justify-center items-center w-full">
            <Loader />
          </div>
        ) : isStudentResultError ? (
          <div className=" font-Lora text-center w-full font-bold min-h-[152px] flex flex-row justify-center items-center ">
            <span>Error getting data</span>
          </div>
        ) : (
          <div className="overflow-auto w-full flex flex-col flex-1 min-w-[660px] md:min-w-full">
            <div className="font-semibold  text-center my-4">
              <div className="mb-2 gap-10 flex flex-row justify-between items-center text-nowrap">
                <div></div>
                <div className="font-bold text-lg lg:text-xl">REPORT SHEET</div>
                <div className="">2nd term</div>
              </div>
              {/* <div>
              <span className="mr-2">CLASS:</span>
              <span>{className.toUpperCase()}</span>
            </div> */}
            </div>

            <div className="flex flex-col items-center font-semibold text-base">
              <div className="flex gap-1 w-full">
                <div className="text-nowrap">STUDENT'S NAME:</div>
                <div className="flex-1 flex justify-center">
                  {/* Border-bottom applied directly to mimic a table row */}
                  <div className="border-b-[1px] border-black w-full text-center">
                    {`${studentResultData?.last_name} ${studentResultData?.first_name} ${studentResultData?.middle_name}`}
                  </div>
                </div>
              </div>
              <div className="flex flex-row w-full gap-2">
                <div className="w-[60%] ">
                  <div className="mb-[4px]">1. ATTENDANCE</div>
                  <div className="attendance-table">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td>Frequencies</td>
                          <td>School Attendance</td>
                        </tr>
                        <tr>
                          <td>No of times School Opened</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>No of times Present</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>No of times Absent</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="w-[40%] text-nowrap">
                  <div className="flex flex-row text-[15px] mb-[4px] w-full gap-1">
                    <div className="flex flex-row w-1/2">
                      <div>Class:</div>
                      <div className="pl-1 flex-1">
                        <div className="border-b-[1px] border-black w-full text-center">
                          {classByName.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row w-1/2">
                      <div>Date:</div>
                      <div className="pl-1 flex-1">
                        <div className="border-b-[1px] border-black w-full text-center">
                          {new Date().toLocaleDateString("en-US")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="classDate-table">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td>
                            <div className="flex flex-row">
                              <div>No in Class:</div>
                              <div className="pl-1 flex-1">
                                <div className="border-b-[1px] border-black w-full text-center">
                                  {studentResultData?.id}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="flex flex-row">
                              <div>Position:</div>
                              <div className="pl-1 flex-1">
                                <div className="border-b-[1px] border-black w-full text-center">
                                  {"Nil"}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full font-semibold my-1 break">
              <div className="mb-[4px]">2. COGNITIVE ABILITY</div>
              <div className="cognitive-table">
                <table className="w-full text-[14px]">
                  <tbody>
                    <tr>
                      <td colSpan={9} className="text-base">
                        CONTINUOUS ASSESSMENT
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td className="vertical-text">First Periodic Test</td>
                      <td className="vertical-text">Second Periodic Test</td>
                      <td className="vertical-text">End of Term Exam</td>
                      <td className="vertical-text">Overall for Term</td>
                      <td className="vertical-text">TOTAL</td>
                      <td className="vertical-text">Position</td>
                      <td className="vertical-text">Grading</td>
                      <td className="vertical-text">TEACHER'S REMARK</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="flex justify-between px-2">
                          <span>SUBJECT</span>
                          <span>Mx</span>
                        </div>
                      </td>
                      <td>20</td>
                      <td>20</td>
                      <td>60</td>
                      <td>100%</td>
                      <td>100</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    {studentResultData?.results?.map((result) => (
                      <tr key={result.id}>
                        <td className="border px-4 py-2">{result.subject}</td>
                        <td></td>
                        <td className="border px-4 py-2">
                          {result.test_score}
                        </td>
                        <td className="border px-4 py-2">
                          {result.exam_score}
                        </td>
                        <td></td>
                        <td className="border px-4 py-2">{result.total}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                    <tr>
                      <td>Total</td>
                      <td></td>
                      <td>
                        {studentResultData?.results?.length
                          ? studentResultData.results
                              .map((result) => result.test_score)
                              .reduce((a, b) => a + b, 0)
                          : 0}
                      </td>

                      <td>
                        {studentResultData?.results?.length
                          ? studentResultData.results
                              .map((result) => result.exam_score)
                              .reduce((a, b) => a + b, 0)
                          : 0}
                      </td>
                      <td></td>
                      <td>
                        {studentResultData?.results?.length
                          ? studentResultData.results
                              .map((result) => result.total)
                              .reduce((a, b) => a + b, 0)
                          : 0}
                      </td>

                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>PERCENTAGE</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-between my-1 font-semibold">
              <div className="w-[40%] text-sm">
                <div className="attendance-table">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td>3. PSYCHOMOTOR SKILLS</td>
                        <td>Grading</td>
                      </tr>
                      <tr>
                        <td>Handwriting</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Verbal Fluency/Oral</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Game</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Sports</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Handling Tools</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Drawing & Painting</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Music Skills</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-1">
                  <h3>ANALYSIS OF GRADING</h3>
                  <p>A - Excellent</p>
                  <p>B - Good</p>
                  <p>C - Average</p>
                  <p>D - Below Average</p>
                  <p>E - Poor</p>
                </div>
              </div>
              <div className="w-[40%] text-sm">
                <div className="attendance-table">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td>4. AFFECTIVE AREA</td>
                        <td>Grading</td>
                      </tr>
                      <tr>
                        <td>Punctuality</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Neatness</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Honesty</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Cooperation with others</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Leadership</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Helping Others</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Emotional Stability</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Health</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Attitude to school works</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Attentiveness</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Perseverance</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="font-semibold my-1">
              <div className="flex">
                <div className="flex w-[75%]">
                  <div>Class Teacher's Comment</div>
                  <div className="pl-1 flex-1">
                    <div className="border-b-[1px] border-black w-full">
                      {":"}
                    </div>
                  </div>
                </div>
                <div className="flex w-[25%]">
                  <div>Signature</div>
                  <div className="pl-1 flex-1">
                    <div className="border-b-[1px] border-black w-full">
                      {":"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full">
                <div>Headmaster's / Headmistress's Comment</div>
                <div className="pl-1 flex-1">
                  <div className="border-b-[1px] border-black w-full">
                    {":"}
                  </div>
                </div>
              </div>
              <div className="flex">
                <div className="flex w-[50%]">
                  <div>Signature ( Date / School Stamp )</div>
                  <div className="pl-1 flex-1">
                    <div className="border-b-[1px] border-black w-full">
                      {":"}
                    </div>
                  </div>
                </div>
                <div className="flex w-[50%]">
                  <div>Parent's Signature and Date</div>
                  <div className="pl-1 flex-1">
                    <div className="border-b-[1px] border-black w-full">
                      {":"}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div></div> */}
            </div>

            {/* <div className={`my-5 font-semibold block`}>
            <span className="font-bold">Note:*</span> If the document exceeds the
            screen size when printing, adjust the print layout to Landscape and/or
            reduce the printing scale in the "More Settings" section to ensure it
            fits on the page.
          </div> */}
            <div className="tablebody-button">
              <button onClick={handlePrint}>Print</button>
              <button onClick={() => setResultViewToggle(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default ResultView;
