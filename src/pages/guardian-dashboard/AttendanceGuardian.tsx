import React from "react";
import { useStudentAttendance } from "../../services/api/attendance";
import Loader from "../../shared/Loader";
import { getUser } from "../../utils/authTokens";
import moment from "moment";

const AttendanceGuardian: React.FC = () => {
  const guardian = getUser();
  // We need the student's ID (ObjectId).
  // `guardian.id` is actually the User ObjectId. Let's use it as we did in E-Portal.
  const studentId = String(guardian?.id || ""); 
  const loggedInStudentIdStr = guardian?.email?.toUpperCase();

  const { data: attendanceData, isLoading } = useStudentAttendance(studentId);

  const stats = attendanceData?.stats || { Present: 0, Absent: 0, Late: 0, total: 0 };
  const history = attendanceData?.history || [];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-Poppins">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-Lora text-[#05878F]">Attendance Record</h1>
        <p className="text-gray-600 text-sm">Viewing attendance history for {loggedInStudentIdStr}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center mt-20"><Loader /></div>
      ) : (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
              <span className="text-gray-500 text-sm font-semibold mb-2">Total Days Recorded</span>
              <span className="text-3xl font-bold text-gray-800">{stats.total}</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center border-b-4 border-b-green-500">
              <span className="text-gray-500 text-sm font-semibold mb-2">Present</span>
              <span className="text-3xl font-bold text-green-600">{stats.Present}</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center border-b-4 border-b-orange-400">
              <span className="text-gray-500 text-sm font-semibold mb-2">Late</span>
              <span className="text-3xl font-bold text-orange-500">{stats.Late}</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center border-b-4 border-b-red-500">
              <span className="text-gray-500 text-sm font-semibold mb-2">Absent</span>
              <span className="text-3xl font-bold text-red-600">{stats.Absent}</span>
            </div>
          </div>

          {/* Detailed History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700">Detailed History</h2>
            </div>
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No attendance records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record: any, index: number) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-700">
                          {moment(record.date).format("MMMM Do, YYYY")}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            record.status === 'Present' ? 'bg-green-100 text-green-700' :
                            record.status === 'Late' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {record.remarks || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceGuardian;
