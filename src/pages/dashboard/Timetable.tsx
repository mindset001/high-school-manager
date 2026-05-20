import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getBaseClass, getSubjects, getStaffs } from "../../services/api/calls/getApis";
import { useTimetable, useSaveTimetable, IDaySchedule } from "../../services/api/timetable";
import Loader from "../../shared/Loader";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DEFAULT_PERIODS = [
  { startTime: "08:00", endTime: "08:45" },
  { startTime: "08:45", endTime: "09:30" },
  { startTime: "09:30", endTime: "10:15" },
  { startTime: "10:15", endTime: "10:45", isBreak: true, label: "Short Break" },
  { startTime: "10:45", endTime: "11:30" },
  { startTime: "11:30", endTime: "12:15" },
  { startTime: "12:15", endTime: "13:00" },
  { startTime: "13:00", endTime: "14:00", isBreak: true, label: "Lunch Break" },
  { startTime: "14:00", endTime: "14:45" },
  { startTime: "14:45", endTime: "15:30" },
];

const TimetableBuilder: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>("JSS 1");
  const [timetableData, setTimetableData] = useState<IDaySchedule[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCell, setEditCell] = useState<{ dayIndex: number; periodIndex: number } | null>(null);
  
  // Form State
  const [formSubject, setFormSubject] = useState("");
  const [formTeacher, setFormTeacher] = useState("");
  const [formIsBreak, setFormIsBreak] = useState(false);
  const [formLabel, setFormLabel] = useState("");

  // Queries
  const { data: classesData } = useQuery({ queryKey: ["classes"], queryFn: getBaseClass });
  const { data: subjectsData } = useQuery({ queryKey: ["subjects"], queryFn: getSubjects });
  const { data: staffsData } = useQuery({ queryKey: ["staffs"], queryFn: getStaffs });
  const { data: fetchedTimetable, isLoading: isLoadingTimetable } = useTimetable(selectedClass);
  
  const saveMutation = useSaveTimetable();

  const classesList = classesData?.data?.classes || [{ name: "JSS 1" }, { name: "JSS 2" }, { name: "JSS 3" }];
  const subjectsList = subjectsData?.data?.data || [];
  const staffsList = staffsData?.data?.data || [];

  // Initialize Timetable Data
  useEffect(() => {
    if (fetchedTimetable) {
      setTimetableData(fetchedTimetable.days);
    } else {
      // Create empty timetable with default periods
      const emptyDays: IDaySchedule[] = DAYS.map(day => ({
        dayOfWeek: day,
        periods: DEFAULT_PERIODS.map(p => ({
          startTime: p.startTime,
          endTime: p.endTime,
          isBreak: p.isBreak || false,
          label: p.label || "",
        }))
      }));
      setTimetableData(emptyDays);
    }
  }, [fetchedTimetable, selectedClass]);

  const handleCellClick = (dayIndex: number, periodIndex: number) => {
    const period = timetableData[dayIndex].periods[periodIndex];
    setEditCell({ dayIndex, periodIndex });
    setFormSubject(period.subject?._id || period.subject || "");
    setFormTeacher(period.teacher?._id || period.teacher || "");
    setFormIsBreak(period.isBreak || false);
    setFormLabel(period.label || "");
    setIsModalOpen(true);
  };

  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCell) return;

    const newTimetable = [...timetableData];
    const period = newTimetable[editCell.dayIndex].periods[editCell.periodIndex];

    period.isBreak = formIsBreak;
    period.label = formLabel;
    
    if (!formIsBreak) {
      period.subject = formSubject || undefined;
      period.teacher = formTeacher || undefined;
    } else {
      period.subject = undefined;
      period.teacher = undefined;
    }

    setTimetableData(newTimetable);
    setIsModalOpen(false);
  };

  const handleTimeChange = (periodIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const newTimetable = [...timetableData];
    newTimetable.forEach(day => {
      if (day.periods[periodIndex]) {
        day.periods[periodIndex][field] = value;
      }
    });
    setTimetableData(newTimetable);
  };

  const handleSaveTimetable = async () => {
    try {
      await saveMutation.mutateAsync({
        className: selectedClass,
        data: {
          class: selectedClass,
          term: "Current Term", // Can make this dynamic later
          days: timetableData,
        }
      });
      toast.success("Timetable saved successfully!");
    } catch (error) {
      toast.error("Failed to save timetable");
    }
  };

  const getSubjectName = (id: string) => {
    if (!id) return "";
    const subject = subjectsList.find((s: any) => s._id === id || s.id === id);
    return subject ? subject.name : id;
  };

  const getStaffName = (id: string) => {
    if (!id) return "";
    const staff = staffsList.find((s: any) => s._id === id || s.id === id);
    return staff ? `${staff.firstName} ${staff.lastName}` : id;
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-Poppins">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-Lora text-[#05878F]">Interactive Timetable Builder</h1>
          <p className="text-gray-600 text-sm">Assign subjects and teachers to class periods.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="border-2 border-gray-200 rounded-lg p-2 font-medium outline-none text-[#05878F]"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classesList.map((cls: any, i: number) => (
              <option key={i} value={cls.name || cls}>{cls.name || cls}</option>
            ))}
          </select>

          <button 
            onClick={handleSaveTimetable}
            disabled={saveMutation.isPending}
            className="bg-[#05878F] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#046A7E] transition-colors shadow-sm"
          >
            {saveMutation.isPending ? "Saving..." : "Save Timetable"}
          </button>
        </div>
      </div>

      {isLoadingTimetable ? (
        <div className="flex justify-center mt-20"><Loader /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-6 border-b-2 border-gray-100 bg-gray-50">
              <div className="p-4 font-bold text-gray-500 border-r border-gray-100 flex items-center justify-center">
                Time / Day
              </div>
              {DAYS.map(day => (
                <div key={day} className="p-4 font-bold text-center border-r border-gray-100 last:border-r-0 text-[#05878F]">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Body */}
            {timetableData.length > 0 && timetableData[0].periods.map((_, periodIndex) => (
              <div key={periodIndex} className="grid grid-cols-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                
                {/* Time Column */}
                <div className="p-3 border-r border-gray-100 flex flex-col justify-center items-center text-sm font-medium text-gray-500 bg-gray-50/50">
                  <input
                    type="time"
                    className="bg-transparent text-center border border-transparent hover:border-gray-200 focus:border-[#05878F] focus:ring-1 focus:ring-[#05878F] rounded outline-none w-full px-1"
                    value={timetableData[0].periods[periodIndex].startTime}
                    onChange={(e) => handleTimeChange(periodIndex, 'startTime', e.target.value)}
                  />
                  <span className="text-gray-300 text-xs">to</span>
                  <input
                    type="time"
                    className="bg-transparent text-center border border-transparent hover:border-gray-200 focus:border-[#05878F] focus:ring-1 focus:ring-[#05878F] rounded outline-none w-full px-1"
                    value={timetableData[0].periods[periodIndex].endTime}
                    onChange={(e) => handleTimeChange(periodIndex, 'endTime', e.target.value)}
                  />
                </div>

                {/* Day Columns */}
                {DAYS.map((_, dayIndex) => {
                  const period = timetableData[dayIndex].periods[periodIndex];
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`p-2 border-r border-gray-100 last:border-r-0 cursor-pointer min-h-[100px] flex flex-col items-center justify-center relative group
                        ${period.isBreak ? 'bg-orange-50' : period.subject ? 'bg-blue-50/30' : ''}`}
                      onClick={() => handleCellClick(dayIndex, periodIndex)}
                    >
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#05878F]/30 rounded transition-colors pointer-events-none"></div>
                      
                      {period.isBreak ? (
                        <span className="text-orange-500 font-bold font-Lora text-center">{period.label || 'Break'}</span>
                      ) : (
                        <>
                          {period.subject ? (
                            <span className="font-bold text-[#2C4084] text-center mb-1 line-clamp-2 leading-tight">
                              {getSubjectName(period.subject._id || period.subject) || 'Subject'}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs uppercase tracking-wider mb-1">+ Assign</span>
                          )}
                          
                          {period.teacher && (
                            <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200 mt-1 shadow-sm text-center line-clamp-1">
                              {getStaffName(period.teacher._id || period.teacher)}
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

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#05878F] p-4 text-white">
              <h2 className="text-lg font-bold font-Lora">
                Edit {DAYS[editCell?.dayIndex || 0]} Period
              </h2>
              <p className="text-sm opacity-80">
                {timetableData[editCell?.dayIndex || 0]?.periods[editCell?.periodIndex || 0]?.startTime} - 
                {timetableData[editCell?.dayIndex || 0]?.periods[editCell?.periodIndex || 0]?.endTime}
              </p>
            </div>
            
            <form onSubmit={handleModalSave} className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100 cursor-pointer" onClick={() => setFormIsBreak(!formIsBreak)}>
                <input 
                  type="checkbox" 
                  checked={formIsBreak} 
                  onChange={(e) => setFormIsBreak(e.target.checked)}
                  className="w-4 h-4 text-[#05878F] rounded focus:ring-[#05878F]"
                />
                <label className="text-sm font-medium text-gray-700 select-none cursor-pointer">This is a Break / Assembly period</label>
              </div>

              {formIsBreak ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g., Lunch Break)</label>
                  <input 
                    type="text" 
                    value={formLabel} 
                    onChange={(e) => setFormLabel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#05878F]/20 focus:border-[#05878F] outline-none transition-all" 
                    placeholder="Break"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select 
                      value={formSubject} 
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#05878F]/20 focus:border-[#05878F] outline-none transition-all bg-white"
                    >
                      <option value="">-- Select Subject --</option>
                      {subjectsList.map((sub: any) => (
                        <option key={sub._id || sub.id} value={sub._id || sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                    <select 
                      value={formTeacher} 
                      onChange={(e) => setFormTeacher(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#05878F]/20 focus:border-[#05878F] outline-none transition-all bg-white"
                    >
                      <option value="">-- Select Teacher --</option>
                      {staffsList.map((staff: any) => (
                        <option key={staff._id || staff.id} value={staff._id || staff.id}>
                          {staff.firstName} {staff.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-[#05878F] text-white font-medium rounded-lg hover:bg-[#046A7E] transition-colors shadow-sm">
                  Apply to Cell
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableBuilder;