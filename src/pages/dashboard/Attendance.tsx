import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getBaseClass, getClassStudentsId, getStaffs } from "../../services/api/calls/getApis";
import { 
  useAttendance, 
  useSaveAttendance, 
  IAttendanceRecord,
  useStaffAttendance,
  useSaveStaffAttendance,
  IStaffAttendanceRecord,
  useClassAttendanceReport,
  useStaffAttendanceReport
} from "../../services/api/attendance";
import Loader from "../../shared/Loader";
import moment from "moment";
import { getRole } from "../../utils/authTokens";

const Attendance: React.FC = () => {
  const role = getRole();
  const [viewMode, setViewMode] = useState<'student' | 'staff' | 'report'>('student');
  
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(moment().format("YYYY-MM-DD"));
  
  // Report state
  const [reportTarget, setReportTarget] = useState<'student' | 'staff'>('student');
  const [startDate, setStartDate] = useState<string>(moment().startOf('month').format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState<string>(moment().endOf('month').format("YYYY-MM-DD"));

  const [attendanceState, setAttendanceState] = useState<Record<string, { status: string, remarks: string }>>({});

  // Base Queries
  const { data: classesData } = useQuery({ queryKey: ["classes"], queryFn: getBaseClass });
  const classesList = classesData?.data?.classes || [];

  const { data: staffsData, isLoading: isLoadingStaff } = useQuery({ queryKey: ["staffs"], queryFn: getStaffs });
  const staffsList = staffsData?.data?.data || [];

  useEffect(() => {
    if (!selectedClass && classesList.length > 0) {
      setSelectedClass(classesList[0].name);
      setSelectedClassId(classesList[0]._id || classesList[0].id);
    }
  }, [classesList, selectedClass]);

  // STUDENT ROLL CALL QUERY
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["classStudents", selectedClassId],
    queryFn: () => getClassStudentsId(selectedClassId),
    enabled: !!selectedClassId && (viewMode === 'student' || (viewMode === 'report' && reportTarget === 'student')),
  });
  const studentsList = studentsData?.data?.students || [];

  const { data: studentAttendanceData, isLoading: isLoadingStudentAtt } = useAttendance(selectedClass, selectedDate);
  const saveStudentMutation = useSaveAttendance();

  // STAFF ROLL CALL QUERY
  const { data: staffAttendanceData, isLoading: isLoadingStaffAtt } = useStaffAttendance(selectedDate);
  const saveStaffMutation = useSaveStaffAttendance();

  // REPORT QUERIES
  const { data: classReportData, isLoading: isLoadingClassReport } = useClassAttendanceReport(selectedClass, startDate, endDate);
  const { data: staffReportData, isLoading: isLoadingStaffReport } = useStaffAttendanceReport(startDate, endDate);

  // Initialize form state
  useEffect(() => {
    if (viewMode === 'report') return;

    const newState: Record<string, { status: string, remarks: string }> = {};
    
    if (viewMode === 'student') {
      studentsList.forEach((student: any) => {
        newState[student._id || student.id] = { status: 'Present', remarks: '' };
      });
      if (studentAttendanceData && studentAttendanceData.records) {
        studentAttendanceData.records.forEach((record: any) => {
          const studentId = record.student._id || record.student.id || record.student;
          if (newState[studentId]) {
            newState[studentId] = { status: record.status, remarks: record.remarks || '' };
          }
        });
      }
    } else if (viewMode === 'staff') {
      staffsList.forEach((staff: any) => {
        newState[staff._id || staff.id] = { status: 'Present', remarks: '' };
      });
      if (staffAttendanceData && staffAttendanceData.records) {
        staffAttendanceData.records.forEach((record: any) => {
          const staffId = record.staff._id || record.staff.id || record.staff;
          if (newState[staffId]) {
            newState[staffId] = { status: record.status, remarks: record.remarks || '' };
          }
        });
      }
    }

    setAttendanceState(newState);
  }, [viewMode, studentsList, staffsList, studentAttendanceData, staffAttendanceData]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const className = e.target.value;
    setSelectedClass(className);
    const cls = classesList.find((c: any) => c.name === className);
    if (cls) setSelectedClassId(cls._id || cls.id);
  };

  const handleStatusChange = (id: string, status: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const handleRemarksChange = (id: string, remarks: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [id]: { ...prev[id], remarks }
    }));
  };

  const handleSave = async () => {
    if (viewMode === 'student') {
      const records: IAttendanceRecord[] = Object.keys(attendanceState).map(studentId => ({
        student: studentId,
        status: attendanceState[studentId].status as 'Present'|'Absent'|'Late',
        remarks: attendanceState[studentId].remarks,
      }));

      try {
        await saveStudentMutation.mutateAsync({ className: selectedClass, date: selectedDate, records });
        toast.success("Student attendance saved successfully!");
      } catch (error) {
        toast.error("Failed to save attendance.");
      }
    } else {
      const records: IStaffAttendanceRecord[] = Object.keys(attendanceState).map(staffId => ({
        staff: staffId,
        status: attendanceState[staffId].status as 'Present'|'Absent'|'Late'|'On Leave',
        remarks: attendanceState[staffId].remarks,
      }));

      try {
        await saveStaffMutation.mutateAsync({ date: selectedDate, records });
        toast.success("Staff attendance saved successfully!");
      } catch (error) {
        toast.error("Failed to save staff attendance.");
      }
    }
  };

  const renderReport = () => {
    const isLoadingReport = reportTarget === 'student' ? isLoadingClassReport : isLoadingStaffReport;
    const reportList = reportTarget === 'student' ? (classReportData?.data || []) : (staffReportData?.data || []);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-600">Report Target:</label>
            <select 
              className="border-2 border-gray-200 rounded-lg p-2 font-medium outline-none text-[#05878F]"
              value={reportTarget}
              onChange={(e) => setReportTarget(e.target.value as 'student' | 'staff')}
            >
              <option value="student">Student Class</option>
              <option value="staff">All Staff</option>
            </select>
          </div>

          {reportTarget === 'student' && (
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium text-gray-600">Class:</label>
              <select 
                className="border-2 border-gray-200 rounded-lg p-2 font-medium outline-none text-[#05878F]"
                value={selectedClass}
                onChange={handleClassChange}
              >
                {classesList.map((cls: any, i: number) => (
                  <option key={i} value={cls.name || cls}>{cls.name || cls}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-600">From:</label>
            <input 
              type="date" 
              className="border-2 border-gray-200 rounded-lg p-2 font-medium outline-none text-gray-700"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-600">To:</label>
            <input 
              type="date" 
              className="border-2 border-gray-200 rounded-lg p-2 font-medium outline-none text-gray-700"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {isLoadingReport ? (
          <div className="flex justify-center mt-10"><Loader /></div>
        ) : reportList.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            No attendance records found for this period.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-100 text-gray-600 text-sm">
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold text-center">Total Recorded</th>
                    <th className="p-4 font-semibold text-center text-green-600">Present</th>
                    <th className="p-4 font-semibold text-center text-orange-500">Late</th>
                    <th className="p-4 font-semibold text-center text-red-500">Absent</th>
                    {reportTarget === 'staff' && <th className="p-4 font-semibold text-center text-purple-600">On Leave</th>}
                    <th className="p-4 font-semibold text-center">% Present</th>
                  </tr>
                </thead>
                <tbody>
                  {reportList.map((row: any, i: number) => {
                    const person = reportTarget === 'student' ? row.student : row.staff;
                    const fName = reportTarget === 'student' ? (person.userId?.firstName || person.firstName) : person.firstName;
                    const lName = reportTarget === 'student' ? (person.userId?.lastName || person.lastName) : person.lastName;
                    const identifier = reportTarget === 'student' ? person.studentId : person.staffId;
                    
                    const presentPercent = row.total > 0 ? Math.round(((row.present + row.late) / row.total) * 100) : 0;

                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-4">
                          <p className="font-semibold text-gray-800">{fName} {lName}</p>
                          <p className="text-xs text-gray-500">{identifier}</p>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-700">{row.total}</td>
                        <td className="p-4 text-center font-bold text-green-600 bg-green-50/30">{row.present}</td>
                        <td className="p-4 text-center font-bold text-orange-500 bg-orange-50/30">{row.late}</td>
                        <td className="p-4 text-center font-bold text-red-500 bg-red-50/30">{row.absent}</td>
                        {reportTarget === 'staff' && (
                          <td className="p-4 text-center font-bold text-purple-600 bg-purple-50/30">{row.onLeave}</td>
                        )}
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            presentPercent >= 90 ? 'bg-green-100 text-green-700' :
                            presentPercent >= 75 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {presentPercent}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRollCall = () => {
    const isLoading = viewMode === 'student' 
      ? (isLoadingStudents || isLoadingStudentAtt) 
      : (isLoadingStaff || isLoadingStaffAtt);

    const dataList = viewMode === 'student' ? studentsList : staffsList;
    const isSaving = saveStudentMutation.isPending || saveStaffMutation.isPending;

    return (
      <>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <input 
            type="date" 
            className="border-2 border-gray-200 rounded-lg p-2 font-medium outline-none text-gray-700 bg-white shadow-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={moment().format("YYYY-MM-DD")}
          />

          {viewMode === 'student' && (
            <select 
              className="border-2 border-gray-200 rounded-lg p-2 font-medium outline-none text-[#05878F] bg-white shadow-sm"
              value={selectedClass}
              onChange={handleClassChange}
            >
              {classesList.map((cls: any, i: number) => (
                <option key={i} value={cls.name || cls}>{cls.name || cls}</option>
              ))}
            </select>
          )}

          <button 
            onClick={handleSave}
            disabled={isSaving || dataList.length === 0}
            className="bg-[#05878F] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#046A7E] transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Roll Call"}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center mt-20"><Loader /></div>
        ) : dataList.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            No {viewMode} records found.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-100 text-gray-600 text-sm">
                    <th className="p-4 font-semibold w-1/3">Name</th>
                    <th className="p-4 font-semibold w-2/5 text-center">Status</th>
                    <th className="p-4 font-semibold w-1/3">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((person: any) => {
                    const pId = person._id || person.id;
                    const state = attendanceState[pId] || { status: 'Present', remarks: '' };

                    const fName = viewMode === 'student' ? (person.userId?.firstName || person.firstName) : person.firstName;
                    const lName = viewMode === 'student' ? (person.userId?.lastName || person.lastName) : person.lastName;
                    const identifier = viewMode === 'student' ? person.studentId : person.staffId;

                    return (
                      <tr key={pId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${viewMode === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                              {fName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{fName} {lName}</p>
                              <p className="text-xs text-gray-500">{identifier || "No ID"}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="flex flex-wrap justify-center items-center gap-2 bg-gray-100 p-1.5 rounded-lg w-max mx-auto border border-gray-200">
                            {['Present', 'Late', 'Absent', ...(viewMode === 'staff' ? ['On Leave'] : [])].map(status => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(pId, status)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                  state.status === status 
                                    ? `bg-white shadow-sm border border-gray-200 ${
                                        status === 'Present' ? 'text-green-600' :
                                        status === 'Late' ? 'text-orange-500' :
                                        status === 'Absent' ? 'text-red-500' :
                                        'text-purple-600'
                                      }`
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>

                        <td className="p-4">
                          <input 
                            type="text" 
                            placeholder="Note reason..."
                            value={state.remarks}
                            onChange={(e) => handleRemarksChange(pId, e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-[#05878F] focus:ring-1 focus:ring-[#05878F] outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-Poppins">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-Lora text-[#05878F]">
            {viewMode === 'report' ? "Attendance Reports" : "Roll Call"}
          </h1>
          <p className="text-gray-600 text-sm">
            {viewMode === 'report' ? "View aggregated attendance data." : "Mark daily attendance."}
          </p>
        </div>
        
        {role === 'admin' && (
          <div className="bg-white p-1 rounded-lg border border-gray-200 flex shadow-sm">
            <button 
              onClick={() => setViewMode('student')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'student' ? 'bg-[#05878F] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Students
            </button>
            <button 
              onClick={() => setViewMode('staff')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'staff' ? 'bg-[#05878F] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Staff
            </button>
            <button 
              onClick={() => setViewMode('report')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'report' ? 'bg-[#05878F] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Reports
            </button>
          </div>
        )}
      </div>

      {viewMode === 'report' ? renderReport() : renderRollCall()}
    </div>
  );
};

export default Attendance;