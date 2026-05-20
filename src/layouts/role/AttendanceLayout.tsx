import React from 'react';
import { getRole } from '../../utils/authTokens';
import Attendance from '../../pages/dashboard/Attendance';
import AttendanceGuardian from '../../pages/guardian-dashboard/AttendanceGuardian';

const AttendanceLayout: React.FC = () => {
  const role = getRole();

  if (role === 'admin' || role === 'staff') {
    return <Attendance />;
  } else if (role === 'guardian') {
    return <AttendanceGuardian />;
  }

  return null;
};

export default AttendanceLayout;
