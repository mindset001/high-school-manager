import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { memo, useEffect, useMemo, useState } from "react";
import { getSubjects } from "../../services/api/calls/getApis";
import Loader from "../../shared/Loader";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
  generateTemplate,
  uploadResult,
} from "../../services/api/calls/postApis";
import { Link } from "react-router-dom";
// import { Link, useNavigate } from "react-router-dom";
interface subjectDataI {
  description: string;
  id: number;
  name: string;
}

interface selectedSubjectsDataI {
  subjects: string[];
  class_id: number;
}
const ResultOptions: React.FC<{
  optionsToggle: boolean;
  setOptionsToggle: React.Dispatch<React.SetStateAction<boolean>>;
  classActiveID: number;
  setFilePreview: React.Dispatch<React.SetStateAction<[]>>;
  setFilePreviewToggle: React.Dispatch<React.SetStateAction<boolean>>;
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
}> = ({
  optionsToggle,
  setOptionsToggle,
  classActiveID,
  setFilePreview,
  setFilePreviewToggle,
  fileName,
  setFileName,
}) => {
  const [selectedFile, setSelectedFile] = useState<{
    file: File | null;
    stu_class: number;
  }>({
    file: null,
    stu_class: 0,
  });

  const [subjectToggle, setSubjectToggle] = useState<boolean>(false);
  const [subjectDataArr, setSubjectDataArr] = useState<subjectDataI[]>([]);
  const [selectedSubjectsData, setSelectedSubjectsData] =
    useState<selectedSubjectsDataI>({
      subjects: [],
      class_id: classActiveID,
    });
  const [downloadTemplate, setDownloadTemplate] = useState("");
  useEffect(() => {
    console.log("Selected Subjects", selectedSubjectsData);
  }, [selectedSubjectsData]);
  // GETTING CLASS Data
  const {
    data: subject,
    isError: isSubjectError,
    // error: subjectError,
    isLoading: isSubjectLoading,
  } = useQuery({
    queryKey: ["subject"],
    queryFn: () => getSubjects(),
  });

  const subjectData: subjectDataI[] = useMemo(() => {
    return (subject && subject?.data?.data) || [];
  }, [subject]);

  useEffect(() => {
    // console.log("Subjectsss", subjectData);
    subjectData && setSubjectDataArr(subjectData);
  }, [subjectData]);

  const handleCheckboxChange = (subjectName: string) => {
    setSelectedSubjectsData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectName)
        ? prev.subjects.filter((name) => name !== subjectName)
        : [...prev.subjects, subjectName],
    }));
  };

  // ///////////////////////
  // Submit Subject POST Request
  const queryClient = useQueryClient();
  const useGenerateTemplate = useMutation({
    mutationFn: generateTemplate,
  });
  const { mutate: mutateTemp, isPending: isSubmittingSubject } =
    useGenerateTemplate;
  const handleSubmitSelectedSubject = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    mutateTemp(selectedSubjectsData, {
      onSuccess: (response: { data: { data: { download_link: string } } }) => {
        queryClient.invalidateQueries({ queryKey: ["subject"] });
        const generatedTemp = response.data.data.download_link;
        generatedTemp && setDownloadTemplate(generatedTemp);
        toast.success("Result Template generated successfully!");
        setSubjectToggle(false);
      },
      onError: (error: { message: string }) => {
        console.error("Error generating template: ", error);
        toast.error("Error generating template: " + error.message);
      },
    });
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = (event: { target: any }) => {
    const fileData = event.target.files[0];
    if (
      fileData &&
      fileData?.name?.split(".")[fileData?.name?.split(".").length - 1] !==
        "xlsx"
    ) {
      toast.error("Only Spreadsheet (.xlsx) file is allowed!");
      return;
    }
    // const fileLength =
    //   fileData.name.length > 10
    //     ? `${fileData.name.split(".")[0].slice(0, 10)}...${fileData.name
    //         .split(".")
    //         .pop()}`
    //     : fileData.name;
    setSelectedFile((prev) => ({
      ...prev,
      file: fileData,
      stu_class: classActiveID,
    }));
    setFileName(fileData ? fileData.name : "No file selected");

    console.log("xlsx file", fileData + ",,," + selectedFile.file?.name);
    if (fileData) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event?.target?.result;
        if (result && typeof result !== "string") {
          const data = new Uint8Array(result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const jsonData: any = XLSX.utils.sheet_to_json(sheet);
          setFilePreview(jsonData);
        }
      };
      reader.readAsArrayBuffer(fileData);
    }
  };

  // ///////////////////////
  // Submit/Upload File .xlsx data POST Request

  const useUploadResult = useMutation({
    mutationFn: uploadResult,
  });
  const { mutate: mutateResult, isPending: isUploadingResult } =
    useUploadResult;
  const handleUploadResult = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const data = new FormData();
    if (selectedFile.file) {
      data.append("file", selectedFile.file);
      data.append("stu_class", selectedFile.stu_class as unknown as string);
    }
    console.log("Testing formData()", data);
    mutateResult(data, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["subject"] });
        // const resultResponse = response.data.data.download_link;
        // generatedTemp && setDownloadTemplate(generatedTemp);
        // console.log("Result response", resultResponse);
        toast.success("Result uploaded successfully!");
        setOptionsToggle(false);
      },
      onError: (error: { message: string }) => {
        console.error("Error uploading result: ", error);
        toast.error("Error uploading result: " + error.message);
      },
    });
  };

  useEffect(() => {
    console.log("Temp", downloadTemplate.replace("http", "https"));
  }, [downloadTemplate]);
  //   const navigate = useNavigate();

  return (
    <div
      className={`results-options ${optionsToggle ? "flex" : "hidden md:flex"}`}
    >
      <div className="border bg-white relative md:static">
        <button
          className="w-full flex flex-row gap-1 justify-center"
          onClick={() => setSubjectToggle((prev) => !prev)}
        >
          <div>Select Subject</div>
          <div
            className={`ml-3 text-[12px] ${
              subjectToggle
                ? "rotate-180 duration-300"
                : "rotate-0 duration-300"
            }
                `}
          >
            &#9660;
          </div>
        </button>
        <form
          onSubmit={handleSubmitSelectedSubject}
          className={`md:mt-2  absolute md:static z-20 bg-white border-b-2  w-full ${
            subjectToggle ? "block" : "hidden"
          }`}
        >
          <div className="max-h-[200px] overflow-y-auto">
            {isSubjectLoading ? (
              <div className=" font-Lora text-center w-full min-h-[152px] flex flex-row justify-center items-center">
                <Loader />
              </div>
            ) : isSubjectError ? (
              <div className=" font-Lora text-center w-full min-h-[152px] font-bold flex flex-row justify-center items-center">
                <span>Error fetching data</span>
              </div>
            ) : (
              subjectDataArr?.map((subjects, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => handleCheckboxChange(subjects.name)}
                    className="flex flex-row gap-2 px-2 py-[3px] md:py-[4px] border hover:bg-slate-300 cursor-pointer text-base md:text-sm xl:text-base "
                  >
                    <input
                      type="checkbox"
                      id={subjects.name}
                      name={subjects.name}
                      value={subjects.name}
                      onChange={() => {}}
                      checked={selectedSubjectsData.subjects.includes(
                        subjects.name
                      )}
                      className="  checked:bg-black accent-[#05878F] appearance-auto hover:accent-[#05878F] border-[#05878F] cursor-pointer"
                    />
                    <span>
                      {subjects.name.length > 17
                        ? subjects.name.slice(0, 17) + ".."
                        : subjects.name}
                    </span>
                    <br />
                  </div>
                );
              })
            )}
          </div>
          <button
            type="submit"
            disabled={
              isSubmittingSubject || selectedSubjectsData.subjects.length <= 0
            }
            className={`w-full ${
              selectedSubjectsData.subjects.length <= 0 || isSubmittingSubject
                ? "cursor-not-allowed bg-[#c2cacf] hover:bg-[#c2cacf] text-slate-400"
                : "cursor-pointer bg-[#05878F] hover:bg-[#05878F]/70 text-white"
            }`}
          >
            {isSubmittingSubject
              ? "Submitting..."
              : `Submit Subject (${selectedSubjectsData.subjects.length})`}
          </button>
        </form>
      </div>
      <Link to={downloadTemplate}>
        <button
          onClick={() => setOptionsToggle(false)}
          disabled={!downloadTemplate}
          className={` w-full ${
            !downloadTemplate
              ? "cursor-not-allowed bg-[#c2cacf] hover:bg-[#c2cacf] text-slate-400"
              : "cursor-pointer bg-[#05878F] hover:bg-[#05878F]/70 text-white"
          }`}
        >
          Download Template
        </button>
      </Link>
      <div className="file-upload text-base md:text-sm lg:text-base relative">
        <label
          //   htmlFor="file-input"
          onClick={() => {}}
          className="custom-file-label text-base md:text-sm lg:text-base w-full"
        >
          Select File Field (xlsx)
        </label>
        <div className="flex flex-col justify-center items-center">
          <input
            type="file"
            id="file-input"
            className="custom-file-input w-[100px] md:w-[100px] lg:w-[100px] cursor-pointer mt-2"
            onChange={handleFileChange}
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
          <span id="file-name" className="truncate px-3">
            {fileName !== "No file selected" && fileName.length > 10
              ? `${fileName.split(".")[0].slice(0, 10)}...${fileName
                  .split(".")
                  .pop()}`
              : fileName}
          </span>
        </div>
      </div>
      {/* <div key={selectedFile.file?.name || "no-file"}>
        <input type="file" id="filee" onChange={handleFileChange} />
        <br /><br /> <br />
        <label htmlFor="filee" className="my-9 border">Selected File: {selectedFile.file?.name || "None"}</label>
        <button
          disabled={!selectedFile.file}
          onClick={() => console.log("Uploading:", selectedFile.file)}
        >
          Upload
        </button>
      </div> */}
      <button
        disabled={!selectedFile.file}
        onClick={() => setFilePreviewToggle(true)}
        // type="submit"
        className={
          !selectedFile.file
            ? "cursor-not-allowed bg-[#c2cacf] hover:bg-[#c2cacf] text-slate-400"
            : "cursor-pointer bg-[#05878F] hover:bg-[#05878F]/70 text-white"
        }
      >
        {"Preview File"}
      </button>
      <button
        disabled={!selectedFile.file}
        onClick={handleUploadResult}
        // type="submit"
        className={
          !selectedFile.file
            ? "cursor-not-allowed bg-[#c2cacf] hover:bg-[#c2cacf] text-slate-400"
            : "cursor-pointer bg-[#05878F] hover:bg-[#05878F]/70 text-white"
        }
      >
        {isUploadingResult ? "Uploading..." : "Upload Result"}
      </button>

      {/* {selectedFile.file && (
        <ul className="fixed top-96 left-96 right-10 bottom-10 bg-white z-[99999] text-[12px]">
          {filePreview.map((row, index) => (
            <li key={index}>{JSON.stringify(row)}</li>
          ))}
        </ul>
      )} */}
    </div>
  );
};

export default memo(ResultOptions);
