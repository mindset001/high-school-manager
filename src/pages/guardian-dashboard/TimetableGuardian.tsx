import React, { useState, useEffect } from "react";
import { useTimetable, IDaySchedule } from "../../services/api/timetable";
import Loader from "../../shared/Loader";
import { getUser } from "../../utils/authTokens";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TimetableGuardian: React.FC = () => {
  const guardian = getUser();
  const loggedInStudentIdStr = guardian?.email?.toUpperCase();

  // In a real scenario, we'd fetch the student's class from their profile. 
  // For demo purposes, we default to JSS 1.
  const [studentClass, setStudentClass] = useState("JSS 1"); 
  const [timetableData, setTimetableData] = useState<IDaySchedule[]>([]);

  const { data: fetchedTimetable, isLoading: isLoadingTimetable } = useTimetable(studentClass);

  useEffect(() => {
    if (fetchedTimetable) {
      setTimetableData(fetchedTimetable.days);
    } else {
      setTimetableData([]);
    }
  }, [fetchedTimetable]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-Poppins">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-Lora text-[#05878F]">Class Timetable</h1>
          <p className="text-gray-600 text-sm">Viewing timetable for {loggedInStudentIdStr} ({studentClass})</p>
        </div>
      </div>

      {isLoadingTimetable ? (
        <div className="flex justify-center mt-20"><Loader /></div>
      ) : timetableData.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm">
          No timetable has been published yet for {studentClass}.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-6 border-b-2 border-gray-100 bg-gray-50">
              <div className="p-4 font-bold text-gray-500 border-r border-gray-100 flex items-center justify-center">Time / Day</div>
              {DAYS.map(day => (
                <div key={day} className="p-4 font-bold text-center border-r border-gray-100 last:border-r-0 text-[#05878F]">{day}</div>
              ))}
            </div>

            {/* Grid Body */}
            {timetableData[0]?.periods.map((_, periodIndex) => (
              <div key={periodIndex} className="grid grid-cols-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                
                {/* Time Column */}
                <div className="p-3 border-r border-gray-100 flex flex-col justify-center items-center text-sm font-medium text-gray-500 bg-[#ECFEFF]/30">
                  <span>{timetableData[0].periods[periodIndex].startTime}</span>
                  <span className="text-gray-300 text-xs">to</span>
                  <span>{timetableData[0].periods[periodIndex].endTime}</span>
                </div>

                {/* Day Columns */}
                {DAYS.map((_, dayIndex) => {
                  const period = timetableData[dayIndex].periods[periodIndex];
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`p-2 border-r border-gray-100 last:border-r-0 min-h-[100px] flex flex-col items-center justify-center relative
                        ${period.isBreak ? 'bg-[#FBEDD9]/30' : period.subject ? 'bg-blue-50/20' : 'bg-gray-50/30'}`}
                    >
                      {period.isBreak ? (
                        <span className="text-[#FF6B27] font-bold font-Lora text-center text-sm">{period.label || 'Break'}</span>
                      ) : (
                        <>
                          {period.subject && (
                            <span className="font-bold text-[#2C4084] text-center mb-1 line-clamp-2 leading-tight text-sm">
                              {period.subject.name || 'Subject'}
                            </span>
                          )}
                          {period.teacher && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border shadow-sm text-center line-clamp-1 mt-1 bg-white text-gray-600 border-gray-200`}>
                              {period.teacher.lastName} {period.teacher.firstName}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableGuardian;
