import { Appointment } from '../types';
import { DOCTORS, PROCEDURES } from './mockData';

export const sendAppointmentReminder = async (appointment: Appointment): Promise<{success: boolean, message: string}> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const doctor = DOCTORS.find(d => d.id === appointment.doctorId);
  const procedure = PROCEDURES.find(p => p.id === appointment.procedureId);
  const doctorName = doctor ? doctor.name : 'الطبيب';
  const procedureName = procedure ? procedure.title : 'موعد أسنان';
  const formattedDate = new Date(appointment.date).toLocaleDateString('en-GB');

  // Construct the message as per requirements
  const reminderMessage = `
    [محاكاة SMS/Email]
    إلى: ${appointment.patientPhone || appointment.patientName}
    --------------------------------
    مرحباً ${appointment.patientName}،
    تذكير بموعدك غداً في عيادة د. محمد.
    
    التفاصيل:
    - التاريخ: ${formattedDate}
    - الوقت: ${appointment.time}
    - الطبيب: ${doctorName}
    - الإجراء: ${procedureName}

    يرجى الحضور قبل الموعد بـ 10 دقائق.
    لإلغاء الموعد يرجى الدخول إلى حسابك أو الاتصال بنا.
  `;

  console.log(reminderMessage);

  return {
    success: true,
    message: 'تم إرسال التذكير بنجاح'
  };
};