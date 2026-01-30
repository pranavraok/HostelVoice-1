// =============================================
// LEAVE API - INDEX FILE
// =============================================
// Central export for all leave-related APIs

// Types
export * from './types';

// Student API
export { studentLeaveApi, caretakerStudentLeaveApi } from './student-api';

// Caretaker API
export { caretakerLeaveApi, adminCaretakerLeaveApi, getAllCaretakers } from './caretaker-api';
