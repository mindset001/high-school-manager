import React from 'react';
import { getRole } from '../../utils/authTokens';
import Timetable from '../../pages/dashboard/Timetable';
import TimetableStaff from '../../pages/staff-dashboard/TimetableStaff';
import TimetableGuardian from '../../pages/guardian-dashboard/TimetableGuardian';

const TimetableLayout: React.FC = () => {
  const role = getRole();

  if (role === 'admin') {
    return <Timetable />;
  } else if (role === 'staff') {
    return <TimetableStaff />;
  } else if (role === 'guardian') {
    return <TimetableGuardian />;
  }

  // Fallback
  return null;
};

export default TimetableLayout;
